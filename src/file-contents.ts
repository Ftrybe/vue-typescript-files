import * as fs from 'fs';
import * as path from 'path';
import { toUpperCase } from './formatting';
import { promisify } from './promisify';
import { Template } from './template';
import * as vscode from 'vscode';
const fsReaddir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const TEMPLATES_FOLDER = 'templates';

export class FileContents {
  private templatesMap: Map<string, string>;

  constructor() {
    this.templatesMap = new Map<string, string>();
    this.loadTemplates();
  }

  async loadTemplates() {
     this.templatesMap = await this.getTemplates();
  }

  private async getTemplates() {
    const templatesPath = path.join(__dirname, TEMPLATES_FOLDER);
    const templatesFiles: string[] = await fsReaddir(templatesPath, 'utf-8');
    const templatesFilesPromises = templatesFiles.map(t => fsReadFile(path.join(__dirname, TEMPLATES_FOLDER, t), 'utf8').then(data => [t, data]));
    const templates = await Promise.all(templatesFilesPromises);
    return new Map(templates.map(x => {
      return x as [string, string]
    }));
  }

  public getTemplateContent(templateName: string, upperName: string) {
    let result = '';
    if (this.templatesMap.has(templateName)) {
      const template = this.templatesMap.get(templateName) || '';
      result = Template.replace(template, {
        upperName: toUpperCase(upperName)
      });
    }
    return result;
  }

  public focusFiles(fileName:string){
    vscode.window.showTextDocument(vscode.Uri.file(fileName));
  }
}
