import { Mime } from "mime"
import otherTypes from "mime/types/other.js"
import standardTypes from "mime/types/standard.js"

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
 * Standard response type for GNFD operations
 */
export type ApiResponse<T = unknown> = {
  status: "success" | "error"
  message?: string
  data?: T
}

/**
 * Response utility for standardizing API responses
 */
export const response = {
  /**
   * Create a success response
   * @param dataOrMessage Success data or message
   * @param data Optional data when first parameter is a message
   */
  success: <T = void>(dataOrMessage?: T | string, data?: T): ApiResponse<T> => {
    // If dataOrMessage is a string, it's the message
    if (typeof dataOrMessage === "string") {
      return {
        status: "success",
        message: dataOrMessage,
        ...(data !== undefined ? { data } : {})
      }
    }

    // If dataOrMessage is not a string, it's the data
    return {
      status: "success",
      ...(dataOrMessage !== undefined ? { data: dataOrMessage as T } : {})
    }
  },

  /**
   * Create an error response
   * @param message Error message
   */
  fail: <T = void>(message: string): ApiResponse<T> => {
    return {
      status: "error",
      message
    }
  }
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

const mime = new Mime(standardTypes, otherTypes)
mime.define(
  {
    "application/javascript": ["js", "ts", "jsx", "tsx", "mjs"]
  },
  true
)

export const getMimeType = (path: string) => {
  return mime.getType(path)
}
