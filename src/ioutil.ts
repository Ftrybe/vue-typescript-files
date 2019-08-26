import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import { IPath } from './models/path';
import { IFiles } from './models/file';
import { promisify } from './promisify';
import { Menu } from './enums/Menu';
import { FileSuffix } from './enums/file-suffix';

const fsWriteFile = promisify(fs.writeFile);

// Get file contents and create the new files in the folder 
export const createFiles = async (loc: IPath, files: IFiles[]) => {
  try {
    await writeFiles(files);
  } catch (ex) {
    await window.showErrorMessage(`文件不能创建. ${ex}`);
  }

  return loc.dirPath;
};

const writeFiles = async (files: IFiles[]) => {
  const filesPromises: Promise<any>[] = files.map(file => fsWriteFile(file.name, file.content));
  
  await Promise.all(filesPromises);
};

export const searchFiles = async (folderDir:string,fileName:string,resourceType:Menu):Promise<boolean> =>{
  let suffix = "";
  let flag = false;
  switch(resourceType){
      case Menu.component:
          suffix =  FileSuffix.vue;
          break;
      case Menu.declare:
          suffix = FileSuffix.declare;
          break;
      default:
         suffix = FileSuffix.ts;
  }
  const longFilename = fileName + "." + suffix;
   fs.readdirSync(folderDir).forEach(file => {
    if(file == longFilename){
      flag = true;
    }});
  return flag;
}