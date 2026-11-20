import path from "node:path"

/**
 * Confine caller-controlled download destinations to an operator-configured
 * root, because MCP tool arguments are chosen by the model and can be steered
 * by prompt injection in untrusted content (CWE-22).
 */
export const resolveDownloadDestination = (
  targetPath: string | undefined,
  objectName: string,
  root: string = process.env.GNFD_DOWNLOAD_ROOT ?? process.cwd()
): string => {
  const resolvedRoot = path.resolve(root)
  // Greenfield object names may contain separators; only the basename is a
  // safe local file name, and "." / ".." basenames would still escape.
  const safeName = path.basename(objectName)
  if (!safeName || safeName === "." || safeName === "..") {
    throw new Error(`Invalid object name: ${objectName}`)
  }
  const dir = targetPath ? path.resolve(resolvedRoot, targetPath) : resolvedRoot
  const filePath = path.resolve(dir, safeName)
  for (const candidate of [dir, filePath]) {
    const rel = path.relative(resolvedRoot, candidate)
    if (
      rel === ".." ||
      rel.startsWith(`..${path.sep}`) ||
      path.isAbsolute(rel)
    ) {
      throw new Error(
        `Download destination escapes the download root: ${candidate}`
      )
    }
  }
  return filePath
}
