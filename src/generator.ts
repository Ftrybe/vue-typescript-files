import * as path from 'path';
import { Menu } from "./enums/Menu";
import { FileContents } from "./file-contents";
import IOUtil from "./ioutil";
import { IFiles } from "./models/file";
import { IPath } from "./models/path";
import * as vscode from "vscode";
import { FileNameUtils } from './file-name.utils';
import Commands from './commands';
// import { Template } from './template';
import * as HandleBars from "handlebars";
export class Generator {
  
  constructor(private readonly fc = new FileContents()) {}

  public async generateResources(name: Menu, loc: IPath) {
    const resource = this.getTmplResources(name);
    const files: IFiles[] = resource.files.map((file: any) => {
      const fileName: string = file.name();
      return {
        name: path.join(loc.dirPath, fileName.startsWith('-') ? `${loc.fileName}${fileName}` : `${loc.fileName}.${fileName}`),
        content: this.fc.getTemplateContent(file.type, loc.fileName, loc.args),
      };
    });
    await IOUtil.createFiles(loc, files);

    this.focusFiles(files[0].name);
  }

  private focusFiles(fileName: string) {
    vscode.window.showTextDocument(vscode.Uri.file(fileName));
  }

  private getTmplResources(name: Menu){
    let map: Map<string, any> = new Map<string, any>();
    const commandMap = new Commands().list();
    for (const value of commandMap) {
      let suffix = FileNameUtils.getSuffix(value);
      map.set(
        value,
        {
          files: [
            {
              name: () => suffix,
              type: value.toLocaleLowerCase() + ".tmpl"
            }
          ]
        }
      );
    }
    return map.get(name);
  }
}