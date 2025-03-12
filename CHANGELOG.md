# Change Log

All notable changes to the "tenvy" extension will be documented in this file.

## [0.0.3] - 2025-03-12

### Added
- Added support for detecting and using the default shell in VS Code
- Added PowerShell execution policy adjustment for PowerShell terminals
- Added specific activation commands for different shell types (CMD, PowerShell, etc.)

### Fixed
- Fixed an issue with multiple status bar items appearing in VS Code

## [0.0.2] - 2025-03-12

### Added
- Compatibility with VS Code 1.84 and above
- Added Tenvy logo as the extension icon

### Changed
- Updated link in README to use GitHub asset for "Keep a Changelog" recommendations
- Updated package.json to use VS Code 1.84.0 compatibility

## [0.0.1] - 2025-03-11

### Added
- Initial release of Tenvy
- Automatic detection of Python virtual environments in workspace
- Commands for activating and selecting environments
- Status bar integration showing the active environment with color indicators

### Fixed
- Improved virtual environment detection (searches in subdirectories)
- Added command to show status bar button
- Fixed PowerShell activation to use Activate.ps1 script for proper environment display
- Added command to deactivate the current environment
- Added command to create a new virtual environment
- Added command to install packages from requirements.txt
- Enhanced status bar with options menu for environment management
- Auto-prompt to install requirements after creating a new environment
