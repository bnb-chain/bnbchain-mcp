import { describe, expect, test } from "bun:test"
import path from "node:path"

import { resolveDownloadDestination } from "./download-path"

const root = path.resolve("fixture-root")

describe("resolveDownloadDestination", () => {
  test("defaults to the root when no target directory is given", () => {
    expect(resolveDownloadDestination(undefined, "a.txt", root)).toBe(
      path.join(root, "a.txt")
    )
  })

  test("allows nested directories inside the root", () => {
    expect(resolveDownloadDestination("sub/dir", "a.txt", root)).toBe(
      path.join(root, "sub/dir", "a.txt")
    )
  })

  test("allows an absolute target directory inside the root", () => {
    const inside = path.join(root, "sub")
    expect(resolveDownloadDestination(inside, "a.txt", root)).toBe(
      path.join(inside, "a.txt")
    )
  })

  test("rejects a parent-relative target directory", () => {
    expect(() => resolveDownloadDestination("..", "a.txt", root)).toThrow(
      /escapes the download root/
    )
  })

  test("rejects a deep parent-relative target directory", () => {
    expect(() =>
      resolveDownloadDestination("../../../../etc", "a.txt", root)
    ).toThrow(/escapes the download root/)
  })

  test("rejects an absolute target directory outside the root", () => {
    const outside = path.resolve("other-dir")
    expect(() => resolveDownloadDestination(outside, "a.txt", root)).toThrow(
      /escapes the download root/
    )
  })

  test("flattens separators in the object name to a basename", () => {
    expect(resolveDownloadDestination(undefined, "folder/a.txt", root)).toBe(
      path.join(root, "a.txt")
    )
  })

  test("rejects object names whose basename is a dot segment", () => {
    expect(() => resolveDownloadDestination(undefined, "..", root)).toThrow(
      /Invalid object name/
    )
    expect(() => resolveDownloadDestination(undefined, "a/..", root)).toThrow(
      /Invalid object name/
    )
  })
})
