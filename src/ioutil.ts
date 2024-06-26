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
import { IFiles } from "./models/file";
import { IPath } from "./models/path";
import { isAbsolute, join } from "path";
export default class IOUtil {
  private constructor() {}
  public static async createFiles(
    loc: IPath,
    files: IFiles[]
  ): Promise<string> {
    try {
      await this.writeFiles(files);
    } catch (ex) {
      window.showErrorMessage(`文件不能创建. ${ex}`);
    }
    return loc.dirPath;
  }

  public static async writeFiles(files: IFiles[]) {
    const filesPromises: Promise<any>[] = files.map((file) =>
      outputFile(file.name, file.content)
    );
    await Promise.all(filesPromises);
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

  public static readText(rootPath: string, url: string): string {
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
