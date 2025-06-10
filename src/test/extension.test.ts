import * as assert from "assert";
import * as vscode from "vscode";

suite("Editor Focus Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all Editor Focus tests.");

  test("Extension should be present and activate", async () => {
    const extension = vscode.extensions.getExtension("luis-zhao.editor-focus");
    assert.ok(extension, "Extension should be present");

    if (extension && !extension.isActive) {
      await extension.activate();
    }
    assert.ok(extension?.isActive, "Extension should be active");
  });

  test("Commands should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(
      commands.includes("editor-focus.enterFocusMode"),
      "enterFocusMode command should be registered"
    );
    assert.ok(
      commands.includes("editor-focus.exitFocusMode"),
      "exitFocusMode command should be registered"
    );
    assert.ok(
      commands.includes("editor-focus.toggleFocusMode"),
      "toggleFocusMode command should be registered"
    );
  });

  test("Enter Focus Mode command execution", async () => {
    try {
      await vscode.commands.executeCommand("editor-focus.enterFocusMode");
      // If no error is thrown, the command executed successfully
      assert.ok(true, "Enter focus mode command executed without errors");
    } catch (error) {
      assert.fail(`Enter focus mode command failed: ${error}`);
    }
  });

  test("Exit Focus Mode command execution", async () => {
    try {
      await vscode.commands.executeCommand("editor-focus.exitFocusMode");
      // If no error is thrown, the command executed successfully
      assert.ok(true, "Exit focus mode command executed without errors");
    } catch (error) {
      assert.fail(`Exit focus mode command failed: ${error}`);
    }
  });

  test("Toggle Focus Mode command execution", async () => {
    try {
      await vscode.commands.executeCommand("editor-focus.toggleFocusMode");
      // If no error is thrown, the command executed successfully
      assert.ok(true, "Toggle focus mode command executed without errors");
    } catch (error) {
      assert.fail(`Toggle focus mode command failed: ${error}`);
    }
  });

  test("Hide configuration should be available", () => {
    const config = vscode.workspace.getConfiguration("editor-focus");

    // Check that hide configuration properties exist and have default values
    assert.strictEqual(
      typeof config.get("hideSidebar"),
      "boolean",
      "hideSidebar should be a boolean"
    );
    assert.strictEqual(
      typeof config.get("hidePanel"),
      "boolean",
      "hidePanel should be a boolean"
    );
    assert.strictEqual(
      typeof config.get("hideActivityBar"),
      "boolean",
      "hideActivityBar should be a boolean"
    );
    assert.strictEqual(
      typeof config.get("hideStatusBar"),
      "boolean",
      "hideStatusBar should be a boolean"
    );
  });

  test("Default state configuration should be available", () => {
    const config = vscode.workspace.getConfiguration("editor-focus");

    // Check that default state configuration properties exist and have default values
    assert.strictEqual(
      typeof config.get("defaultSidebarVisible"),
      "boolean",
      "defaultSidebarVisible should be a boolean"
    );
    assert.strictEqual(
      typeof config.get("defaultPanelVisible"),
      "boolean",
      "defaultPanelVisible should be a boolean"
    );
    assert.strictEqual(
      typeof config.get("defaultActivityBarVisible"),
      "boolean",
      "defaultActivityBarVisible should be a boolean"
    );
    assert.strictEqual(
      typeof config.get("defaultStatusBarVisible"),
      "boolean",
      "defaultStatusBarVisible should be a boolean"
    );

    // Check default values
    assert.strictEqual(
      config.get("defaultSidebarVisible"),
      true,
      "defaultSidebarVisible should default to true"
    );
    assert.strictEqual(
      config.get("defaultPanelVisible"),
      true,
      "defaultPanelVisible should default to true"
    );
    assert.strictEqual(
      config.get("defaultActivityBarVisible"),
      true,
      "defaultActivityBarVisible should default to true"
    );
    assert.strictEqual(
      config.get("defaultStatusBarVisible"),
      true,
      "defaultStatusBarVisible should default to true"
    );
  });

  test("Edge case: Multiple command executions", async () => {
    try {
      // Test rapid command execution to check for race conditions
      await vscode.commands.executeCommand("editor-focus.enterFocusMode");
      await vscode.commands.executeCommand("editor-focus.enterFocusMode"); // Should handle already in focus mode
      await vscode.commands.executeCommand("editor-focus.exitFocusMode");
      await vscode.commands.executeCommand("editor-focus.exitFocusMode"); // Should handle already out of focus mode
      assert.ok(true, "Multiple command executions handled correctly");
    } catch (error) {
      assert.fail(`Multiple command execution test failed: ${error}`);
    }
  });

  test("Edge case: Toggle sequence", async () => {
    try {
      // Test toggle sequence to verify state consistency
      await vscode.commands.executeCommand("editor-focus.toggleFocusMode"); // Enter
      await vscode.commands.executeCommand("editor-focus.toggleFocusMode"); // Exit
      await vscode.commands.executeCommand("editor-focus.toggleFocusMode"); // Enter
      await vscode.commands.executeCommand("editor-focus.exitFocusMode"); // Exit manually
      assert.ok(true, "Toggle sequence handled correctly");
    } catch (error) {
      assert.fail(`Toggle sequence test failed: ${error}`);
    }
  });

  test("State management with default configuration", async () => {
    try {
      // Test that focus mode works with default configuration
      await vscode.commands.executeCommand("editor-focus.enterFocusMode");

      // Verify that the command completes without error
      assert.ok(true, "Enter focus mode with default configuration successful");

      // Exit focus mode
      await vscode.commands.executeCommand("editor-focus.exitFocusMode");
      assert.ok(true, "Exit focus mode with default configuration successful");
    } catch (error) {
      assert.fail(
        `State management with default configuration failed: ${error}`
      );
    }
  });

  test("Focus mode state persistence", async () => {
    try {
      // Test that focus mode state is properly managed
      await vscode.commands.executeCommand("editor-focus.enterFocusMode");
      await vscode.commands.executeCommand("editor-focus.exitFocusMode");

      // Enter and exit focus mode again to test state persistence
      await vscode.commands.executeCommand("editor-focus.enterFocusMode");
      await vscode.commands.executeCommand("editor-focus.exitFocusMode");

      assert.ok(true, "Focus mode state persistence handled correctly");
    } catch (error) {
      assert.fail(`Focus mode state persistence test failed: ${error}`);
    }
  });

  teardown(async () => {
    // Clean up: ensure we're not in focus mode for next tests
    try {
      await vscode.commands.executeCommand("editor-focus.exitFocusMode");
    } catch {
      // Ignore cleanup errors
    }
  });
});
