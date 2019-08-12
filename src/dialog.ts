import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {Generator} from './generator';

export const showDynamicDialog = async (uri: vscode.Uri, fileName: string, ResourceType: string) => {
    const loc = await showFileNameDialog(uri, fileName, ResourceType);
    const generator = new Generator();
    await generator.generateResources(ResourceType, loc);    
};

export const showFileNameDialog = async (uri:vscode.Uri,defaultTypeName:string,ResourceType:string) => {
    let clickdFolderPath:string;
    if(uri){
        clickdFolderPath = uri.fsPath;
    }else{
        if(!vscode.window.activeTextEditor){
            throw new Error('请右击文件或文件夹');
        }else{
            clickdFolderPath = path.dirname(vscode.window.activeTextEditor.document.fileName);
        }
    }
    const rootPath = fs.lstatSync(clickdFolderPath).isDirectory() ? clickdFolderPath : path.dirname(clickdFolderPath);

    if(vscode.workspace.rootPath === undefined){
        throw new Error('请先打开一个项目');
    }else{
        let fileName = await vscode.window.showInputBox({ prompt: `输入新的${ResourceType}名称 `, value : `${defaultTypeName}`});

        if(!fileName){
            throw new Error('请验证输入的文件名');
        }else{
            let dirName = '';
            const fileNameTokens = fileName.split(' ');
            [fileName] = fileNameTokens;

            const fullPath = path.join(rootPath,fileName);
            if(fileName.indexOf('\\') !== -1){
                [dirName,fileName] = fileName.split('\\');
            }
            const dirPath = path.join(rootPath,dirName);
            return {
                fullPath,
                fileName,
                dirName,
                dirPath,
                rootPath
            };

        }
    }
};