# Tenvy v0.0.2 - Python Environment Activator

Tenvy is a Visual Studio Code extension created by Daniel Lopez Mella that automatically detects and activates Python virtual environments in your workspace. It simplifies the workflow for Python developers by providing easy access to virtual environment activation directly from VS Code.

GitHub Repository: https://github.com/danilopezmella/tenvy

## Features

- **Automatic Detection**: Automatically finds Python virtual environments in your workspace
- **Quick Activation**: Activate virtual environments with a single command
- **Environment Selection**: Choose from multiple detected environments
- **Environment Deactivation**: Deactivate the current environment with a single command
- **Environment Creation**: Create a new virtual environment with a single click
- **Package Installation**: Install packages from requirements.txt with a single click
- **Status Bar Integration**: Shows the currently active environment in the status bar with options menu
- **Auto-Activation**: Optionally activate environments automatically when opening a workspace
- **PowerShell Integration**: Properly activates environments in PowerShell with the green environment indicator

## Requirements

- Visual Studio Code 1.84.0 or higher
- Python installed on your system
- Python virtual environments in your workspace (created with venv, virtualenv, etc.)

## Extension Settings

This extension contributes the following settings:

* `tenvy.activateOnOpen`: Enable/disable automatic activation of virtual environments when opening a workspace
* `tenvy.detectedFolders`: Array of folder names to look for as virtual environments (default: [".venv", "venv", "env"])

## Usage

### Manual Activation

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Tenvy: Activate Environment" and press Enter
3. If multiple environments are found, select one from the quick pick menu

### Selecting a Different Environment

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Tenvy: Select Environment" and press Enter
3. Select an environment from the quick pick menu

### Deactivating the Environment

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Tenvy: Deactivate Environment" and press Enter
3. The current environment will be deactivated

### Creating a New Environment

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Tenvy: Create New Environment" and press Enter
3. A new virtual environment named ".venv" will be created in your workspace root
4. If a requirements.txt file exists, you'll be prompted to install the packages

### Installing Requirements

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Tenvy: Install Requirements" and press Enter
3. Packages from requirements.txt will be installed in the active environment

### Status Bar

The extension adds a status bar item showing the currently active environment. Click on it to show a menu with options:
- Create New Environment
- Activate Environment (if environments exist)
- Deactivate Environment (if an environment is active)
- Install Requirements (if requirements.txt exists and an environment is active)

If the status bar button is not visible, you can show it by running the "Tenvy: Show Status Bar Button" command from the Command Palette.

The status bar button changes color based on its state:
- Orange/Yellow: No environment is activated
- Blue: An environment is activated

## Known Issues

- The extension currently only supports the first workspace folder in multi-root workspaces
- On some systems, the status bar button might not be visible by default. Use the "Tenvy: Show Status Bar Button" command to make it visible.

## Release Notes

### 0.0.2

- Compatibility with VS Code 1.84.0 or higher
- Added Tenvy logo as the extension icon
- Updated package.json to use VS Code 1.84.0 compatibility

### 0.0.1

- Initial release
- Support for detecting and activating Python virtual environments
- Status bar integration with color indicators and options menu
- Configuration options for auto-activation and custom folder names
- Improved virtual environment detection (searches in subdirectories)
- Added command to show status bar button
- PowerShell integration with proper environment activation (green prompt indicator)
- Added commands to deactivate and create environments
- Added command to install packages from requirements.txt

---

**Enjoy coding with Tenvy!**
