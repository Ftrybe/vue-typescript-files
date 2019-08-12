import * as fs from 'fs';
import * as path from 'path';
import * as es6Renderer from 'express-es6-template-engine';
import { toCamelCase, toUpperCase } from './formatting';
import { promisify } from './promisify';
const fsReaddir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const TEMPLATES_FOLDER = 'templates';
const TEMPLATE_ARGUMENTS = 'inputName, upperName, interfacePrefix, cmpPrefix, dirPrefix, cmpSelector, dirSelector, componentViewEncapsulation, componentChangeDetection, componentInlineTemplate, componentInlineStyle, defaultsStyleExt, routingScope, importCommonModule, params';

export class FileContents {
  private templatesMap: Map<string, Function>;

  constructor() {
    this.templatesMap = new Map<string, Function>();
  }

  async loadTemplates() {

    const templatesMap = await this.getTemplates();
    console.log(templatesMap);
    for (const [key, value] of templatesMap.entries()) {
      const compiled = es6Renderer(value, TEMPLATE_ARGUMENTS,(err:Error, content:string) => err || content);
      
      this.templatesMap.set(key, compiled);
    }
  }

  private async getTemplates() {
    const templatesPath = path.join(__dirname, TEMPLATES_FOLDER);
    const templatesFiles: string[] = await fsReaddir(templatesPath, 'utf-8');
    const templatesFilesPromises = templatesFiles.map(t => fsReadFile(path.join(__dirname, TEMPLATES_FOLDER, t), 'utf8').then(data => [t, data]));
    const templates = await Promise.all(templatesFilesPromises);
    return new Map(templates.map(x => x as [string, string]));
  }

  public getTemplateContent(template: string, inputName: string) {
    const templateName: string = template;
    console.log(this.templatesMap + "content");
    const args = [inputName,
      toUpperCase(inputName)];
    
    return (this.templatesMap.has(templateName)) ? this.templatesMap.get(templateName)(...args) : '';
  }
}
