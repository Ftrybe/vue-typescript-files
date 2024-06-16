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

  public async generateResources(uri: vscode.Uri, name: Menu, loc: IPath) {
    const resource = this.getTmplResources(name);
    const files: IFiles[] = [];
    for (const file of resource.files) {
        const fileName: string = file.name();
        const name = path.join(loc.dirPath, fileName.startsWith('-') ? `${loc.fileName}${fileName}` : `${loc.fileName}.${fileName}`);
        const content = await this.fc.getTemplateContent(uri ,file.type, loc.fileName, loc.args);
        files.push({ name, content });
    }
    await IOUtil.createFiles(loc, files);
    this.focusFiles(files[0].name);
  }

  private focusFiles(fileName: string) {
    vscode.window.showTextDocument(vscode.Uri.file(fileName));
  }

  private getTmplResources(name: Menu){
    let map: Map<string, any> = new Map<string, any>();
    for (const value of Commands.list()) {
      let suffix = FileNameUtils.getFileSuffix(value);
      map.set(
        value,
        {
          files: [
            {
              name: () => suffix,
              type: value.toLocaleLowerCase() + HANDLEBARS_FILE_SUFFIX
            }
          ]
        }
      );
    }
    return map.get(name);
  }
}