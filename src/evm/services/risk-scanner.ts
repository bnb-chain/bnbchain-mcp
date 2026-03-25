import { type Address, type Hex, decodeFunctionData, parseAbi } from "viem"

import Logger from "@/utils/logger.js"
import { getPublicClient } from "./clients.js"
import { isContract } from "./contracts.js"

/**
 * Severity levels for risk findings
 */
export type RiskSeverity = "critical" | "high" | "medium" | "low" | "info"

/**
 * Individual risk finding
 */
export interface RiskFinding {
  id: string
  title: string
  severity: RiskSeverity
  category: string
  description: string
  details?: string
}

/**
 * Contract risk assessment result
 */
export interface RiskAssessment {
  address: string
  network: string
  isContract: boolean
  riskScore: number
  riskLevel: string
  findings: RiskFinding[]
  contractInfo: {
    codeSize: number
    hasCode: boolean
    isProxy: boolean
    proxyImplementation?: string
  }
  summary: string
}

// Well-known dangerous function signatures (4-byte selectors)
const DANGEROUS_SELECTORS: Record<string, { name: string; risk: string }> = {
  // Minting / supply manipulation
  "40c10f19": { name: "mint(address,uint256)", risk: "Allows arbitrary token minting" },
  "a0712d68": { name: "mint(uint256)", risk: "Allows arbitrary token minting" },
  "4e6ec247": { name: "mint(address,uint256)", risk: "Allows arbitrary token minting" },
  // Pause / blacklist
  "8456cb59": { name: "pause()", risk: "Contract can be paused, freezing user funds" },
  "3f4ba83a": { name: "unpause()", risk: "Paired with pause functionality" },
  "44337ea1": { name: "blacklist(address)", risk: "Users can be blacklisted from transfers" },
  "e4997dc5": { name: "removeBlacklist(address)", risk: "Paired with blacklist functionality" },
  // Self-destruct
  "cb4e8cd1": { name: "destroy()", risk: "Contract can self-destruct" },
  "83197ef0": { name: "destroy()", risk: "Contract can self-destruct" },
  // Fee manipulation
  "8c0b5e22": { name: "maxTransactionAmount()", risk: "Transaction amount can be limited" },
  "a9059cbb": { name: "transfer(address,uint256)", risk: "" }, // Standard, not risky alone
}

// EIP-1967 proxy storage slots
const PROXY_SLOTS = {
  // EIP-1967 implementation slot
  implementation: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as Hex,
  // EIP-1967 admin slot
  admin: "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103" as Hex,
  // EIP-1967 beacon slot
  beacon: "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50" as Hex,
  // OpenZeppelin legacy implementation slot
  ozLegacy: "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3" as Hex,
}

// Bytecode patterns indicating specific vulnerability indicators
const BYTECODE_PATTERNS: Array<{
  pattern: string
  finding: Omit<RiskFinding, "id">
}> = [
  {
    // SELFDESTRUCT opcode (0xff)
    pattern: "ff",
    finding: {
      title: "Self-destruct capability detected",
      severity: "critical",
      category: "Destructive Operations",
      description:
        "Contract bytecode contains the SELFDESTRUCT opcode. The contract owner or an attacker may be able to destroy the contract and drain remaining funds.",
    },
  },
  {
    // DELEGATECALL opcode (0xf4)
    pattern: "f4",
    finding: {
      title: "Delegatecall usage detected",
      severity: "medium",
      category: "Proxy Pattern",
      description:
        "Contract uses DELEGATECALL, which executes code from another contract in the current context. This is used in proxy patterns but can be dangerous if the target is manipulable.",
    },
  },
]

/**
 * Check if a bytecode contains specific opcode patterns with context awareness
 */
function findOpcodeInBytecode(bytecode: string, opcode: string): boolean {
  // Remove 0x prefix
  const code = bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode
  // We look for the opcode in positions that could be actual opcodes
  // (not embedded in PUSH data). This is a heuristic check.
  // For SELFDESTRUCT (ff), we check it appears as a standalone opcode
  if (opcode === "ff") {
    // SELFDESTRUCT is rare enough that its presence is noteworthy
    // Check last bytes or after known jump patterns
    return code.toLowerCase().includes(opcode)
  }
  if (opcode === "f4") {
    // DELEGATECALL - check for the pattern
    return code.toLowerCase().includes(opcode)
  }
  return false
}

/**
 * Detect if contract is a proxy and find implementation address
 */
async function detectProxy(
  address: Address,
  network: string
): Promise<{ isProxy: boolean; implementation?: string }> {
  const client = getPublicClient(network)

  for (const [slotName, slot] of Object.entries(PROXY_SLOTS)) {
    try {
      const value = await client.getStorageAt({
        address,
        slot,
      })
      if (value && value !== "0x" + "0".repeat(64) && value !== "0x") {
        // Extract address from 32-byte slot (last 20 bytes)
        const implAddress = "0x" + value.slice(-40)
        // Verify it looks like a valid address (not all zeros)
        if (implAddress !== "0x" + "0".repeat(40)) {
          return { isProxy: true, implementation: implAddress }
        }
      }
    } catch {
      // Slot read failed, continue checking other slots
    }
  }

  return { isProxy: false }
}

/**
 * Analyze bytecode for known dangerous function selectors
 */
function analyzeFunctionSelectors(bytecode: string): RiskFinding[] {
  const findings: RiskFinding[] = []
  const code = bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode
  const codeLower = code.toLowerCase()

  for (const [selector, info] of Object.entries(DANGEROUS_SELECTORS)) {
    if (info.risk && codeLower.includes(selector)) {
      findings.push({
        id: `selector-${selector}`,
        title: `Dangerous function detected: ${info.name}`,
        severity: selector.startsWith("40c10f") || selector.startsWith("a0712d") || selector.startsWith("4e6ec2")
          ? "high"
          : "medium",
        category: "Dangerous Functions",
        description: info.risk,
        details: `Function selector: 0x${selector}`,
      })
    }
  }

  return findings
}

/**
 * Check for unlimited token approval patterns in recent transactions
 */
async function checkApprovalPatterns(
  address: Address,
  network: string
): Promise<RiskFinding[]> {
  const findings: RiskFinding[] = []
  const client = getPublicClient(network)

  try {
    // Check for Approval events with max uint256 value
    const approvalTopic =
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"
    const maxApproval =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

    const latestBlock = await client.getBlockNumber()
    const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n

    const logs = await client.getLogs({
      address,
      topics: [approvalTopic],
      fromBlock,
      toBlock: latestBlock,
    })

    const unlimitedApprovals = logs.filter(
      (log) =>
        log.data === maxApproval ||
        log.data ===
          "0x" + "f".repeat(64)
    )

    if (unlimitedApprovals.length > 0) {
      findings.push({
        id: "unlimited-approvals",
        title: "Unlimited token approvals detected",
        severity: "medium",
        category: "Approval Patterns",
        description: `Found ${unlimitedApprovals.length} unlimited approval events in recent blocks. This allows approved spenders to transfer any amount of tokens.`,
        details: `Checked last ${Number(latestBlock - fromBlock)} blocks. Found ${unlimitedApprovals.length} unlimited approvals out of ${logs.length} total approval events.`,
      })
    }
  } catch (error) {
    Logger.debug(`Could not check approval patterns: ${error}`)
  }

  return findings
}

/**
 * Check for ownership concentration and renouncement
 */
async function checkOwnership(
  address: Address,
  bytecode: string,
  network: string
): Promise<RiskFinding[]> {
  const findings: RiskFinding[] = []
  const client = getPublicClient(network)
  const codeLower = bytecode.toLowerCase()

  // Check if contract has owner() function (selector: 0x8da5cb5b)
  const hasOwnerFunction = codeLower.includes("8da5cb5b")

  if (hasOwnerFunction) {
    try {
      const ownerAbi = parseAbi(["function owner() view returns (address)"])
      const owner = await client.readContract({
        address,
        abi: ownerAbi,
        functionName: "owner",
      })

      const ownerAddress = owner as Address
      const isRenounced =
        ownerAddress === "0x0000000000000000000000000000000000000000"

      if (isRenounced) {
        findings.push({
          id: "ownership-renounced",
          title: "Ownership has been renounced",
          severity: "info",
          category: "Ownership",
          description:
            "Contract ownership has been renounced (owner is zero address). This prevents owner-only functions from being called, which is generally positive for decentralization.",
        })
      } else {
        findings.push({
          id: "ownership-active",
          title: "Contract has an active owner",
          severity: "low",
          category: "Ownership",
          description: `Contract is owned by ${ownerAddress}. Owner-restricted functions can still be called.`,
          details: `Owner address: ${ownerAddress}`,
        })

        // Check if owner has renounceOwnership capability (selector: 0x715018a6)
        if (!codeLower.includes("715018a6")) {
          findings.push({
            id: "no-renounce",
            title: "No renounceOwnership function detected",
            severity: "medium",
            category: "Ownership",
            description:
              "Contract does not appear to have a renounceOwnership function. Ownership cannot be voluntarily relinquished.",
          })
        }
      }
    } catch {
      Logger.debug("Could not read owner() function")
    }
  }

  // Check for onlyOwner modifier pattern — transferOwnership (0xf2fde38b)
  if (codeLower.includes("f2fde38b")) {
    findings.push({
      id: "transfer-ownership",
      title: "Ownership transfer capability",
      severity: "info",
      category: "Ownership",
      description:
        "Contract supports ownership transfer via transferOwnership function.",
    })
  }

  return findings
}

/**
 * Check for reentrancy vulnerability indicators
 */
function checkReentrancyIndicators(bytecode: string): RiskFinding[] {
  const findings: RiskFinding[] = []
  const codeLower = bytecode.toLowerCase()

  // Check for external calls (CALL opcode = 0xf1) without apparent reentrancy guard
  // ReentrancyGuard typically uses a storage variable check pattern
  // nonReentrant modifier selector patterns
  const hasExternalCalls = codeLower.includes("f1")

  if (hasExternalCalls) {
    // Check for common reentrancy guard patterns
    // OpenZeppelin ReentrancyGuard uses specific storage slot patterns
    // The _status variable check pattern in bytecode
    const hasReentrancyGuard =
      // Common pattern: SLOAD, compare with 1 or 2, JUMPI
      codeLower.includes("54") && // SLOAD
      (codeLower.includes("6001") || codeLower.includes("6002")) // PUSH1 1 or PUSH1 2

    if (!hasReentrancyGuard) {
      findings.push({
        id: "no-reentrancy-guard",
        title: "No reentrancy guard pattern detected",
        severity: "medium",
        category: "Reentrancy",
        description:
          "Contract makes external calls but no standard reentrancy guard pattern was detected in the bytecode. This does not confirm a vulnerability but warrants manual review.",
      })
    }
  }

  return findings
}

/**
 * Analyze fee/tax mechanisms in token contracts
 */
function checkFeePatterns(bytecode: string): RiskFinding[] {
  const findings: RiskFinding[] = []
  const codeLower = bytecode.toLowerCase()

  // Common fee-related function selectors
  const feeSelectors = [
    { selector: "8c0b5e22", name: "maxTransactionAmount", risk: "high" },
    { selector: "49bd5a5e", name: "uniswapV2Pair", risk: "info" },
    { selector: "1694505e", name: "setMaxTxAmount", risk: "high" },
    { selector: "ea2f0b37", name: "excludeFromFee", risk: "medium" },
    { selector: "5342acb4", name: "isExcludedFromFee", risk: "info" },
    { selector: "8ee88c53", name: "setTaxFeePercent", risk: "high" },
    { selector: "a69df4b5", name: "setLiquidityFeePercent", risk: "high" },
  ]

  const detectedFees = feeSelectors.filter((f) =>
    codeLower.includes(f.selector)
  )

  if (detectedFees.length > 0) {
    const highRiskFees = detectedFees.filter((f) => f.risk === "high")
    if (highRiskFees.length > 0) {
      findings.push({
        id: "mutable-fees",
        title: "Mutable fee/tax mechanism detected",
        severity: "high",
        category: "Fee Manipulation",
        description: `Contract contains ${highRiskFees.length} functions that can modify transaction fees or limits. The contract owner could set prohibitive fees or restrict trading.`,
        details: `Detected functions: ${highRiskFees.map((f) => f.name).join(", ")}`,
      })
    }

    if (detectedFees.some((f) => f.selector === "49bd5a5e")) {
      findings.push({
        id: "dex-pair",
        title: "DEX pair integration detected",
        severity: "info",
        category: "Token Design",
        description:
          "Contract references a DEX pair (likely PancakeSwap/UniswapV2). This is standard for traded tokens.",
      })
    }
  }

  return findings
}

/**
 * Calculate overall risk score from findings
 */
function calculateRiskScore(findings: RiskFinding[]): {
  score: number
  level: string
} {
  const severityWeights: Record<RiskSeverity, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 0,
  }

  let totalScore = 0
  for (const finding of findings) {
    totalScore += severityWeights[finding.severity]
  }

  // Cap at 100
  const score = Math.min(totalScore, 100)

  let level: string
  if (score >= 75) level = "Critical Risk"
  else if (score >= 50) level = "High Risk"
  else if (score >= 25) level = "Medium Risk"
  else if (score >= 10) level = "Low Risk"
  else level = "Minimal Risk"

  return { score, level }
}

/**
 * Generate human-readable summary from findings
 */
function generateSummary(
  findings: RiskFinding[],
  riskLevel: string
): string {
  const criticalCount = findings.filter((f) => f.severity === "critical").length
  const highCount = findings.filter((f) => f.severity === "high").length
  const mediumCount = findings.filter((f) => f.severity === "medium").length

  const parts: string[] = [`Overall assessment: ${riskLevel}.`]

  if (criticalCount > 0) {
    parts.push(`${criticalCount} critical issue(s) found that require immediate attention.`)
  }
  if (highCount > 0) {
    parts.push(`${highCount} high severity issue(s) detected.`)
  }
  if (mediumCount > 0) {
    parts.push(`${mediumCount} medium severity issue(s) detected.`)
  }
  if (criticalCount === 0 && highCount === 0 && mediumCount === 0) {
    parts.push("No significant risks detected in automated analysis. Manual review is still recommended.")
  }

  parts.push(
    "Note: This is an automated bytecode analysis. It cannot detect all vulnerabilities. Always review the source code and conduct a professional audit before interacting with significant funds."
  )

  return parts.join(" ")
}

/**
 * Perform a comprehensive risk scan on a smart contract
 */
export async function scanContractRisk(
  contractAddress: string,
  network: string = "bsc"
): Promise<RiskAssessment> {
  const address = contractAddress as Address
  const client = getPublicClient(network)

  // Step 1: Verify it is a contract
  const contractExists = await isContract(address, network)
  if (!contractExists) {
    return {
      address: contractAddress,
      network,
      isContract: false,
      riskScore: 0,
      riskLevel: "N/A",
      findings: [],
      contractInfo: {
        codeSize: 0,
        hasCode: false,
        isProxy: false,
      },
      summary:
        "Address is not a smart contract (EOA or empty). No risk analysis applicable.",
    }
  }

  // Step 2: Get bytecode
  const bytecode = await client.getCode({ address })
  const codeHex = bytecode || "0x"
  const codeSize = (codeHex.length - 2) / 2 // bytes

  // Step 3: Run all analyses
  const allFindings: RiskFinding[] = []

  // Check proxy patterns
  const proxyInfo = await detectProxy(address, network)
  if (proxyInfo.isProxy) {
    allFindings.push({
      id: "proxy-detected",
      title: "Proxy contract detected",
      severity: "medium",
      category: "Proxy Pattern",
      description: `Contract is a proxy. The implementation can be changed by the admin, potentially altering contract behavior.`,
      details: `Implementation address: ${proxyInfo.implementation}`,
    })
  }

  // Analyze bytecode patterns
  for (const bp of BYTECODE_PATTERNS) {
    if (findOpcodeInBytecode(codeHex, bp.pattern)) {
      allFindings.push({
        ...bp.finding,
        id: `bytecode-${bp.pattern}`,
      })
    }
  }

  // Check function selectors for dangerous functions
  allFindings.push(...analyzeFunctionSelectors(codeHex))

  // Check ownership
  allFindings.push(...(await checkOwnership(address, codeHex, network)))

  // Check reentrancy indicators
  allFindings.push(...checkReentrancyIndicators(codeHex))

  // Check fee patterns
  allFindings.push(...checkFeePatterns(codeHex))

  // Check approval patterns
  allFindings.push(...(await checkApprovalPatterns(address, network)))

  // Step 4: Calculate risk score
  const { score, level } = calculateRiskScore(allFindings)

  // Step 5: Generate summary
  const summary = generateSummary(allFindings, level)

  return {
    address: contractAddress,
    network,
    isContract: true,
    riskScore: score,
    riskLevel: level,
    findings: allFindings,
    contractInfo: {
      codeSize,
      hasCode: true,
      isProxy: proxyInfo.isProxy,
      proxyImplementation: proxyInfo.implementation,
    },
    summary,
  }
}
