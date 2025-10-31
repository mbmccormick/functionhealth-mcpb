/**
 * Function Health API Client
 *
 * Handles all communication with the Function Health API
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { FunctionHealthLogger } from "./utils.js";
import { SERVER_CONFIG } from "./server-config.js";

export class FunctionHealthClient {
  constructor(email, password) {
    if (!email || !password) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "Function Health email and password are required. Set the FUNCTION_HEALTH_EMAIL and FUNCTION_HEALTH_PASSWORD environment variables."
      );
    }

    this.email = email;
    this.password = password;
    this.authToken = null;
    this.baseUrl = SERVER_CONFIG.api.baseUrl;
    this.timeout = SERVER_CONFIG.api.timeout;
    this.defaultHeaders = SERVER_CONFIG.api.headers;
  }

  /**
   * Login to Function Health and obtain Bearer token
   */
  async login() {
    const url = `${this.baseUrl}/api/v1/login`;
    const startTime = Date.now();

    const options = {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.email,
        password: this.password
      }),
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      FunctionHealthLogger.debug(`Function Health Login Request`);

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        FunctionHealthLogger.error(`Function Health Login Error: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          duration: `${duration}ms`
        });

        throw new McpError(
          ErrorCode.InternalError,
          `Function Health login failed (${response.status}): ${errorData.error?.detail || response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.idToken) {
        throw new McpError(
          ErrorCode.InternalError,
          'Login response did not contain idToken'
        );
      }

      this.authToken = result.idToken;

      FunctionHealthLogger.debug(`Function Health Login Success`, {
        duration: `${duration}ms`
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        FunctionHealthLogger.error(`Function Health Login Timeout`, {
          duration: `${duration}ms`,
          timeout: this.timeout
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Function Health login timed out after ${this.timeout}ms`
        );
      }

      if (error instanceof McpError) {
        throw error;
      }

      FunctionHealthLogger.error(`Function Health Login Failed`, {
        error: error.message,
        duration: `${duration}ms`
      });

      throw new McpError(
        ErrorCode.InternalError,
        `Function Health login failed: ${error.message}`
      );
    }
  }

  /**
   * Ensure we have a valid auth token (login if needed)
   */
  async ensureAuthenticated() {
    if (!this.authToken) {
      await this.login();
    }
  }

  /**
   * Make a request to the Function Health API
   */
  async request(method, endpoint, data = null, additionalHeaders = {}) {
    // Ensure we're authenticated before making the request
    await this.ensureAuthenticated();

    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    const options = {
      method,
      headers: {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...additionalHeaders
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      FunctionHealthLogger.debug(`Function Health API Request: ${method} ${endpoint}`, { data });

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // If we get a 401, the token might have expired - clear it and retry once
        if (response.status === 401 && this.authToken) {
          FunctionHealthLogger.debug(`Received 401, attempting to re-authenticate`);
          this.authToken = null;
          await this.ensureAuthenticated();
          // Retry the request with new token
          return await this.request(method, endpoint, data, additionalHeaders);
        }

        FunctionHealthLogger.error(`Function Health API Error: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          duration: `${duration}ms`
        });

        throw new McpError(
          ErrorCode.InternalError,
          `Function Health API error (${response.status}): ${errorData.error?.detail || response.statusText}`
        );
      }

      const result = await response.json();

      FunctionHealthLogger.debug(`Function Health API Response: ${method} ${endpoint}`, {
        duration: `${duration}ms`,
        dataSize: JSON.stringify(result).length
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        FunctionHealthLogger.error(`Function Health API Timeout: ${method} ${endpoint}`, {
          duration: `${duration}ms`,
          timeout: this.timeout
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Function Health API request timed out after ${this.timeout}ms`
        );
      }

      if (error instanceof McpError) {
        throw error;
      }

      FunctionHealthLogger.error(`Function Health API Request Failed: ${method} ${endpoint}`, {
        error: error.message,
        duration: `${duration}ms`
      });

      throw new McpError(
        ErrorCode.InternalError,
        `Function Health API request failed: ${error.message}`
      );
    }
  }

  // ============================================================
  // Biomarkers
  // ============================================================

  async getBiomarkers() {
    return await this.request('GET', '/api/v1/results-report');
  }

  // ============================================================
  // Metrics
  // ============================================================

  async getMetrics() {
    // Note: This endpoint requires x-user-tz header with user's timezone
    // Using America/Chicago as default based on the sample request
    const timezone = process.env.USER_TIMEZONE || 'America/Chicago';

    return await this.request('GET', '/api/v2/wearables/metrics', null, {
      'x-user-tz': timezone
    });
  }

  // ============================================================
  // Combined Health Data
  // ============================================================

  async getHealthData() {
    // Fetch both biomarkers and metrics in parallel for better performance
    const [biomarkers, metrics] = await Promise.all([
      this.getBiomarkers(),
      this.getMetrics()
    ]);

    return {
      biomarkers,
      metrics
    };
  }

  // ============================================================
  // Requisitions
  // ============================================================

  async getRequisitions(pending = false) {
    return await this.request('GET', `/api/v1/requisitions?pending=${pending}`);
  }

  // ============================================================
  // Results
  // ============================================================

  async getResults() {
    return await this.request('GET', '/api/v1/results');
  }

  // ============================================================
  // PDF Documents
  // ============================================================

  async getPdf(url) {
    // Ensure we're authenticated before making the request
    await this.ensureAuthenticated();

    // Use the result endpoint with POST method
    const fullUrl = `${this.baseUrl}/api/v1/result`;
    const startTime = Date.now();

    const options = {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: url
      }),
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      FunctionHealthLogger.debug(`Function Health PDF Request: ${url}`);

      const response = await fetch(fullUrl, options);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        // If we get a 401, the token might have expired - clear it and retry once
        if (response.status === 401 && this.authToken) {
          FunctionHealthLogger.debug(`Received 401, attempting to re-authenticate`);
          this.authToken = null;
          await this.ensureAuthenticated();
          // Retry the request with new token
          return await this.getPdf(url);
        }

        const errorData = await response.text().catch(() => '');
        FunctionHealthLogger.error(`Function Health PDF Error: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          duration: `${duration}ms`
        });

        throw new McpError(
          ErrorCode.InternalError,
          `Function Health PDF request failed (${response.status}): ${response.statusText}`
        );
      }

      // Get the PDF as a buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      FunctionHealthLogger.debug(`Function Health PDF Response`, {
        duration: `${duration}ms`,
        size: buffer.length
      });

      return {
        url: url,
        size: buffer.length,
        contentType: response.headers.get('content-type') || 'application/pdf',
        data: buffer.toString('base64')
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        FunctionHealthLogger.error(`Function Health PDF Timeout`, {
          duration: `${duration}ms`,
          timeout: this.timeout
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Function Health PDF request timed out after ${this.timeout}ms`
        );
      }

      if (error instanceof McpError) {
        throw error;
      }

      FunctionHealthLogger.error(`Function Health PDF Request Failed`, {
        error: error.message,
        duration: `${duration}ms`
      });

      throw new McpError(
        ErrorCode.InternalError,
        `Function Health PDF request failed: ${error.message}`
      );
    }
  }
}
