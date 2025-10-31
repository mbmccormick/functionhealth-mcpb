/**
 * Utility functions for Function Health MCP Server
 */

/**
 * Logger utility with different levels
 */
export class FunctionHealthLogger {
  static debug(message, data = {}) {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${message}`, JSON.stringify(data, null, 2));
    }
  }

  static info(message, data = {}) {
    console.error(`[INFO] ${message}`, data ? JSON.stringify(data) : "");
  }

  static warn(message, data = {}) {
    console.error(`[WARN] ${message}`, JSON.stringify(data, null, 2));
  }

  static error(message, data = {}) {
    console.error(`[ERROR] ${message}`, JSON.stringify(data, null, 2));
  }
}
