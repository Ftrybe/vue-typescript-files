import { readJSONSync, readFileSync, existsSync } from "fs-extra";
import { get as httpGet } from "http"
import { get as httpsGet } from "https"
import { isAbsolute, join, basename, extname } from "path";
import { Script, createContext } from "vm";
import { CONFIG_PATH, PARAMS_FILE_NAME } from "./config";
import { window } from "vscode";
import { CommandOptions } from "./models/command-options";
export default class ExtendParams {
	public static async getExtendParams(workspaceFolder: string, templateName: string, filename: string, options: CommandOptions) {
		const extendParamsPath = join(workspaceFolder, CONFIG_PATH, PARAMS_FILE_NAME);

		const result: any = {};
		if (!existsSync(extendParamsPath)) {
			return result;
		}
		const templateBaseName = basename(templateName, extname(templateName))
		const extendParams = readJSONSync(extendParamsPath);

		const keys = Object.keys(extendParams);
		for (let key of keys) {

			const obj = extendParams[key];

			if (Object.prototype.toString.call(obj) === '[object Object]') {

				const { scope } = obj;

				result[key] = obj["value"];

				if (scope) {
					if (typeof scope === 'string' && !scope.split(',').includes(templateBaseName)) {
						continue
					}
					if (Array.isArray(scope) && !scope.includes(templateBaseName)) {
						continue
					}
				}

				const paramsType = obj["type"];
				if (paramsType === 'api') {
					try {
						
						const response: any = await ExtendParams.getParamsFromApi(obj['url'], obj['headers'] ?? {}, filename, options);
						try {
							// 尝试将响应解析为 JSON
							const jsonData = JSON.parse(response);
							result[key] = jsonData;
							console.log("Data parsed as JSON:", jsonData);
						} catch (error) {
							// 如果解析失败，假定响应是普通文本
							result[key] = response;
							console.log("Response is not JSON, using as string:", response);
						}
					} catch (error: any) {
						window.showErrorMessage(error.message);
					}
				} else if (paramsType === 'js') {
					let path = options.overidePathOrDefualt(obj['value']);
					if (!isAbsolute(path)) {
						path = join(workspaceFolder, path);
					}
					result[key] = ExtendParams.getParamsFromJs(path, filename, options);
				} else if (paramsType === 'json') {
					const path = join(workspaceFolder, filename);

					result[key] = ExtendParams.getParamsFromJSON(path);
				}
			} else {
				// 字符串类型
				result[key] = obj;
			}
		}

		return {
			extend: result
		};
	}


	public static async buildCustomParams(customParams: any, filename: string, options: CommandOptions = CommandOptions.empty) {
		
		const result: any = {};
		for (let obj of customParams) {
			const key = obj.key;
			result[key] = obj.value;
			if ( obj.type == 'api') {
				try {

					const { apiUrl, headers } = obj.value;

					const _headers = this.convertHeaders(headers);
					const response: any = await ExtendParams.getParamsFromApi(apiUrl, _headers, filename, options);
					try {
						// 尝试将响应解析为 JSON
						const jsonData = JSON.parse(response);
						result[key] = jsonData;
						console.log("Data parsed as JSON:", jsonData);
					} catch (error) {
						// 如果解析失败，假定响应是普通文本
						result[key] = response;
						console.log("Response is not JSON, using as string:", response);
					}
				} catch(error: any) {
					window.showErrorMessage(error.message);
				}
			} else if (obj.type === 'js') {
				result[key] = ExtendParams.getParamsFromJs(obj.value, filename, options);

			} else if (obj.type === 'json') { 
				result[key] = ExtendParams.getParamsFromJSON(obj.value);

			}
		}
		
		return {
			extend: result
		};
	}
	// 从接口获取参数  // 从接口获取参数
	private static getParamsFromApi(apiUrl: string, headers: any,  filename: string, options: CommandOptions) {
		// const headers = obj['headers'] ?? {};

		return new Promise((resolve, reject) => {
			// 根据 URL 协议选择 http 或 https 模块
			const url = new URL(options.overidePathOrDefualt(apiUrl));

			if (options.dynamicPathParts.length > 0) {
				// 检查url路径里是否存在:xx 这种格式的变量，用来动态替换
				options.dynamicPathParts.forEach(part => {
					// part 的格式为 key=value
					const [key, value] = part.split('=');
					url.pathname = url.pathname.replace(`:${key}`, value);
				})
			}

			const get = url.protocol === 'https' ? httpsGet : httpGet;
			const args = options.scriptParameters;
			if (args.length > 0) {
				if (url.search != '') {
					url.search += '&' + args.join('&');
				} else {
					url.search = args.join('&');
				}
			}
			const request = get({
				host: url.hostname,
				port: url.port || (url.protocol === 'https:' ? 443 : 80),
				protocol: url.protocol,
				method: 'GET',
				path: url.pathname + url.search,
				headers: headers
			}, (response) => {
				const code = response.statusCode ?? 0;
				// 确保响应状态码为 200
				if (code === 404) {
					reject(new Error('404 Not Found'));
				}

				if (code < 200 || code > 299) {
					reject(new Error('Failed to load page, status code: ' + response.statusCode));
				}

				// 临时数据存储
				const body: any = [];
				// 接收数据块并合成
				response.on('data', (chunk) => body.push(chunk));
				// 响应结束，解析数据
				response.on('end', () => resolve(body.join('')));
			});

			// 监听请求错误
			request.on('error', (err) => reject(err))
		});

	}


	// 调用本地js
	private static getParamsFromJs(path: string, filename: string, options: CommandOptions) {
		
		if (!existsSync(path)) {
			window.showErrorMessage('The script file does not exist: ' + path);
			return {};
		}

		const code = readFileSync(path, 'utf-8');
		const sandbox = {
			module: {},
			console: console, // 传递 console 对象以允许脚本中使用 console.log,
			filename: filename,
			args: options.scriptParameters
		};
		createContext(sandbox);

		// 执行代码
		try {
			const script = new Script(code);
			return script.runInContext(sandbox);
		} catch (err) {
			window.showErrorMessage('Failed to execute the script: ' + err);
		}

		return {};
	}

	private static getParamsFromJSON(path: string) {
		try {
			return JSON.parse(readFileSync(path, 'utf-8'));
		} catch (err) {
			window.showErrorMessage('Failed to parse the JSON file: ' + err);
		}
	}

	private static convertHeaders(headers: Array<{key: string, value: string}>): {[key: string]: string} {
		const convertedHeaders: {[key: string]: string} = {};
		
		headers.forEach(header => {
			convertedHeaders[header.key] = header.value;
		});
		
		return convertedHeaders;
	}
}