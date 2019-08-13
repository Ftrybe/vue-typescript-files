import { window, workspace, TextEditor, commands, Uri, WorkspaceEdit } from 'vscode';
import * as fs from 'fs';
import { IPath } from './models/path';
import { IFiles } from './models/file';
import { promisify } from './promisify';

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
