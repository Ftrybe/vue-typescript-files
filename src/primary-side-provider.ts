import * as vscode from "vscode";
import { readFileSync, pathExistsSync, readdirSync, readJSONSync, writeJSONSync } from "fs-extra";
import { basename, join } from 'path';
import { HANDLEBARS_FILE_SUFFIX, CONFIG_PATH, PARAMS_FILE_NAME } from "./config";
import { CustomParam, PreviewState, ConfigJson, ApiParam } from "./models/preview-state";
import { FileContents } from "./file-contents";
import ExtendParams from "./extend-params";
export default class HandlebarsWebviewProvider implements vscode.WebviewViewProvider {
	private context: vscode.ExtensionContext;
	private _view?: vscode.WebviewView;
	private _state?: PreviewState;

	constructor(private readonly _context: vscode.ExtensionContext, private readonly fc = new FileContents()) {
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
						dirPath: configDir,
						syncConfig: false
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

					if (message.syncConfig == true && this._state?.syncConfig == true) {
						this.writeConfigJson();
					}
					break;
				case "toggleSyncConfig":
					this.handleToggleSyncConfig(message);
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

	private handleToggleSyncConfig(message: any) {

		if (!message.data) {
			vscode.window.showInformationMessage("Sync Config Disabled");
			return;
		}
		// 如果选择同步， 判断在目录下是否存在 config 文件
		if (!this._state?.templateDir || this._state.templateDir == "") {
			vscode.window.showErrorMessage("Folder Not Found");
			return
		}
		const configFile = join(this._state.templateDir, PARAMS_FILE_NAME);

		if (!pathExistsSync(configFile)) {

			const paramsJson = this.convertCustomParamsToJson(this._state.customParams)
			// 如果不存在config文件，创建config文件
			writeJSONSync(configFile, paramsJson, {
				spaces: 2,
				encoding: 'utf8'
			});

			// 不存在默认参数，提示自动创建默认配置
			vscode.window.showInformationMessage("Auto Create Config File");
		} else {
			// 存在配置文件，先读取本地的配置
			const config: ConfigJson = readJSONSync(configFile, {
				encoding: 'utf8',
			});

			const paramsJson: ConfigJson = this.convertCustomParamsToJson(this._state.customParams);

			const newConfig = this.customMerge(config, paramsJson);

			writeJSONSync(configFile, newConfig, {
				spaces: 2,
				encoding: 'utf8'
			});

			this._state.customParams = this.convertJsonToCustomParams(newConfig);

			this._view?.webview.postMessage({ command: 'restoreState', state: this._state });

		}

		// 如果存在config文件，加载文件内容
	}

	private writeConfigJson() {
		if (!this._state) {
			return
		}
		const configFile = join(this._state.templateDir, PARAMS_FILE_NAME);
		const paramsJson = this.convertCustomParamsToJson(this._state.customParams);

		writeJSONSync(configFile, paramsJson, {
			spaces: 2,
			encoding: 'utf8'
		})
	}

	private customMerge(target: any, source: any) {
		// 快速路径：如果源是原始类型或 null，直接返回
		if (source == null || typeof source !== 'object') return source;

		// 如果目标不是对象，初始化为空对象或数组
		if (typeof target !== 'object') {
			target = Array.isArray(source) ? [] : {};
		}

		let key;
		// 使用 for...in 循环，避免创建额外的数组
		for (key in source) {
			// 使用 in 操作符检查属性，比 hasOwnProperty 更快
			if (key in source) {
				// 特殊处理 'scope'
				if (key === 'scope' && key in target) continue;

				const sourceValue = source[key];

				if (Array.isArray(sourceValue)) {
					// 数组处理
					target[key] = target[key] ? target[key].concat(sourceValue) : sourceValue.slice();
				} else if (typeof sourceValue === 'object' && sourceValue !== null) {
					// 对象处理
					target[key] = this.customMerge(target[key] || {}, sourceValue);
				} else {
					// 原始值处理
					target[key] = sourceValue;
				}
			}
		}

		return target;
	}

	private convertJsonToCustomParams(json: ConfigJson): CustomParam[] {
		return Object.entries(json).map(([key, value]) => {
			if (typeof value === 'string') {
				return {
					key,
					type: 'string',
					value,
					scope: ''
				};
			} else {
				return {
					key,
					type: value.type as 'string' | 'api' | 'js' | 'json',
					value: {
						apiUrl: value.value.apiUrl,
						headers: Object.entries(value.value.headers).map(([key, value]) => ({
							key,
							value
						})),
					},
					scope: value.scope ? value.scope.join(',') : ''
				};
			}
		});
	}

	private convertCustomParamsToJson(params: CustomParam[]): ConfigJson {
		return params.reduce((acc, param) => {
			if (!param || !param.key) {
				console.warn('Skipping invalid parameter:', param);
				return acc;
			}

			if (param.type === 'string') {
				acc[param.key] = param.value as string || '';
			} else if (param.type === 'api') {
				const apiParam = param.value as ApiParam;
				if (!apiParam || !apiParam.apiUrl) {
					console.warn('Skipping invalid API parameter:', param);
					return acc;
				}
				acc[param.key] = {
					type: 'api',
					value: {
						apiUrl: apiParam.apiUrl,
						headers:(apiParam.headers || []).reduce((headers, { key, value }) => {
							if (key && value !== undefined) {
								headers[key] = value;
							}
							return headers;
						}, {} as { [key: string]: string })
					},
					scope: param.scope ? param.scope.split(', ').filter(Boolean) : undefined,
				};
			} else {
				acc[param.key] = {
					type: param.type || 'string',
					value: param.value || '',
					scope: param.scope ? param.scope.split(', ').filter(Boolean) : undefined
				};
			}
			return acc;
		}, {} as ConfigJson);
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

	private async loadCustomParams(data: PreviewState) {
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
