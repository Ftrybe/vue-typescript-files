import * as vscode from "vscode";
import Commands from './commands';
import Dialog from './dialog';
export default class Extension{
	private dialog: Dialog;
	constructor(){
		this.dialog = new Dialog();
	}

	public registerCommands(context: vscode.ExtensionContext): void{
		for(const [key, value] of Commands.map()) {
			const command = vscode.commands.registerCommand(key, url => this.dialog.showDynamicDialog(url, value.filename, value.resource));
			context.subscriptions.push(command);
		}	 
	}
}