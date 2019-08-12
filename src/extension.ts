// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CommandsMap } from './commands';
import { showDynamicDialog } from './dialog';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// 注册命令
	 for(const [key, value] of CommandsMap()) {
	 	const command = vscode.commands.registerCommand(key, url => showDynamicDialog(url, value.filename, value.resource));
	 	context.subscriptions.push(command);
	 }	 
}
// this method is called when your extension is deactivated
export function deactivate() {}
