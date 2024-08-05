import * as path from 'path';
import { Menu } from "./enums/menu";
import { FileContents } from "./file-contents";
import IOUtil from "./ioutil";
import { IFiles } from "./models/file";
import { IPath } from "./models/path";
import * as vscode from "vscode";
import { FileNameUtils } from './file-name.utils';
import Commands from './commands';
import { HANDLEBARS_FILE_SUFFIX } from "./config"
// import { Template } from './template';
export class Generator {
  
  constructor(private readonly fc = new FileContents()) {}

  public async generateResources(uri: vscode.Uri, menu: Menu, loc: IPath) {
    const resource = this.getTmplResources(menu);
    const suffix: string = resource.suffix;
    const filePath = path.join(loc.dirPath, suffix.startsWith('-') ? `${loc.fileName}${suffix}` : `${loc.fileName}.${suffix}`);
    const workspacePath = this.getWorkspacePath(uri);
    const content = await this.fc.getTemplateContent(workspacePath ,resource.type, loc.fileName, loc.args);
    await IOUtil.createFile(loc, filePath, content);
    this.focusFile(filePath);
  }

  public async getTemplateContent(uri: vscode.Uri,fileName: string , menu: Menu, args: string[]) {
    const resource = this.getTmplResources(menu);
    const workspacePath = this.getWorkspacePath(uri);
    const content = await this.fc.getTemplateContent(workspacePath ,resource.type, fileName, args);
    return content;
  }



  private getWorkspacePath(uri: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const workspacePath = workspaceFolder?.uri.fsPath || '';
    return workspacePath;
  }


  private focusFile(fileName: string) {
    vscode.window.showTextDocument(vscode.Uri.file(fileName));
  }

  private getTmplResources(menu: Menu): {type: string, suffix: string} {
    let map: Map<string, any> = new Map<string, any>();
    for (const value of Commands.list()) {
      let suffix = FileNameUtils.getFileSuffix(value);
      
      map.set(value, {
        type:  value.toLocaleLowerCase() + HANDLEBARS_FILE_SUFFIX,
        suffix: suffix
      });
    }
    return map.get(menu.toString());
  }
}