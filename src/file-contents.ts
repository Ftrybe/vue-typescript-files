import * as fs from 'fs';
import * as path from 'path';
import { toUpperCase, toHyphensCase } from './formatting';
import { promisify } from './promisify';
import { Template } from './template';
import * as vscode from 'vscode';
import { ComponentConfig } from './models/config';
import { StringUtils } from './string-utils';
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
  // 获取模板信息
  private async getTemplates() {
    const templatesPath = path.join(__dirname, TEMPLATES_FOLDER);
    const templatesFiles: string[] = await fsReaddir(templatesPath, 'utf-8');
    const templatesFilesPromises = templatesFiles.map(t => fsReadFile(path.join(__dirname, TEMPLATES_FOLDER, t), 'utf8').then(data => [t, data]));
    const templates = await Promise.all(templatesFilesPromises);
    return new Map(templates.map(x => {
      return x as [string, string]
    }));
  }
  // 获得修改后的模板内容
  public getTemplateContent(templateName: string, inputName: string) {
    let result = '';
    if (this.templatesMap.has(templateName)) {
      const template = this.templatesMap.get(templateName) || '';
      result = Template.replace(template, this.textCase(templateName,inputName));
    }
    return result;
  }

 
  private textCase(templateName:string,inputName: string): {} {
    
    const resouceName = StringUtils.removeSuffix(templateName);
    switch(resouceName){
      
    }
    // 获取配置信息
    let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("vue-ts-files");
    const componentConfig: ComponentConfig = config.get("component") as ComponentConfig;
    // 转为json格式，方便遍历
    const jsonComponentConfig = JSON.parse(JSON.stringify(componentConfig));
    let template: string = "";
    for (let key in jsonComponentConfig) {
      if (jsonComponentConfig[key]) {
        switch (key) {
          case "prefix":
            inputName = jsonComponentConfig[key] + "-" + inputName;
            break;
          case "suffix":
            inputName = inputName + "-" + jsonComponentConfig[key];
            break;
          case "templates":
            const t = jsonComponentConfig[key] as Array<string>
            t.map((value: string, index: number, array: string[]) => {
              template += value;
              if (index < array.length - 1) {
                template += "\n\t";
              }
            });
            break;
        }
      }
    }
    return {
      upperName: toUpperCase(inputName),
      hyphensName: toHyphensCase(inputName),
      dynamicName: toUpperCase(inputName),
      template: template
    }
  }
  // 焦点打新建的文件
  public focusFiles(fileName: string) {
    vscode.window.showTextDocument(vscode.Uri.file(fileName));
  }

}
