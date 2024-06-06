// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Client } from "pg";

// Function to connect to PostgreSQL
async function connectToPostgres() {
  const host = await vscode.window.showInputBox({
    placeHolder: "Enter PostgreSQL host",
  });
  const port = await vscode.window.showInputBox({
    placeHolder: "Enter PostgreSQL port",
    value: "5432",
  });
  const user = await vscode.window.showInputBox({
    placeHolder: "Enter PostgreSQL user",
  });
  const password = await vscode.window.showInputBox({
    placeHolder: "Enter PostgreSQL password",
    password: true,
  });
  const database = await vscode.window.showInputBox({
    placeHolder: "Enter PostgreSQL database name",
  });

  if (!host || !port || !user || !password || !database) {
    vscode.window.showErrorMessage("All fields are required.");
    return;
  }

  const client = new Client({
    host,
    port: parseInt(port),
    user,
    password,
    database,
  });

  try {
    await client.connect();
    vscode.window.showInformationMessage(
      "Connected to PostgreSQL successfully!"
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`Connection failed: ${err.message}`);
  } finally {
    await client.end();
  }
}

async function GetLoggedInUserData(context: vscode.ExtensionContext) {
  // Get the session for the GitHub authentication provider
  const session = await vscode.authentication.getSession(
    "github",
    ["user:email"],
    { createIfNone: true }
  );
  let message = "No user has logged in";

  // Check if the session is valid
  if (session) {
    message = `${session.account.label} Connected to VSCode successfully!`;
  }

  // Show an information message indicating that the user has logged in successfully
  vscode.window.showInformationMessage(message);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "convntionenforcer.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from convntionEnforcer!"
      );
    }
  );

  let connectCommand = vscode.commands.registerCommand(
    "convntionenforcer.connectToPostgres",
    async () => {
      await connectToPostgres();
    }
  );

  let currentUserInfo = vscode.commands.registerCommand(
    "convntionenforcer.getUserInfo",
    async () => {
      await GetLoggedInUserData(context);
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(connectCommand);
  context.subscriptions.push(currentUserInfo);

  // Execute the command automatically when a document is opened
  vscode.workspace.onDidOpenTextDocument(() => {
    vscode.commands.executeCommand("convntionenforcer.getUserInfo");
  });
}

export function deactivate() {}
