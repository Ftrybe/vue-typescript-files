import * as path from 'path';
import { Menu } from "./enums/Menu";
import { FileContents } from "./file-contents";
import IOUtil from "./ioutil";
import { IFiles } from "./models/file";
import { IPath } from "./models/path";
import  {Resources} from "./resources";
import * as vscode from "vscode";

export class Generator {
  constructor(private readonly fc = new FileContents()) {
  }

  public async generateResources(name: Menu, loc: IPath) {
    const resource =  Resources.getTmplResources(name);
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
}