import * as vscode from "vscode";
import Commands from './commands';
import Dialog from './dialog';
export default class Extension{
	private command:Commands;
	private dialog: Dialog;
	constructor(){
		this.command = new Commands();
		this.dialog = new Dialog();
	}

	public registerCommands(context: vscode.ExtensionContext): void{
		const commandMap:Map<string,any> = this.command.map();
		for(const [key, value] of commandMap) {
			const command = vscode.commands.registerCommand(key, url => this.dialog.showDynamicDialog(url, value.filename, value.resource));
			context.subscriptions.push(command);
		}	 
	}
}