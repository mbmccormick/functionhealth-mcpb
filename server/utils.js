/**
 * Utility functions for Function Health MCP Server
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Logger utility with different levels
 */
export class FunctionHealthLogger {
  static debug(message, data = {}) {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${message}`, data);
    }
  }

  static info(message, data = {}) {
    console.error(`[INFO] ${message}`, data);
  }

  static warn(message, data = {}) {
    console.error(`[WARN] ${message}`, data);
  }

  static error(message, data = {}) {
    console.error(`[ERROR] ${message}`, data);
  }
}

export class InputValidator {
  /**
   * Validate string input
   */
  static validateStringInput(value, fieldName) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    return value;
  }

  /**
   * Validate date input format
   */
  static validateDateInput(value, fieldName) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
    }

    const date = new Date(value + 'T00:00:00');
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} is not a valid date`);
    }

    return value;
  }

  /**
   * Validate array input
   */
  static validateArrayInput(value, fieldName) {
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array`);
    }

    for (const item of value) {
      if (typeof item !== 'string') {
        throw new Error(`${fieldName} must contain only strings`);
      }
    }

    return value;
  }

  /**
   * Validate number input
   */
  static validateNumberInput(value, fieldName) {
    if (typeof value !== 'number') {
      throw new Error(`${fieldName} must be a number`);
    }

    return value;
  }
}

export class ParameterProcessor {
  /**
   * Process and validate parameters for API execution
   */
  static process(params) {
    const processed = { ...params };

    // Basic parameter validation can be added here as needed
    // For Function Health, most validation happens at the API level

    return processed;
  }
}
