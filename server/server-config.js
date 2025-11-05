/**
 * Function Health MCP Server Configuration
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get package.json version dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

export const SERVER_CONFIG = {
  name: "functionhealth-mcpb",
  version: packageJson.version,
  capabilities: {
    tools: {},
  },
  api: {
    baseUrl: "https://production-member-app-mid-lhuqotpy2a-ue.a.run.app",
    timeout: 30000,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      "fe-app-version": "0.84.61",
      "Origin": "https://my.functionhealth.com",
      "Referer": "https://my.functionhealth.com/",
      "X-Backend-Skip-Cache": "true"
    }
  }
};
