# Editor Focus Extension

A Visual Studio Code extension that provides a distraction-free coding environment by hiding panels and sidebars with simple commands.

## Features

- **Focus Mode**: Hide all VS Code panels and sidebars to maximize editor space
- **Configurable**: Choose which UI elements to hide (sidebar, panel, activity bar, status bar)
- **Per-Workspace**: Settings are saved per workspace/project
- **Quick Toggle**: Fast keyboard shortcuts for instant focus mode switching

## Commands

- `Editor Focus: Enter Focus Mode` - Hide configured panels and enter focus mode
- `Editor Focus: Exit Focus Mode` - Restore panels to their previous state
- `Editor Focus: Toggle Focus Mode` - Switch between focus and normal modes

## Default Keyboard Shortcuts

- `Ctrl+Shift+F` (Windows/Linux) / `Cmd+Shift+F` (Mac) - Toggle Focus Mode
- `Ctrl+Shift+Escape` (Windows/Linux) / `Cmd+Shift+Escape` (Mac) - Exit Focus Mode

## Configuration

You can customize which UI elements are hidden in focus mode:

```json
{
  "editor-focus.hideSidebar": true,
  "editor-focus.hidePanel": true,
  "editor-focus.hideActivityBar": true,
  "editor-focus.hideStatusBar": true
}
```

## Usage

1. **Using Command Palette**: Press `Ctrl+Shift+P` and type "Focus Mode"
2. **Using Keyboard Shortcuts**: Press `Ctrl+Shift+F` to toggle focus mode
3. **Configuration**: Go to VS Code Settings and search for "editor-focus"

## How It Works

- When entering focus mode, the extension saves the current state of all panels
- Panels are hidden according to your configuration settings
- When exiting focus mode, panels are restored to their exact previous state
- Each workspace maintains its own panel state independently

## Requirements

- Visual Studio Code 1.100.0 or higher

## Installation

1. Install the extension from the VS Code Marketplace
2. Use the command palette or keyboard shortcuts to start focusing!

## Development

This extension is built with:

- TypeScript
- VS Code Extension API
- ESBuild for bundling

## License

[MIT License](LICENSE)
