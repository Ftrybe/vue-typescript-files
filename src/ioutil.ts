import * as fs from 'fs-extra';
import { window } from 'vscode';
import { Menu } from './enums/Menu';
import { FileNameUtils } from './file-name.utils';
import { IFiles } from './models/file';
import { IPath } from './models/path';

export default class IOUtil {
  private constructor() { }
  public static async createFiles(loc: IPath, files: IFiles[]): Promise<string> {
    try {
     await this.writeFiles(files);
        
    } catch (ex) {
      window.showErrorMessage(`文件不能创建. ${ex}`);
    }
    return loc.dirPath;
  }

  public static async writeFiles(files: IFiles[]) {
    const filesPromises: Promise<any>[] = files.map(file=> fs.outputFile(file.name,file.content));
    await Promise.all(filesPromises);
  }

  public static async searchFiles(folderDir: string, fileName: string, resourceType: Menu): Promise<boolean> {
    if (!await fs.pathExists(folderDir)) {
      return false;
    }
    let flag = false;
    let suffix = FileNameUtils.getSuffix(resourceType);
    
    const longFilename = fileName + "." + suffix;
    fs.readdirSync(folderDir).forEach(file => {
      if (file === longFilename) {
        flag = true;
      }
    });
    return flag;
  }
}