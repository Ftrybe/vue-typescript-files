import * as fs from 'fs';
import * as path from 'path';
import { toUpperCase, toHyphensCase, toTileCase } from './formatting';
import { promisify } from './promisify';
import { Template } from './template';
import * as vscode from 'vscode';
import { ComponentConfig, vuexConfig } from './models/config';
import { StringUtils } from './string-utils';
import { Menu } from './enums/menu';
import { freemem } from 'os';
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
  public getTemplateContent(templateName: Menu, inputName: string) {
    let result = '';
    if (this.templatesMap.has(templateName)) {
      const template = this.templatesMap.get(templateName) || '';
      result = Template.replace(template, this.textCase(templateName, inputName));
    }
    return result;
  }


  private textCase(templateName: Menu, inputName: string): {} {
    let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("vue-ts-files");
    // const isHumpcase = (config.get("global") as any)["isHumpcase"];
    const resourcesName = toTileCase(StringUtils.removeSuffix(templateName));
    let template: string = "";
    let styleLang: string = "";
    let templateLang: string = "";
    switch (resourcesName) {
      case Menu.component:
        const componentConfig: ComponentConfig = config.get("component") as ComponentConfig;
        // 转为json格式，方便遍历
        const jsonComponentConfig = JSON.parse(JSON.stringify(componentConfig));
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
              case "styleLang":
                console.log(styleLang);
                styleLang = " lang='" + jsonComponentConfig[key] + "'";
                break;
              case "templateLang":
                templateLang = " lang='" + jsonComponentConfig[key] + "'";
                break;
            }
          }
        }
        break;
      case Menu.vuexModule:
        const vuexConfig: vuexConfig = config.get("vuex") as vuexConfig;
        const jsonVuexConfig = JSON.parse(JSON.stringify(vuexConfig));
        for (let key in jsonVuexConfig) {
          if (jsonVuexConfig[key]) {
            switch (key) {
              case "suffix":
                inputName = inputName + "-" + jsonVuexConfig[key];
                break;
            }
          }
        }
        break;
    }
    // 获取配置信息

    return {
      upperName: toUpperCase(inputName),
      hyphensName: toHyphensCase(inputName),
      dynamicName: toUpperCase(inputName),
      template: template,
      templateLang: templateLang,
      styleLang: styleLang
    }
  }
  // 焦点打新建的文件
  public focusFiles(fileName: string) {
    vscode.window.showTextDocument(vscode.Uri.file(fileName));
  }

}
