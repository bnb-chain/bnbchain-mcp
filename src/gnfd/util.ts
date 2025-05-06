export const generateString = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyz"

  let result = ""
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

/**
 * Utility functions for formatting and parsing values in GNFD services
 */
export const helpers = {
  // Format an object to JSON with proper handling of special types
  formatJson: (obj: unknown): string =>
    JSON.stringify(
      obj,
      (_, value) => {
        if (typeof value === "bigint") {
          return value.toString()
        }
        // Handle other types as needed
        return value
      },
      2
    )
}
