import * as fs from 'fs';
import * as path from 'path';
import Formatting from './formatting';
import Promisify from './promisify';
import { Template } from './template';
import * as vscode from 'vscode';
import { ComponentConfig } from './models/component-config';
import { VuexConfig } from './models/vuex-config';
import { StringUtils } from './string-utils';
import { Menu } from './enums/menu';
import { Validator } from './validator';
import { FileConfig } from './models/file-config';

export class FileContents {
  private templatesMap: Map<string, string>;
  private readonly TEMPLATES_FOLDER = 'templates';
  private config: vscode.WorkspaceConfiguration;
  private fsReaddir: any;
  private fsReadFile: any;

  constructor() {
    this.fsReaddir = Promisify.apply(fs.readdir);
    this.fsReadFile = Promisify.apply(fs.readFile);
    this.templatesMap = new Map<string, string>();
    this.config = vscode.workspace.getConfiguration("vue-ts-files");
    this.loadTemplates();
  }

  private async loadTemplates() {
    this.templatesMap = await this.getTemplates();
  }
  // 获取模板信息
  private async getTemplates(): Promise<Map<string, string>> {
    const templatesPath = path.join(__dirname, this.TEMPLATES_FOLDER);
    const templatesFiles: string[] = await this.fsReaddir(templatesPath, 'utf-8');
    const templatesFilesPromises = templatesFiles.map(t => this.fsReadFile(path.join(__dirname, this.TEMPLATES_FOLDER, t), 'utf8').then((data: any) => [t, data]));
    const templates = await Promise.all(templatesFilesPromises);
    return new Map(templates.map(x => {
      return x as [string, string]
    }));
  }
  // 获得修改后的模板内容
  public getTemplateContent(templateName: Menu, inputName: string, args: string[]) {
    let result = '';
    if (this.templatesMap.has(templateName)) {
      const template = this.templatesMap.get(templateName) || '';
      result = Template.replace(template, this.textCase(templateName, inputName, args));
    }
    return result;
  }

  private textCase(templateName: Menu, inputName: string, args: string[]): {} {
    let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("vue-ts-files");
    // const isHumpcase = (config.get("global") as any)["isHumpcase"];
    const resourcesName = Formatting.toTileCase(StringUtils.removeSuffix(templateName));
    let fileConfig: FileConfig = new FileConfig();
    switch (resourcesName) {
      case Menu.component:
        fileConfig = this.parseConfig("component", (key: string, jsonKey: any) => {
          switch (key) {
            case "prefix":
              fileConfig.suffix = jsonKey;
              break;
            case "suffix":
              fileConfig.suffix = jsonKey;
              break;
            case "templates":
              const array = jsonKey as Array<string>
              array.map((value: string, index: number, array: string[]) => {
                fileConfig.templates += value;
                if (index < array.length - 1) {
                  fileConfig.templates += "\n\t";
                }
              });
              break;
            case "styleLang":
              fileConfig.styleLang = " lang='" + jsonKey + "'";
              break;
            case "templateLang":
              fileConfig.templateLang = " lang='" + jsonKey + "'";
              break;
          }
        })
        if (args) {
          args.forEach((value: string, index: number, array: string[]) => {
            const nextValue = array[index + 1];
            if (value.indexOf("-") == 0) {
              switch (value) {
                case "-c" || "-component":
                  if (!Validator.hasArgs(nextValue)) {
                    fileConfig.prefix = "";
                    fileConfig.suffix = "";
                  }
                  break;
                case "-s" || "-suffix":
                  if (Validator.hasArgs(nextValue)) {
                    fileConfig.suffix = Formatting.toUpperCase(nextValue);
                  } else {
                    fileConfig.suffix = "";
                  }
                  break;
                case "-p" || "-prefix":
                  if (Validator.hasArgs(nextValue)) {
                    fileConfig.prefix = Formatting.toUpperCase(nextValue);
                    inputName = Formatting.toUpperCase(inputName);
                  } else {
                    fileConfig.prefix = "";
                  }
                  break;
              }
            }
          })
        }
        break;
      case Menu.vuexModule:

        fileConfig = this.parseConfig("vuex", (key: string, jsonKey: any) => {
          switch (key) {
            case "suffix":
              fileConfig.suffix = jsonKey;
              break;
          }
        })
        break;
    }
    // 获取配置信息
    inputName = fileConfig.prefix + (fileConfig.prefix ? "-" : "") + inputName + (fileConfig.suffix ? "-" : "") + fileConfig.suffix;
    return {
      upperName: Formatting.toUpperCase(inputName),
      hyphensName: Formatting.toHyphensCase(inputName),
      dynamicName: Formatting.toUpperCase(inputName),
      template: fileConfig.templates,
      templateLang: fileConfig.templateLang,
      styleLang: fileConfig.styleLang
    }
  }
  // 焦点打新建的文件
  public focusFiles(fileName: string) {
    vscode.window.showTextDocument(vscode.Uri.file(fileName));
  }

  private parseConfig(configName: string, switchExtend?: any): FileConfig {
    const workspaceConfig = this.config.get(configName);
    const jsonConfig = JSON.parse(JSON.stringify(workspaceConfig));
    const fileConfig: FileConfig = new FileConfig();

    for (let key in jsonConfig) {
      if (jsonConfig[key]) {
        const jsonKey = jsonConfig[key];
        if (switchExtend) {
          switchExtend(key, jsonKey);
        }
      }
    }
    return fileConfig;
  }
}
