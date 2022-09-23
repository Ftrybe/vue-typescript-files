import * as fs from 'fs-extra';
import * as path from 'path';
import Formatting from './formatting';
import { HandleBarsHelper } from './handlebars-helper';
import * as vscode from 'vscode';
import { FileNameUtils } from './file-name.utils';
import { Menu } from './enums/menu';
import { Validator } from './validator';
import { FileConfig } from './models/file-config';
import { TemplateConfig } from "./models/template-config";
export class FileContents {
  private templatesMap: Map<string, string>;
  private readonly TEMPLATES_FOLDER = 'templates';
  private readonly OLD_CONFIG_NAME = 'vue-ts-files';
  private readonly NEW_CONFIG_NAME = 'vue-typescript-files';
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.templatesMap = new Map<string, string>();
    const workspaceConfig = vscode.workspace.getConfiguration(this.NEW_CONFIG_NAME);
    this.config = vscode.workspace.getConfiguration().has(this.OLD_CONFIG_NAME) ? vscode.workspace.getConfiguration(this.OLD_CONFIG_NAME) : workspaceConfig;
    this.loadTemplates();
  }

  private async loadTemplates() {
    this.templatesMap = await this.getTemplates();
  }
  // 获取模板信息
  private async getTemplates(): Promise<Map<string, string>> {

    // * 解析模版配置
    const templateConfig : TemplateConfig = this.parseConfig('template');

    const templatesPath = path.join(__dirname, this.TEMPLATES_FOLDER);

    const templatesFiles: string[] = await fs.readdir(templatesPath);

    const customPath = templateConfig.path; 

    const templatesFilesPromises = templatesFiles.map( file => {
      // * 有自定义文件
      if ( customPath && fs.existsSync(path.join(customPath, file)) ) {
        return fs.readFile(path.join(customPath, file), 'utf8').then((data: any) => [file, data]);
      }
      return  fs.readFile(path.join(__dirname, this.TEMPLATES_FOLDER, file), 'utf8').then((data: any) => [file, data])
    });

    // const templatesFilesPromises = templatesFiles.map(t => fs.readFile(path.join(__dirname, this.TEMPLATES_FOLDER, t), 'utf8').then((data: any) => [t, data]));
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
      const text = this.textCase(templateName, inputName, args);
      const intance =  HandleBarsHelper.getInstance();
      const templateDelegate = intance.compile(template, { noEscape: true});
      result = templateDelegate(text);
    }
    return result;
  }

  private textCase(templateName: Menu, inputName: string, args: string[]): {} {
    // const isHumpcase = (config.get("global") as any)["isHumpcase"];
    const resourcesName = FileNameUtils.removeSuffix(templateName).toLocaleLowerCase();
    let className = inputName;
    let fileConfig: FileConfig = new FileConfig();
    var inputArgs: string[] = [];
    switch (resourcesName) {
      case Menu.component:
        this.parseConfig("component", async (key: string, jsonKey: any) => {
          switch (key) {
            case "prefix":
              fileConfig.prefix = jsonKey;
              break;
            case "suffix":
              fileConfig.suffix = jsonKey;
              break;
              case "templates":
                if (jsonKey instanceof Array) {
                    const array = jsonKey;
                    fileConfig.templates = "\t";
                    array.map((value, index, array) => {
                        fileConfig.templates += value;
                        if (index < array.length - 1) {
                            fileConfig.templates += "\n\t";
                        }
                    });
                } 
              break;
            case "styleLang":
              fileConfig.styleLang = " lang='" + jsonKey + "'";
              break;
            case "templateLang":
              fileConfig.templateLang = " lang='" + jsonKey + "'";
              break;
            case "styleScope":
              fileConfig.styleScope = " " + jsonKey;
          }
        })
        if (args) {
          inputArgs = args;
          args.forEach((value: string, index: number, array: string[]) => {
            const nextValue = array[index + 1];
            if (value.startsWith("-")) {

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
                    className = Formatting.toUpperCase(className);
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
        this.parseConfig("vuex", (key: string, jsonKey: any) => {
          switch (key) {
            case "suffix":
              fileConfig.suffix = jsonKey;
              break;
            case "exportModule":
              fileConfig.exportModule = jsonKey;
              break;
          }
        })
        break;
    }
    if(this.parseConfig("file")?.spotStyleName){
      className = Formatting.toCamelCaseWithSpot(className);
    }
    // 获取配置信息
    className = fileConfig.prefix + (fileConfig.prefix ? "-" : "") + className + (fileConfig.suffix ? "-" : "") + fileConfig.suffix;
    
    const result = {
      resourcesName: resourcesName,
      upperName: Formatting.toUpperCase(className),
      hyphensName: Formatting.toHyphensCase(className),
      dynamicName: Formatting.toUpperCase(className),
      inputName: inputName,
      args: inputArgs,
      fileName: Formatting.toUpperCase(inputName),
      template: fileConfig.templates,
      templateLang: fileConfig.templateLang,
      styleLang: fileConfig.styleLang,
      styleScope: fileConfig.styleScope,
      exportModule: fileConfig.exportModule
    }
    return result;
  }
  // * 解析配置文件 
  private parseConfig(configName: string, switchExtend?: any) {

    const plusConfig = this.config.get(configName);
    if(!plusConfig){
      return null;
    }
    const jsonConfig = JSON.parse(JSON.stringify(plusConfig));
    if (switchExtend) {
      for (let key in jsonConfig) {
        const jsonKey = jsonConfig[key];
        if (jsonKey) {
            switchExtend(key, jsonKey);
          }
        }
      }
    return jsonConfig;
  }
}
