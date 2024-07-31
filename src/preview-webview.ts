import { readFileSync } from "fs-extra";
import ExtendParams from "./extend-params";
import { HandleBarsHelper } from "./handlebars-helper";
import { basename } from "path";
import * as vscode from "vscode";
import { FileContents } from "./file-contents";

export class PreviewWebview {


	constructor(private readonly fc = new FileContents()) { }

	private panel: vscode.WebviewPanel | undefined;

	public registerEditorWebview(context: vscode.ExtensionContext): void {

		const createPreviewWebviewCommand = vscode.commands.registerCommand('extension.createPreviewWebview', () => {

			if (this.panel) {
				this.panel.reveal(vscode.ViewColumn.One);
			} else {
				this.createPreviewWebview('');
			}
		});
		const updatePreviewWebviewCommand = vscode.commands.registerCommand('extension.updatePreviewWebview', async (value: {
			fileName: string
			template: string
			templateDir: string
			customParams: any
		}) => {

			const content = readFileSync(value.template, { encoding: 'utf-8' })

			const templateName = basename(value.template);
			const params = await ExtendParams.buildCustomParams(value.customParams, value.fileName);
			const text = this.fc.textCase(templateName, value.fileName, params);
			const intance = HandleBarsHelper.getInstance(value.templateDir);
			const templateDelegate = intance.compile(content, { noEscape: true });
			const result = templateDelegate(text);

			if (this.panel) {
				this.panel.webview.html = this.getWebviewContent(result);
			} else {
				this.createPreviewWebview(content);
			}
		});
		context.subscriptions.push(createPreviewWebviewCommand);
		context.subscriptions.push(updatePreviewWebviewCommand);
	}

	private createPreviewWebview(content: string) {
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