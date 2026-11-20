import { type Stats, statSync } from "node:fs"
import path from "node:path"

/**
 * Resolve an upload source path and confine it to the operator-configured
 * root so gnfd_create_file cannot read arbitrary server-side files
 * (CWE-22, read side; #75). Lexical containment only: a symlink inside
 * the root that points outside is not followed-and-rejected here.
 */
export const resolveUploadSource = (
  filePath: string,
  root: string = process.env.GNFD_UPLOAD_ROOT ?? process.cwd()
): string => {
  const resolvedRoot = path.resolve(root)
  const resolved = path.resolve(filePath)
  const rel = path.relative(resolvedRoot, resolved)

  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
    throw new Error(`filePath resolves outside the upload root: ${filePath}`)
  }

  let stats: Stats
  try {
    stats = statSync(resolved)
  } catch {
    throw new Error(`filePath does not exist: ${filePath}`)
  }
  if (!stats.isFile()) {
    throw new Error(`filePath is not a regular file: ${filePath}`)
  }

  return resolved
}
