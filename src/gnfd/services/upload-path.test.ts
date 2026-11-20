import { afterAll, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { resolveUploadSource } from "./upload-path"

const base = mkdtempSync(path.join(tmpdir(), "gnfd-upload-"))
const root = path.join(base, "root")
const nestedDir = path.join(root, "nested")
const outsideDir = path.join(base, "outside")
mkdirSync(nestedDir, { recursive: true })
mkdirSync(outsideDir)
writeFileSync(path.join(root, "file.txt"), "root")
writeFileSync(path.join(nestedDir, "file.txt"), "nested")
writeFileSync(path.join(outsideDir, "file.txt"), "outside")

afterAll(() => {
  rmSync(base, { recursive: true, force: true })
})

test("accepts a file inside the upload root", () => {
  const target = path.join(root, "file.txt")
  expect(resolveUploadSource(target, root)).toBe(path.resolve(target))
})

test("accepts a nested file inside the upload root", () => {
  const target = path.join(nestedDir, "file.txt")
  expect(resolveUploadSource(target, root)).toBe(path.resolve(target))
})

test("accepts a dot-segment path that stays inside the root", () => {
  const messy = path.join(root, "nested", "..", "file.txt")
  expect(resolveUploadSource(messy, root)).toBe(path.resolve(root, "file.txt"))
})

test("rejects a parent-relative path escaping the root", () => {
  expect(() =>
    resolveUploadSource(path.join(root, "..", "outside", "file.txt"), root)
  ).toThrow(/outside the upload root/)
})

test("rejects a deep parent-relative path escaping the root", () => {
  expect(() =>
    resolveUploadSource(
      path.join(nestedDir, "..", "..", "outside", "file.txt"),
      root
    )
  ).toThrow(/outside the upload root/)
})

test("rejects an absolute path outside the root", () => {
  expect(() =>
    resolveUploadSource(path.join(outsideDir, "file.txt"), root)
  ).toThrow(/outside the upload root/)
})

test("rejects a missing file inside the root", () => {
  expect(() =>
    resolveUploadSource(path.join(root, "missing.txt"), root)
  ).toThrow(/does not exist/)
})

test("rejects a directory inside the root", () => {
  expect(() => resolveUploadSource(nestedDir, root)).toThrow(
    /not a regular file/
  )
})

test("honors GNFD_UPLOAD_ROOT when no root argument is given", () => {
  const prev = process.env.GNFD_UPLOAD_ROOT
  process.env.GNFD_UPLOAD_ROOT = root
  try {
    const target = path.join(root, "file.txt")
    expect(resolveUploadSource(target)).toBe(path.resolve(target))
    expect(() =>
      resolveUploadSource(path.join(outsideDir, "file.txt"))
    ).toThrow(/outside the upload root/)
  } finally {
    if (prev === undefined) {
      Reflect.deleteProperty(process.env, "GNFD_UPLOAD_ROOT")
    } else {
      process.env.GNFD_UPLOAD_ROOT = prev
    }
  }
})
