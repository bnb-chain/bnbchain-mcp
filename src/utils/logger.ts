import * as util from "node:util"

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

type LogLevelStrings = keyof typeof LogLevel

let currentLevel: LogLevel = getLogLevelFromEnv()

function getLogLevelFromEnv(): LogLevel {
  const envLevel = (
    process.env.LOG_LEVEL || "INFO"
  ).toUpperCase() as LogLevelStrings
  return LogLevel[envLevel] ?? LogLevel.INFO
}

function shouldLog(level: LogLevel): boolean {
  return level >= currentLevel
}

function formatMessage(
  level: LogLevelStrings,
  message: string,
  meta?: unknown
): string {
  const timestamp = new Date().toISOString()
  const metaStr =
    meta !== undefined
      ? ` ${util.inspect(meta, { depth: 5, colors: true })}`
      : ""
  return `[${timestamp}] ${level}: ${message}${metaStr}`
}

const Logger = {
  setLogLevel(level: LogLevelStrings) {
    currentLevel = LogLevel[level]
  },
  debug(message: string, meta?: unknown) {
    if (shouldLog(LogLevel.DEBUG)) {
      console.debug(formatMessage("DEBUG", message, meta))
    }
  },
  info(message: string, meta?: unknown) {
    if (shouldLog(LogLevel.INFO)) {
      console.info(formatMessage("INFO", message, meta))
    }
  },
  warn(message: string, meta?: unknown) {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage("WARN", message, meta))
    }
  },
  error(message: string, meta?: unknown) {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(formatMessage("ERROR", message, meta))
    }
  },
  getLevel(): LogLevelStrings {
    return LogLevel[currentLevel] as LogLevelStrings
  }
}

export default Logger
