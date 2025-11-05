#!/usr/bin/env node

/**
 * Function Health MCP Server
 *
 * Provides access to Function Health API through Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOL_DEFINITIONS } from "./tool-definitions.js";
import { FunctionHealthClient } from "./functionhealth-client.js";
import { FunctionHealthLogger, ParameterProcessor } from "./utils.js";
import { SERVER_CONFIG } from "./server-config.js";
import { formatHealthData, formatRequisitions, formatResults } from "./response-formatter.js";

class FunctionHealthServer {
  constructor() {
    this.server = new Server(
      {
        name: SERVER_CONFIG.name,
        version: SERVER_CONFIG.version,
      },
      {
        capabilities: SERVER_CONFIG.capabilities,
      }
    );

    // Don't initialize the Function Health client here - do it lazily when first needed
    // This allows the server to start even without an auth token configured
    this.functionHealthClient = null;
    this.setupHandlers();
  }

  // Lazy initialization of Function Health client
  getFunctionHealthClient() {
    if (!this.functionHealthClient) {
      const email = process.env.FUNCTION_HEALTH_EMAIL;
      const password = process.env.FUNCTION_HEALTH_PASSWORD;
      if (!email || !password) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "FUNCTION_HEALTH_EMAIL and FUNCTION_HEALTH_PASSWORD environment variables are required. " +
          "Please configure your credentials in Claude Desktop settings."
        );
      }
      this.functionHealthClient = new FunctionHealthClient(email, password);
    }
    return this.functionHealthClient;
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOL_DEFINITIONS,
    }));

    // Execute tool requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Process parameters for consistency and validation
        const processedArgs = ParameterProcessor.process(args || {});

        // Execute the tool
        const result = await this.executeTool(name, processedArgs);

        return {
          content: [
            {
              type: "text",
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        FunctionHealthLogger.error(`Tool execution failed: ${name}`, {
          error: error.message,
          args: args
        });
        throw error;
      }
    });

    // Error handling
    this.server.onerror = (error) => {
      FunctionHealthLogger.error("MCP Server Error", {
        error: error.message,
        stack: error.stack
      });
    };

    // Graceful shutdown
    process.on("SIGINT", async () => {
      FunctionHealthLogger.info("Received SIGINT, shutting down gracefully");
      await this.server.close();
      process.exit(0);
    });
  }

  async executeTool(name, args) {
    FunctionHealthLogger.debug(`Executing tool: ${name}`, { args });

    // Get the client (will throw error if auth token not configured)
    const client = this.getFunctionHealthClient();

    switch (name) {
      // ============================================================
      // Combined Health Data
      // ============================================================
      case "get_health_data":
        {
          const result = await client.getHealthData();
          return formatHealthData(result);
        }

      // ============================================================
      // Lab Requisitions
      // ============================================================
      case "get_requisitions":
        {
          const result = await client.getRequisitions(false);
          return formatRequisitions(result);
        }

      // ============================================================
      // Lab Results
      // ============================================================
      case "get_results":
        {
          const result = await client.getResults();
          return formatResults(result);
        }

      // ============================================================
      // Download Requisition PDF
      // ============================================================
      case "download_requisition":
        {
          const { url } = args;
          if (!url) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              "URL parameter is required"
            );
          }
          const result = await client.getPdf(url);
          // Return the PDF data as base64 string
          return {
            url: result.url,
            size: result.size,
            contentType: result.contentType,
            data: result.data
          };
        }

      // ============================================================
      // Unknown tool
      // ============================================================
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    FunctionHealthLogger.info("Function Health MCP server running on stdio");
  }
}

// Start the server
const server = new FunctionHealthServer();
server.start().catch((error) => {
  FunctionHealthLogger.error("Server startup failed", { error: error.message });
  process.exit(1);
});
