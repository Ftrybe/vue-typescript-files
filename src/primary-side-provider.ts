import * as vscode from "vscode";
import { readFileSync, pathExistsSync, readdirSync } from "fs-extra";
import { join } from 'path';
import { HANDLEBARS_FILE_SUFFIX, CONFIG_PATH } from "./config";
import { PreviewState } from "./models/preview-state";
import { FileContents } from "./file-contents";
import ExtendParams from "./extend-params";
export default class HandlebarsWebviewProvider implements vscode.WebviewViewProvider {
	private context: vscode.ExtensionContext;
	private _view?: vscode.WebviewView;
	private _state: any = {};

	constructor( private readonly _context: vscode.ExtensionContext, private readonly fc = new FileContents()) {
		this.context = _context;
	}

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			enableCommandUris: true,
		};


		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		this._onDidReceiveMessage();

		vscode.commands.executeCommand('extension.createPreviewWebview');

		this.context.globalState.update('webviewState', {});
		webviewView.onDidChangeVisibility((state) => {
			if (webviewView.visible) {
				vscode.commands.executeCommand('extension.createPreviewWebview');
				webviewView.webview.postMessage({ command: 'restoreState', state: this._state });
			}
		})
		// 恢复之前保存的状态

		webviewView.show?.();
		this.postDefaultValue();


	}


	private postDefaultValue() {
		const workspaces = vscode.workspace.workspaceFolders;
		if (!workspaces) {
			return
		}
		for (let workspace of workspaces) {
			const configDir = join(workspace.uri.fsPath, CONFIG_PATH);
			if (pathExistsSync(configDir)) {
				const tempList = this.getTempList(configDir);
				this._view?.webview.postMessage({
					command: 'defaultValue', data: {
						tempList: tempList,
						dirPath: configDir
					}
				})
				return;
			}
		}
	}

	// 接受页面中传来的消息
	private _onDidReceiveMessage() {
		this._view?.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'alert':
					this.handleAlert(message);
					break;
				case "loadTemplateFiles":
					this.handleLoadFolder(message);
					break
				case "preview":
					vscode.commands.executeCommand('extension.updatePreviewWebview', message.data);
					break;
				case "previewParams":
					this.loadCustomParams(message.data).then();
					break;
				case 'saveState':
					// 保存状态到扩展上下文
					this._state = message.state;
					this.context.globalState.update('webviewState', this._state);
					break;
			}
		});
	}


	private handleAlert(message: any) {
		if (message.status == 'warn') {
			vscode.window.showWarningMessage(message.data)
		} else if (message.status == 'error') {
			vscode.window.showErrorMessage(message.data)
		} else {
			vscode.window.showInformationMessage(message.data)
		}
	}

	private handleLoadFolder(message: any) {
		const path = message.data;
		if (pathExistsSync(path)) {
			const tempList = this.getTempList(path);
			if (tempList.length == 0) {
				vscode.window.showInformationMessage("Template File Not Found or Access Denied");
				return
			}
			this._view?.webview.postMessage({ command: 'loadTemplateFiles', data: tempList });
		} else {
			vscode.window.showErrorMessage("Folder Not Found");
		}
	}

	private getTempList(path: string) {
		const files = readdirSync(path);
		if (files.length == 0) {
			return []
		}
		const tempList = files.filter(name => name.endsWith(HANDLEBARS_FILE_SUFFIX)).map(name => ({
			name: name,
			path: join(path, name)
		}));
		return tempList;
	}
	private async loadCustomParams(data: PreviewState ) {
		const { fileName, args } = this.parseInputName(data.fileName);
		const templateName = data.template;
		const options = this.fc.parseInputArgs(args);
		const extendParams = await ExtendParams.buildCustomParams(data.customParams, fileName, options);
        const params = this.fc.buildHandbarsParams(templateName, fileName, extendParams);
		this._view?.webview.postMessage({ command: 'previewParams', data: params });
	}

	private parseInputName(inputName: string) {
		const fileNameTokens = inputName.split(' ');
		// 判断文件是否存在
		const [fileName, ...args] = fileNameTokens;
		return {
			fileName,
			args
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview): string {
		// 
		const scriptUri = webview.asWebviewUri(this._getWebViewResourcePath('primary-side.js'));
		const styleUri = webview.asWebviewUri(this._getWebViewResourcePath('primary-side.css'));

		const htmlPath = this._getWebViewResourcePath('primary-side.html');
		let htmlContent = readFileSync(htmlPath.path, 'utf8');
		// 替换 HTML 中的占位符为实际的 script URI
		htmlContent = htmlContent.replace(/{{scriptUri}}/g, scriptUri.toString());
		htmlContent = htmlContent.replace(/{{styleUri}}/g, styleUri.toString());

		return htmlContent;
	}


	private _getWebViewResourcePath(resource: string): vscode.Uri {
		const isDevelopment = process.env.NODE_ENV === 'development';
		if (isDevelopment) {
			return vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview', resource);
		}
		return vscode.Uri.joinPath(this.context.extensionUri, 'webview', resource);
	}
}