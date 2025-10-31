# Function Health (Unofficial) - Claude Desktop Extension

Claude Desktop Extension for [Function Health](https://functionhealth.com), the health biomarker tracking and wellness platform.

> **Note:** This is an unofficial extension and is not affiliated with or endorsed by Function Health.

## Overview

This extension provides seamless integration between Claude Desktop and Function Health. Access your biomarker test results, track health metrics from wearable devices, and analyze trends over time directly from Claude conversations.

## Features

- **Biomarker Results**: View detailed biomarker test results including current values, optimal ranges, historical data, and trends
- **Health Metrics**: Access daily health metrics from wearable devices (calories, steps, sleep, heart rate, etc.)
- **Trend Analysis**: Track changes in biomarkers and health metrics over time
- **Comprehensive Data**: Get full access to categories, reference ranges, and historical comparisons

## Requirements

- Node.js 18.0.0 or higher
- Claude Desktop with MCPB support
- Active Function Health account
- Function Health login credentials (email and password)

## Installation

### Installing the Extension

1. Download the latest `.mcpb` file from the releases page
2. Open Claude Desktop settings
3. Navigate to the Extensions section
4. Click "Install Extension" and select the downloaded `.mcpb` file
5. When prompted, enter your Function Health email and password
6. Restart Claude Desktop

The extension will automatically handle authentication by logging in with your credentials and obtaining a Bearer token as needed.

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/mbmccormick/functionhealth-mcpb.git
cd functionhealth-mcpb

# Install dependencies
npm install

# Configure your credentials
cp .mcp.json.example .mcp.json
# Edit .mcp.json and add your Function Health email and password
```

### Testing Locally

```bash
# Run the server in development mode (with debug logging)
npm run dev

# Or run normally
npm start
```

### Building

```bash
# Validate the code
npm run validate

# Package the extension
npm run package
```

## Available Tools

### `get_health_data`

Get comprehensive health data including biomarker test results (blood test values, optimal ranges, historical data, trends) and wearable metrics (activity, sleep, calories, heart rate, and other daily measurements). Returns combined data from both Function Health lab tests and connected wearable devices.

**Example:**
```
Show me all my health data
```

### `get_requisitions`

Get list of lab test requisitions with detailed visit and biomarker data. Each requisition includes the test date and available report URLs for accessing PDF documents.

**Example:**
```
Show me my lab requisitions
```

### `get_results`

Get list of lab test results with detailed visit information, biomarker measurements, physician notes, and review status. Includes comprehensive biomarker details for each visit.

**Example:**
```
Show me my recent lab results
```

### `download_requisition`

Download a lab requisition PDF report from Function Health. Provide the report path obtained from the `get_requisitions` tool. Returns the PDF as base64-encoded data.

**Parameters:**
- `url` (required): The PDF report path from a requisition (e.g., 'DiagnosticReport/31b8f469-6061-438c-a0d3-079b6f4629ea/...')

**Example:**
```
Download the PDF report from my latest requisition
```

## Usage Examples

Once installed, you can interact with Function Health through Claude:

- "Show me an overview of my latest biomarker test results"
- "Which of my biomarkers are out of range?"
- "What's my average daily calorie burn this week?"
- "Compare my cortisol levels from my last two tests"
- "Show me my sleep data from the past 7 days"
- "Show me my lab requisitions"
- "Show me my recent lab results"
- "Download the PDF report from my latest requisition"

## Privacy & Security

- Your Function Health credentials are stored securely in Claude Desktop's settings
- The extension automatically handles authentication by obtaining Bearer tokens as needed
- All API requests are made directly from your machine to Function Health's servers
- No data is sent to third parties
- The extension only accesses data that you already have access to in your Function Health account

## Troubleshooting

### "FUNCTION_HEALTH_EMAIL and FUNCTION_HEALTH_PASSWORD environment variables are required"

This means your credentials are not configured. Make sure you've added them in Claude Desktop settings or in your `.mcp.json` file for local development.

### "Function Health login failed"

Verify that your email and password are correct. If you've recently changed your password, update your credentials in Claude Desktop settings.

### "Function Health API request timed out"

The Function Health API may be temporarily unavailable or responding slowly. Try again in a few moments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Disclaimer

This is an unofficial extension and is not affiliated with, endorsed by, or connected to Function Health in any way. Use at your own risk. Always verify important health information with your healthcare provider.

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/mbmccormick/functionhealth-mcpb/issues) on GitHub.
