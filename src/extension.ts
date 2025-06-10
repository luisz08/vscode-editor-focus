import * as vscode from "vscode";

// Interface for storing panel states in workspace
interface WorkspacePanelStates {
  beforeFocus: {
    sidebarVisible: boolean;
    panelVisible: boolean;
    activityBarVisible: boolean;
    statusBarVisible: boolean;
  };
  currentlyInFocusMode: boolean;
}

// Configuration interface
interface FocusConfiguration {
  hideSidebar: boolean;
  hidePanel: boolean;
  hideActivityBar: boolean;
  hideStatusBar: boolean;
}

// Default state configuration interface
interface DefaultStatesConfiguration {
  defaultSidebarVisible: boolean;
  defaultPanelVisible: boolean;
  defaultActivityBarVisible: boolean;
  defaultStatusBarVisible: boolean;
}

// Simplified panel state manager
class PanelStateManager {
  private context: vscode.ExtensionContext;
  private static readonly STATE_KEY = "editor-focus.panelStates";

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  // Get current extension configuration for hiding panels
  private getConfiguration(): FocusConfiguration {
    const config = vscode.workspace.getConfiguration("editor-focus");
    return {
      hideSidebar: config.get("hideSidebar", true),
      hidePanel: config.get("hidePanel", true),
      hideActivityBar: config.get("hideActivityBar", true),
      hideStatusBar: config.get("hideStatusBar", true),
    };
  }

  // Get default states configuration
  private getDefaultStates(): DefaultStatesConfiguration {
    const config = vscode.workspace.getConfiguration("editor-focus");
    return {
      defaultSidebarVisible: config.get("defaultSidebarVisible", true),
      defaultPanelVisible: config.get("defaultPanelVisible", true),
      defaultActivityBarVisible: config.get("defaultActivityBarVisible", true),
      defaultStatusBarVisible: config.get("defaultStatusBarVisible", true),
    };
  }

  // Save current panel states to workspace using configured defaults
  async saveCurrentStates(): Promise<void> {
    try {
      const existingStates = this.getSavedStates();
      const defaultStates = this.getDefaultStates();

      // If states already exist and we're not in focus mode, preserve the saved before-focus states
      // If we're currently in focus mode, don't overwrite the original states
      const currentStates: WorkspacePanelStates = {
        beforeFocus: existingStates?.currentlyInFocusMode
          ? existingStates.beforeFocus // Preserve original states if already in focus mode
          : {
              sidebarVisible: defaultStates.defaultSidebarVisible,
              panelVisible: defaultStates.defaultPanelVisible,
              activityBarVisible: defaultStates.defaultActivityBarVisible,
              statusBarVisible: defaultStates.defaultStatusBarVisible,
            },
        currentlyInFocusMode: false,
      };

      await this.context.workspaceState.update(
        PanelStateManager.STATE_KEY,
        currentStates
      );
    } catch (error) {
      console.error("Failed to save panel states:", error);
    }
  }

  // Get saved panel states from workspace
  getSavedStates(): WorkspacePanelStates | undefined {
    return this.context.workspaceState.get<WorkspacePanelStates>(
      PanelStateManager.STATE_KEY
    );
  }

  // Check if currently in focus mode
  isInFocusMode(): boolean {
    const states = this.getSavedStates();
    return states?.currentlyInFocusMode ?? false;
  }

  // Update focus mode status
  async setFocusMode(inFocusMode: boolean): Promise<void> {
    const states = this.getSavedStates() || {
      beforeFocus: {
        sidebarVisible: true,
        panelVisible: true,
        activityBarVisible: true,
        statusBarVisible: true,
      },
      currentlyInFocusMode: false,
    };

    states.currentlyInFocusMode = inFocusMode;
    await this.context.workspaceState.update(
      PanelStateManager.STATE_KEY,
      states
    );
  }

  // Execute panel control commands - force hide panels using close/hide commands
  async hidePanels(): Promise<void> {
    const config = this.getConfiguration();

    try {
      // Use close/hide commands to ensure panels are hidden regardless of current state
      if (config.hideSidebar) {
        await vscode.commands.executeCommand("workbench.action.closeSidebar");
      }
      if (config.hidePanel) {
        await vscode.commands.executeCommand("workbench.action.closePanel");
      }
      if (config.hideActivityBar) {
        // Activity bar doesn't have a direct hide command, use toggle carefully
        await vscode.commands.executeCommand(
          "workbench.action.toggleActivityBarVisibility"
        );
      }
      if (config.hideStatusBar) {
        // Status bar doesn't have a direct hide command, use toggle carefully
        await vscode.commands.executeCommand(
          "workbench.action.toggleStatusbarVisibility"
        );
      }
    } catch (error) {
      console.error("Failed to hide panels:", error);
    }
  }

  // Restore panels to previous state
  async restorePanels(): Promise<void> {
    const states = this.getSavedStates();
    if (!states) {
      return;
    }

    try {
      // Restore sidebar
      if (states.beforeFocus.sidebarVisible) {
        await vscode.commands.executeCommand(
          "workbench.action.toggleSidebarVisibility"
        );
      }

      // Restore panel
      if (states.beforeFocus.panelVisible) {
        await vscode.commands.executeCommand("workbench.action.togglePanel");
      }

      // Restore activity bar
      if (states.beforeFocus.activityBarVisible) {
        await vscode.commands.executeCommand(
          "workbench.action.toggleActivityBarVisibility"
        );
      }

      // Restore status bar
      if (states.beforeFocus.statusBarVisible) {
        await vscode.commands.executeCommand(
          "workbench.action.toggleStatusbarVisibility"
        );
      }
    } catch (error) {
      console.error("Failed to restore panels:", error);
    }
  }
}

// Extension activation
export function activate(context: vscode.ExtensionContext) {
  console.log("Editor Focus extension activated");

  // Initialize panel state manager
  const panelManager = new PanelStateManager(context);

  // Register enter focus mode command
  const enterFocusMode = vscode.commands.registerCommand(
    "editor-focus.enterFocusMode",
    async () => {
      try {
        // Save current states before hiding panels
        await panelManager.saveCurrentStates();

        // Hide panels according to configuration
        await panelManager.hidePanels();

        // Mark as in focus mode
        await panelManager.setFocusMode(true);
      } catch (error) {
        console.error("Failed to enter focus mode:", error);
      }
    }
  );

  // Register exit focus mode command
  const exitFocusMode = vscode.commands.registerCommand(
    "editor-focus.exitFocusMode",
    async () => {
      try {
        // Only exit if currently in focus mode
        if (!panelManager.isInFocusMode()) {
          return;
        }

        // Restore panels to previous state
        await panelManager.restorePanels();

        // Mark as not in focus mode
        await panelManager.setFocusMode(false);
      } catch (error) {
        console.error("Failed to exit focus mode:", error);
      }
    }
  );

  // Register toggle focus mode command
  const toggleFocusMode = vscode.commands.registerCommand(
    "editor-focus.toggleFocusMode",
    async () => {
      try {
        if (panelManager.isInFocusMode()) {
          // Currently in focus mode, exit it
          await vscode.commands.executeCommand("editor-focus.exitFocusMode");
        } else {
          // Not in focus mode, enter it
          await vscode.commands.executeCommand("editor-focus.enterFocusMode");
        }
      } catch (error) {
        console.error("Failed to toggle focus mode:", error);
      }
    }
  );

  // Add all commands to subscriptions for proper cleanup
  context.subscriptions.push(enterFocusMode, exitFocusMode, toggleFocusMode);
}

// Extension deactivation
export function deactivate() {}
