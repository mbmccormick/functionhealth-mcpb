/**
 * MCP Tool Definitions for Function Health API
 *
 * Defines all available tools with their parameters and descriptions
 */

export const TOOL_DEFINITIONS = [
  // ============================================================
  // Combined Health Data
  // ============================================================
  {
    name: "get_health_data",
    description: "Get comprehensive health data including biomarker test results (blood test values, optimal ranges, historical data, trends) and wearable metrics (activity, sleep, calories, heart rate, and other daily measurements). Returns combined data from both Function Health lab tests and connected wearable devices.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  // ============================================================
  // Lab Requisitions
  // ============================================================
  {
    name: "get_requisitions",
    description: "Get list of lab test requisitions with detailed visit and biomarker data. Each requisition includes the test date and available report URLs for accessing PDF documents.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  // ============================================================
  // Lab Results
  // ============================================================
  {
    name: "get_results",
    description: "Get list of lab test results with detailed visit information, biomarker measurements, physician notes, and review status. Includes comprehensive biomarker details for each visit.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  // ============================================================
  // Download Requisition PDF
  // ============================================================
  {
    name: "download_requisition",
    description: "Download a lab requisition PDF report from Function Health. The URL parameter should be the report path obtained from the get_requisitions tool (e.g., 'DiagnosticReport/...'). Returns the PDF as base64-encoded data.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The PDF report path/URL from a requisition (e.g., 'DiagnosticReport/31b8f469-6061-438c-a0d3-079b6f4629ea/...')"
        }
      },
      required: ["url"]
    }
  }
];
