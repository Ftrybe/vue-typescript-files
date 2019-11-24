import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import { IPath } from './models/path';
import { IFiles } from './models/file';
import Promisify from './promisify';
import { Menu } from './enums/Menu';
import { FileSuffix } from './enums/file-suffix';

export default class IOUtil {
  private constructor(){}
  public static async createFiles(loc: IPath, files: IFiles[]):Promise<string> {
    try {
      await this.writeFiles(files);
    } catch (ex) {
      window.showErrorMessage(`文件不能创建. ${ex}`);
    }

    return loc.dirPath;
  }

  public static async writeFiles(files: IFiles[]) {
    const fsWriteFile = Promisify.apply(fs.writeFile);
    const filesPromises: Promise<any>[] = files.map(file => fsWriteFile(file.name, file.content));

    await Promise.all(filesPromises);
  }

  public static async searchFiles(folderDir: string, fileName: string, resourceType: Menu): Promise<boolean> {
    let suffix = "";
    let flag = false;
    switch (resourceType) {
      case Menu.component:
        suffix = FileSuffix.vue;
        break;
      case Menu.declare:
        suffix = FileSuffix.declare;
        break;
      default:
        suffix = FileSuffix.ts;
        break;
    }
    const longFilename = fileName + "." + suffix;
    fs.readdirSync(folderDir).forEach(file => {
      if (file == longFilename) {
        flag = true;
      }
    });
    return flag;
  }
}