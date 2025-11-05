# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-01-05

### Fixed
- **CRITICAL**: Reverted manifest schema from 0.3 back to 0.2 for Claude Desktop compatibility
- Claude Desktop v1.0.211 only supports manifest version 0.2 (0.3 support coming in future release)

## [1.1.0] - 2025-01-05

### Added
- Added `InputValidator` class for robust input validation
- Added `ParameterProcessor` class for consistent parameter handling
- Tool metadata annotations (`readOnlyHint`) for MCP Directory compliance

### Changed
- **BREAKING**: Upgraded manifest schema from 0.2 to 0.3
- Updated to latest `@anthropic-ai/mcpb` package (2.0.1)
- Refactored server configuration to dynamically read version from package.json
- Improved logger consistency - removed inconsistent JSON.stringify usage
- Enhanced parameter processing in request handler

### Fixed
- Consistent logging behavior across all log levels
- Server configuration version now auto-syncs with package.json

## [1.0.0] - 2024-10-31

### Added
- Initial release
- Function Health API integration
- Tools for biomarker data, lab results, and requisitions
- PDF download support for lab reports
- Wearable device metrics integration
