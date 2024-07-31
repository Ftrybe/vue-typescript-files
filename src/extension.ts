import * as vscode from "vscode";
import Commands from './commands';
import Dialog from './dialog';
import HandlebarsWebviewProvider from "./primary-side-provider";
import { PreviewWebview } from "./preview-webview";

export default class Extension {
	private dialog: Dialog;

	constructor() {
		this.dialog = new Dialog();
	}

	public loadExtend(context: vscode.ExtensionContext): void {
		this.registerContentMenu(context);
		this.registerViewProvider(context);
		this.registerEditorWebview(context);
	}

	private registerContentMenu(context: vscode.ExtensionContext): void {
		for (const [key, value] of Commands.map()) {
			const command = vscode.commands.registerCommand(key, url => this.dialog.showDynamicDialog(url, value.filename, value.resource));
			context.subscriptions.push(command);
		}
	}

	private registerViewProvider(context: vscode.ExtensionContext): void {
		const provider = new HandlebarsWebviewProvider(context);
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider("handlebarPreviewView", provider)
		);

	}

	private registerEditorWebview(context: vscode.ExtensionContext): void { 
		const provider = new PreviewWebview();
		provider.registerEditorWebview(context);
	}

}
