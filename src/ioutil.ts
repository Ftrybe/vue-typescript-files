import {
  existsSync,
  readFileSync,
  outputFile,
  readdirSync,
  pathExists,
} from "fs-extra";
import { window } from "vscode";
import { Menu } from "./enums/menu";
import { FileNameUtils } from "./file-name.utils";
import { IPath } from "./models/path";
import { isAbsolute, join } from "path";
export default class IOUtil {
  private constructor() {}


  public static async createFile(loc: IPath, name: string, content: string) {
    try {
      await outputFile(name, content);
    } catch (ex) {
      window.showErrorMessage(`文件不能创建. ${ex}`);
    }
  }

  public static async searchFiles(
    folderDir: string,
    fileName: string,
    resourceType: Menu
  ): Promise<boolean> {
    if (!(await pathExists(folderDir))) {
      return false;
    }
    let flag = false;
    let suffix = FileNameUtils.getFileSuffix(resourceType);

    const longFilename = fileName + "." + suffix;
    readdirSync(folderDir).forEach((file) => {
      if (file === longFilename) {
        flag = true;
      }
    });
    return flag;
  }

  public static readText(url: string, rootPath: string): string {
    let filePath: string;
    if (isAbsolute(url)) {
      filePath = url;
    } else {
      filePath = join(rootPath, url);
    }
    const hasFile = existsSync(filePath);
    if (hasFile) {
      const data = readFileSync(filePath, "utf8");
      return data;
    }
    return "";
  }
}
