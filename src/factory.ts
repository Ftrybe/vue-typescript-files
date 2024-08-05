import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Menu } from './enums/menu';
import { Generator } from './generator';
import IOUtil from './ioutil';

export default class Factory {
    private generator: Generator;

    constructor() {
        this.generator = new Generator();
    }

    public async build(uri: vscode.Uri, input: string, resourceType: Menu) {
        if (uri) {
            const loc = await this.buildLoc(uri, input, resourceType);
            if (loc) {
                await this.generator.generateResources(uri, resourceType, loc);
                vscode.window.setStatusBarMessage(`${loc.fileName}创建成功`, 2000);
            } else {
                vscode.window.setStatusBarMessage(`文件已存在`, 2000);
            }

            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = editor.selection.active;

            const { fileName, args } = await this.openInputDialog(resourceType, input);

            const textToInsert = await this.generator.getTemplateContent(editor.document.uri, fileName, resourceType, args);
            // 在光标位置插入文本
            editor.edit(editBuilder => {
                editBuilder.insert(position, textToInsert);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage('Text inserted successfully!');
                } else {
                    vscode.window.showErrorMessage('Failed to insert text.');
                }
            });

            return;
        }
        vscode.window.setStatusBarMessage(`无效的操作`, 2000);
    }


    private async buildLoc(uri: vscode.Uri, defaultTypeName: string, resourceType: Menu) {
        let clickdFolderPath: string;
        if (uri) {
            clickdFolderPath = uri.fsPath;
        } else {
            if (!vscode.window.activeTextEditor) {
                throw new Error('请右击文件或文件夹');
            }
            clickdFolderPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
        }
        const rootPath = fs.lstatSync(clickdFolderPath).isDirectory() ? clickdFolderPath : path.dirname(clickdFolderPath);

        if (vscode.workspace.workspaceFolders === undefined) {
            throw new Error('请先打开一个项目');
        }

        const { dirName, fileName, args } = await this.openInputDialog(resourceType, defaultTypeName);
      
        const dirPath = path.join(rootPath, dirName);
        const fullPath = path.join(rootPath, fileName);

        if (await IOUtil.searchFiles(dirPath, fileName, resourceType)) {
            return;
        };
        return {
            fullPath,
            fileName,
            dirName,
            dirPath,
            rootPath,
            args
        };
    }

    public async openInputDialog(resourceType: string, defaultTypeName: string): Promise<{ dirName: string; fileName: string;args: string[] }> {

        let inputName = await vscode.window.showInputBox({ prompt: `输入新的${resourceType}名称 `, value: `${defaultTypeName}` });

        if (!inputName) {
            throw new Error('请验证输入的文件名');
        }

        const fileNameTokens = inputName.split(' ');
        // 判断文件是否存在
        const [name, ...args] = fileNameTokens;


        const realPath = path.parse(name);
        const dirName = realPath.dir;
        const fileName = realPath.base;

        return {
            dirName,
            fileName,
            args
        }
    }
}
