import * as vscode from "vscode";
import Commands from './commands';
import Dialog from './dialog';
import HandlebarsWebviewProvider from "./primary-side-provider";
import { readFileSync } from "fs-extra";
import ExtendParams from "./extend-params";
import { HandleBarsHelper } from "./handlebars-helper";
import { basename } from "path";
import { FileContents } from "./file-contents";
export default class Extension{
	private dialog: Dialog;


	private panel: vscode.WebviewPanel | undefined;

	constructor(private readonly fc = new FileContents()){
		this.dialog = new Dialog();
	}

	public loadExtend(context: vscode.ExtensionContext): void{
		this.registerContentMenu(context);
		this.registerViewProvider(context);
		this.registerEditorWebview(context);
	}

	private registerContentMenu(context: vscode.ExtensionContext): void{
		for(const [key, value] of Commands.map()) {
			const command = vscode.commands.registerCommand(key, url => this.dialog.showDynamicDialog(url, value.filename, value.resource));
			context.subscriptions.push(command);
		}
	}

	private registerViewProvider(context: vscode.ExtensionContext): void{
		const provider = new HandlebarsWebviewProvider(context);
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider("handlebarPreviewView", provider)
		);

	}


	private registerEditorWebview(context: vscode.ExtensionContext): void {

		const createWebviewPanelCommand = vscode.commands.registerCommand('extension.createWebviewPanel', () => {

			if (this.panel) {
				this.panel.reveal(vscode.ViewColumn.One);
			} else {
				this.createWebviewPanel('');
			}
		});
		const updateWebviewPanelCommand = vscode.commands.registerCommand('extension.updateWebviewPanel',async (value : {
			fileName: string
			template: string
			templateDir: string
			customParams: any
		}) => {

			const content = readFileSync(value.template, { encoding: 'utf-8'})

			const templateName = basename(value.template);
			const params = await ExtendParams.buildCustomParams(value.customParams, value.fileName);
			const text = this.fc.textCase(templateName, value.fileName, params);
			const intance = HandleBarsHelper.getInstance(value.templateDir);
			const templateDelegate = intance.compile(content, { noEscape: true});
			const result = templateDelegate(text);

			if (this.panel) {
				this.panel.webview.html = this.getWebviewContent(result);
			} else {
				this.createWebviewPanel(content);
			}
		});
		context.subscriptions.push(createWebviewPanelCommand);
		context.subscriptions.push(updateWebviewPanelCommand);
	}

	private  createWebviewPanel(content: string) {
		this.panel = vscode.window.createWebviewPanel(
			'vue-typescript-files',
			'vue-typescript-files',
			vscode.ViewColumn.One,
			{
				retainContextWhenHidden: true,
				enableScripts: true
			}
		);
		this.panel.webview.html = this.getWebviewContent(content);
		this.panel.onDidDispose(() => {
			this.panel = undefined;
		});
	}

	getWebviewContent(content: string): string {
		
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Preview</title>
			<style>
				#template-content {
					white-space: pre-wrap;
				}
      		</style>
		</head>
		<body>
<div id="template-content">
${content}
</div>
		</body>
		</html>

		`	}
}
