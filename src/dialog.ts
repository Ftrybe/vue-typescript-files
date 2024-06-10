import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Menu } from './enums/menu';
import { Generator } from './generator';
import IOUtil from './ioutil';
import { IPath } from './models/path';

export default class Dialog {
    private generator: Generator;

    constructor() {
        this.generator = new Generator();
    }

    public async showDynamicDialog(uri: vscode.Uri, fileName: string, resourceType: Menu) {
        const loc = await this.showFileNameDialog(uri, fileName, resourceType);
        if (loc) {
            await this.generator.generateResources(uri,resourceType, loc);
            vscode.window.setStatusBarMessage(`${loc.fileName}创建成功`, 2000);
        } else {
            vscode.window.setStatusBarMessage(`文件已存在`, 2000);
        }
    }

    public async showFileNameDialog(uri: vscode.Uri, defaultTypeName: string, resourceType: Menu) {
        let clickdFolderPath: string;
        if (uri) {
            clickdFolderPath = uri.fsPath;
        } else {
            if (!vscode.window.activeTextEditor) {
                throw new Error('请右击文件或文件夹');
            } else {
                clickdFolderPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
            }
        }
        const rootPath = fs.lstatSync(clickdFolderPath).isDirectory() ? clickdFolderPath : path.dirname(clickdFolderPath);

        if (vscode.workspace.workspaceFolders === undefined) {
            throw new Error('请先打开一个项目');
        } else {
            let fileName = await vscode.window.showInputBox({ prompt: `输入新的${resourceType}名称 `, value: `${defaultTypeName}` });
            let args: string[] = [];
            if (!fileName) {
                throw new Error('请验证输入的文件名');
            } else {
                let dirName = '';

                const fileNameTokens = fileName.split(' ');
                // 判断文件是否存在
                [fileName, ...args] = fileNameTokens;

                const fullPath = path.join(rootPath, fileName);
                const realPath = path.parse(fileName);
                dirName = realPath.dir;
                fileName = realPath.base;
                const dirPath = path.join(rootPath, dirName);
                if (await IOUtil.searchFiles(dirPath, fileName, resourceType)) {
                    return;
                };
                const result: IPath = {
                    fullPath,
                    fileName,
                    dirName,
                    dirPath,
                    rootPath,
                    args
                };
                return result;
            }
        }
    }
}
