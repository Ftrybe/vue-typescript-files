import * as vscode from "vscode";
import  { readFileSync, pathExistsSync,readdirSync } from "fs-extra";
import { join } from 'path';
import { HANDLEBARS_FILE_SUFFIX } from "./config";
export default class HandlebarsWebviewProvider implements vscode.WebviewViewProvider {
    private context:  vscode.ExtensionContext;
	private _view?: vscode.WebviewView;

    constructor(private readonly _context: vscode.ExtensionContext) {
		this.context = _context;
	}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
			enableCommandUris: true,
        };


        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// const savedData = this.context.globalState.get('customParams', []);
		// webviewView.webview.postMessage({ command: 'restoreData', data: savedData });
	
		this._onDidReceiveMessage();

		webviewView.show?.();
		vscode.commands.executeCommand('extension.createWebviewPanel');

		webviewView.onDidChangeVisibility((state) => {
		 	if (webviewView.visible) {
				vscode.commands.executeCommand('extension.createWebviewPanel');
			} else {

			}
		})

    }


	// 接受页面中传来的消息
	private _onDidReceiveMessage() {
        this._view?.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
					this.handleAlert(message);
                    break;
				case 'saveInput':
					this.context?.globalState.update('customParams', message.data);
					break
				case "loadTemplateFiles": 
					this.handleLoadFolder(message);
					break
				case "preview": 
					vscode.commands.executeCommand('extension.updateWebviewPanel', message.data);
					break;

            }
        });
	}


	private handleAlert(message: any) {
		if (message.status == 'warn') {
			vscode.window.showWarningMessage(message.data)
		} else if ( message.status == 'error') {
			vscode.window.showErrorMessage(message.data)
		} else {
			vscode.window.showInformationMessage(message.data)
		}
	}

	private handleLoadFolder(message: any) {
		const path = message.data;
		if (pathExistsSync(path)) {
			const files = readdirSync(path);
			const tempList = files.filter( name => name.endsWith(HANDLEBARS_FILE_SUFFIX)).map(name => ({
					name: name,
					path: join(path, name)
			}));
			if (tempList.length == 0) {
				vscode.window.showInformationMessage("Template File Not Found or Access Denied");
				return
			}
			this._view?.webview.postMessage({ command: 'loadTemplateFiles', data: tempList });
		} else {
			vscode.window.showErrorMessage("Folder Not Found");
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