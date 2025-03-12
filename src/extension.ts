import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let statusBarItem: vscode.StatusBarItem;
let currentEnvName: string | undefined;
let currentEnvPath: string | undefined;
let activeTerminal: vscode.Terminal | undefined;

/**
 * Find virtual environments in the workspace
 * @param rootPath The root path of the workspace
 * @param folderNames Array of folder names to look for
 * @returns Array of paths to virtual environments
 */
function findVirtualEnvs(
  rootPath: string,
  folderNames: string[]
): string[] {
  console.log(`Searching for virtual environments in ${rootPath}`);
  const foundEnvs: string[] = [];
  
  // First check direct matches in the workspace root
  folderNames.forEach((name) => {
    const fullPath = path.join(rootPath, name);
    console.log(`Checking ${fullPath}`);
    
    // Check for pyvenv.cfg (standard venv identifier)
    const cfgFile = path.join(fullPath, 'pyvenv.cfg');
    
    // Check for activation scripts as fallback
    const winActivate = path.join(fullPath, 'Scripts', 'activate');
    const unixActivate = path.join(fullPath, 'bin', 'activate');
    
    if (fs.existsSync(fullPath)) {
      if (fs.existsSync(cfgFile)) {
        console.log(`Found venv with pyvenv.cfg: ${fullPath}`);
        foundEnvs.push(fullPath);
      } else if (fs.existsSync(winActivate) || fs.existsSync(unixActivate)) {
        console.log(`Found venv with activation script: ${fullPath}`);
        foundEnvs.push(fullPath);
      }
    }
  });
  
  // If no environments found, search recursively one level deep
  if (foundEnvs.length === 0) {
    try {
      const dirs = fs.readdirSync(rootPath, { withFileTypes: true });
      dirs.filter(dirent => dirent.isDirectory()).forEach(dir => {
        const subDirPath = path.join(rootPath, dir.name);
        folderNames.forEach(name => {
          const envPath = path.join(subDirPath, name);
          console.log(`Checking subdirectory ${envPath}`);
          
          const cfgFile = path.join(envPath, 'pyvenv.cfg');
          const winActivate = path.join(envPath, 'Scripts', 'activate');
          const unixActivate = path.join(envPath, 'bin', 'activate');
          
          if (fs.existsSync(envPath)) {
            if (fs.existsSync(cfgFile)) {
              console.log(`Found venv in subdirectory with pyvenv.cfg: ${envPath}`);
              foundEnvs.push(envPath);
            } else if (fs.existsSync(winActivate) || fs.existsSync(unixActivate)) {
              console.log(`Found venv in subdirectory with activation script: ${envPath}`);
              foundEnvs.push(envPath);
            }
          }
        });
      });
    } catch (err) {
      console.error(`Error searching subdirectories: ${err}`);
    }
  }
  
  console.log(`Found ${foundEnvs.length} virtual environments`);
  return foundEnvs;
}

/**
 * Get the activation command for the virtual environment
 * @param envPath Path to the virtual environment
 * @returns Command to activate the environment
 */
function getActivationCommand(envPath: string): string {
  const platform = os.platform();
  if (platform === 'win32') {
    // Windows - use PowerShell activation script
    return `& "${path.join(envPath, 'Scripts', 'Activate.ps1')}"`;
  } else {
    // macOS/Linux
    return `source "${path.join(envPath, 'bin', 'activate')}"`;
  }
}

/**
 * Create and show the status bar item
 */
function createStatusBarItem() {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = "tenvy.showOptions";
  statusBarItem.tooltip = "Click to manage Python environments";
  statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  statusBarItem.show();
  updateStatusBar("No venv");
}

/**
 * Ensure the status bar item is visible
 */
function showStatusBarItem() {
  if (!statusBarItem) {
    createStatusBarItem();
  } else {
    statusBarItem.show();
  }
  vscode.window.showInformationMessage("Tenvy status bar button is now visible");
}

/**
 * Update the status bar with the current environment name
 * @param envName Name of the environment
 */
function updateStatusBar(envName: string) {
  statusBarItem.text = `$(terminal) Python: ${envName}`;
  currentEnvName = envName;
  
  // Change background color based on status
  if (envName === "No venv") {
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else {
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
  }
}

/**
 * Create a new virtual environment
 * @param envName Name of the environment to create (default: .venv)
 */
function createEnvironment(envName: string = '.venv') {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No open workspace folder.");
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const envPath = path.join(rootPath, envName);

  // Reuse existing terminal or create a new one
  if (!activeTerminal) {
    activeTerminal = vscode.window.createTerminal("Python venv");
  }
  activeTerminal.show();
  
  // Create the virtual environment
  activeTerminal!.sendText(`python -m venv "${envPath}"`);
  
  vscode.window.showInformationMessage(`Creating Python environment: ${envName}. This may take a moment...`);
  
  // Give it some time to create, then activate it
  setTimeout(() => {
    if (fs.existsSync(envPath)) {
      activateVenv(envPath);
      
      // Check if requirements.txt exists and ask to install
      const requirementsPath = path.join(rootPath, 'requirements.txt');
      if (fs.existsSync(requirementsPath)) {
        vscode.window.showInformationMessage(
          'Found requirements.txt. Would you like to install the packages?',
          'Yes', 'No'
        ).then(selection => {
          if (selection === 'Yes') {
            installRequirements();
          }
        });
      }
    }
  }, 3000);
}

/**
 * Install packages from requirements.txt
 */
function installRequirements() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No open workspace folder.");
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const requirementsPath = path.join(rootPath, 'requirements.txt');
  
  if (!fs.existsSync(requirementsPath)) {
    vscode.window.showErrorMessage("No requirements.txt found in the workspace root.");
    return;
  }
  
  if (currentEnvName === "No venv" || !currentEnvName) {
    vscode.window.showErrorMessage("No active Python environment. Please activate an environment first.");
    return;
  }
  
  // Reuse existing terminal or create a new one
  if (!activeTerminal) {
    activeTerminal = vscode.window.createTerminal("Python venv");
  }
  activeTerminal.show();
  
  // If we have a stored environment path, make sure it's activated first
  if (currentEnvPath) {
    const activationCmd = getActivationCommand(currentEnvPath);
    activeTerminal!.sendText(activationCmd);
    // Give a small delay to ensure the environment is activated
    setTimeout(() => {
      // Install requirements
      activeTerminal!.sendText(`pip install -r "${requirementsPath}"`);
    }, 500);
  } else {
    // Install requirements directly if we don't have a stored path
    activeTerminal!.sendText(`pip install -r "${requirementsPath}"`);
  }
  
  vscode.window.showInformationMessage(`Installing packages from requirements.txt...`);
}

/**
 * Show environment options in a quick pick
 */
async function showEnvironmentOptions() {
  const options = [];
  
  // Always add create option
  options.push({
    label: "$(add) Create New Environment",
    description: "Create a new Python virtual environment (.venv)",
    action: "create"
  });
  
  // Add activate option if environments exist
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const config = vscode.workspace.getConfiguration("tenvy");
    const folderNames = config.get<string[]>("detectedFolders") || [".venv", "venv", "env"];
    const rootPath = workspaceFolders[0].uri.fsPath;
    const envPaths = findVirtualEnvs(rootPath, folderNames);
    
    if (envPaths.length > 0) {
      options.push({
        label: "$(play) Activate Environment",
        description: envPaths.length > 1 ? "Select from available environments" : `Activate ${path.basename(envPaths[0])}`,
        action: "activate"
      });
    }
  }
  
  // Add deactivate option if an environment is active
  if (currentEnvName && currentEnvName !== "No venv") {
    options.push({
      label: "$(debug-stop) Deactivate Environment",
      description: `Deactivate ${currentEnvName}`,
      action: "deactivate"
    });
    
    // Add install requirements option if an environment is active and requirements.txt exists
    if (workspaceFolders) {
      const rootPath = workspaceFolders[0].uri.fsPath;
      const requirementsPath = path.join(rootPath, 'requirements.txt');
      if (fs.existsSync(requirementsPath)) {
        options.push({
          label: "$(package) Install Requirements",
          description: "Install packages from requirements.txt",
          action: "install"
        });
      }
    }
  }
  
  // Show quick pick
  const selected = await vscode.window.showQuickPick(options, {
    placeHolder: "Select an action"
  });
  
  if (!selected) {
    return; // User cancelled
  }
  
  // Execute the selected action
  switch (selected.action) {
    case "create":
      createEnvironment();
      break;
    case "activate":
      vscode.commands.executeCommand("tenvy.activate");
      break;
    case "deactivate":
      deactivateVenv();
      break;
    case "install":
      installRequirements();
      break;
  }
}

/**
 * Deactivate the current virtual environment
 */
function deactivateVenv() {
  // Reuse existing terminal or create a new one
  if (!activeTerminal) {
    activeTerminal = vscode.window.createTerminal("Python venv");
  }
  activeTerminal.show();
  
  const platform = os.platform();
  if (platform === 'win32') {
    // Windows - use PowerShell deactivate command
    activeTerminal!.sendText('deactivate');
  } else {
    // macOS/Linux
    activeTerminal!.sendText('deactivate');
  }
  
  // Reset environment tracking
  currentEnvPath = undefined;
  updateStatusBar("No venv");
  
  vscode.window.showInformationMessage('Python environment deactivated');
}

/**
 * Activate the virtual environment
 * @param envPath Path to the virtual environment
 */
function activateVenv(envPath: string) {
  // Reuse existing terminal or create a new one
  if (!activeTerminal) {
    activeTerminal = vscode.window.createTerminal("Python venv");
  }
  activeTerminal.show();
  
  const activationCmd = getActivationCommand(envPath);
  activeTerminal!.sendText(activationCmd);
  
  // Extract environment name from path
  const envName = path.basename(path.dirname(envPath)) === '.' 
    ? path.basename(envPath) 
    : path.basename(envPath);
  
  // Store the current environment path
  currentEnvPath = envPath;
  updateStatusBar(envName);
  
  vscode.window.showInformationMessage(`Activated Python environment: ${envName}`);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Tenvy extension is now active!');
  
  // Create status bar item only if it doesn't already exist
  if (!statusBarItem) {
    createStatusBarItem();
  }
  
  // Register the activate command
  const activateCommand = vscode.commands.registerCommand("tenvy.activate", async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("No open workspace folder.");
      return;
    }

    // Retrieve config from settings
    const config = vscode.workspace.getConfiguration("tenvy");
    const folderNames = config.get<string[]>("detectedFolders") || [".venv", "venv", "env"];

    // Detect venvs
    const rootPath = workspaceFolders[0].uri.fsPath;
    console.log(`Searching for virtual environments in workspace: ${rootPath}`);
    const envPaths = findVirtualEnvs(rootPath, folderNames);

    if (envPaths.length === 0) {
      vscode.window.showErrorMessage("No virtual environments found. Please create a virtual environment in your workspace.");
      return;
    }

    let selectedEnv = envPaths[0];
    if (envPaths.length > 1) {
      // If multiple environments found, let user select one
      const items = envPaths.map(p => ({
        label: path.basename(p),
        description: p,
        path: p
      }));
      
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a virtual environment to activate"
      });
      
      if (!selected) {
        return; // User cancelled
      }
      
      selectedEnv = selected.path;
    }

    // Activate environment
    activateVenv(selectedEnv);
  });

  // Register the select command (always shows picker)
  const selectCommand = vscode.commands.registerCommand("tenvy.select", async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("No open workspace folder.");
      return;
    }

    // Retrieve config from settings
    const config = vscode.workspace.getConfiguration("tenvy");
    const folderNames = config.get<string[]>("detectedFolders") || [".venv", "venv", "env"];

    // Detect venvs
    const rootPath = workspaceFolders[0].uri.fsPath;
    const envPaths = findVirtualEnvs(rootPath, folderNames);

    if (envPaths.length === 0) {
      vscode.window.showErrorMessage("No virtual environments found.");
      return;
    }

    // Always show picker for select command
    const items = envPaths.map(p => ({
      label: path.basename(p),
      description: p,
      path: p
    }));
    
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a virtual environment to activate"
    });
    
    if (!selected) {
      return; // User cancelled
    }
    
    // Activate environment
    activateVenv(selected.path);
  });

  // Register the deactivate command
  const deactivateCommand = vscode.commands.registerCommand("tenvy.deactivate", () => {
    if (currentEnvName && currentEnvName !== "No venv") {
      deactivateVenv();
    } else {
      vscode.window.showInformationMessage("No active Python environment to deactivate");
    }
  });

  // Register the create environment command
  const createEnvironmentCommand = vscode.commands.registerCommand("tenvy.createEnvironment", () => {
    createEnvironment();
  });

  // Register the show options command
  const showOptionsCommand = vscode.commands.registerCommand("tenvy.showOptions", () => {
    showEnvironmentOptions();
  });

  // Register the show status bar command
  const showStatusBarCommand = vscode.commands.registerCommand("tenvy.showStatusBar", () => {
    showStatusBarItem();
  });

  // Auto activation on startup if enabled
  const config = vscode.workspace.getConfiguration("tenvy");
  if (config.get<boolean>("activateOnOpen") === true) {
    vscode.commands.executeCommand("tenvy.activate");
  }

  // Register the install requirements command
  const installRequirementsCommand = vscode.commands.registerCommand("tenvy.installRequirements", () => {
    installRequirements();
  });

  context.subscriptions.push(
    activateCommand, 
    selectCommand, 
    deactivateCommand, 
    createEnvironmentCommand,
    installRequirementsCommand,
    showOptionsCommand,
    showStatusBarCommand, 
    statusBarItem
  );
}

export function deactivate() {
  // Clean up resources
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
