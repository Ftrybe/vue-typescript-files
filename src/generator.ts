import { IPath } from "./models/path";
import { FileContents } from "./file-contents";
import { IFiles } from "./models/file";
import * as path from 'path';
import { getTmplResouces } from "./resources";
import { createFiles } from "./ioutil";
import { Menu } from "./enums/Menu";

export class Generator {
  constructor(private readonly fc = new FileContents()) {
  }
  
  async generateResources(name: Menu, loc: IPath) {
    const resource = getTmplResouces(name);
    const files: IFiles[] = resource.files.map((file: any) => {
      const fileName: string = file.name();
      return {
        name: path.join(loc.dirPath, fileName.startsWith('-') ? `${loc.fileName}${fileName}` : `${loc.fileName}.${fileName}`),
        content: this.fc.getTemplateContent(file.type, loc.fileName, loc.args),
      };
    });
    await createFiles(loc, files);
    this.fc.focusFiles(files[0].name);
  }
}