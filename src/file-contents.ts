import * as fs from 'fs-extra';
import * as path from 'path';
import StringFormatting from './formatting';
import { HandleBarsHelper } from './handlebars-helper';
import * as vscode from 'vscode';
import { FileNameUtils } from './file-name.utils';
import { Menu } from './enums/menu';
import { FileConfig } from './models/file-config';
import { TemplateConfig } from "./models/template-config";
export class FileContents {
  private readonly TEMPLATES_FOLDER = 'templates';
  private readonly NEW_CONFIG_NAME = 'vue-typescript-files';
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration(this.NEW_CONFIG_NAME);
  }

  private getTemplate(workspacePath: string , templateName: string): string {
    const workspaceConfigDir = workspacePath + '/.' + this.NEW_CONFIG_NAME;
    // 获取当前工作区下是否有自定义模版
    const hasworkspaceConfigDir = fs.existsSync(workspaceConfigDir);
    
    if (hasworkspaceConfigDir) {
      if  (fs.existsSync(workspaceConfigDir + "/" + templateName)) {
        return fs.readFileSync(workspaceConfigDir + "/" + templateName, 'utf8');
      }
    }
    // * 解析模版配置
    const templateConfig : TemplateConfig = this.parseConfig('template');

    // * 自定义模版路径
    
    const customPath = templateConfig.path;
    
    if (customPath && fs.existsSync(path.join(customPath, templateName)) ) {
      return fs.readFileSync(path.join(customPath, templateName), 'utf8');
    }
    
    return fs.readFileSync(path.join(__dirname, this.TEMPLATES_FOLDER, templateName), 'utf8');

  }

  private getWorkspacePath(uri: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const workspacePath = workspaceFolder?.uri.fsPath || '';
    return workspacePath;
  }

  // 获得修改后的模板内容
  public getTemplateContent(uri: vscode.Uri, templateName: Menu, inputName: string, args: string[]) {
    let result = '';
    let tmplName = templateName.toString();
    const workspacePath = this.getWorkspacePath(uri);
    const { filteredArray, flag } = this.filterAndExtractFlag(args);
    
    if (flag && flag != null && flag != undefined && flag != '') {
      let [prefix, suffix] = tmplName.split(".");
      tmplName = prefix + flag + "." + suffix;
    }
    const template = this.getTemplate(workspacePath,tmplName);
    if (template && template != '') {
      const text = this.textCase(templateName, inputName, filteredArray, {});
      const intance = HandleBarsHelper.getInstance(workspacePath);
      const templateDelegate = intance.compile(template, { noEscape: true});
      result = templateDelegate(text);
    }
    return result;
  }

  private filterAndExtractFlag(args: string[]): any {
    let filteredArray = [];
    let flag = null;
    let foundDollar = false;

    for (let i = 0; i < args.length; i++) {
      if (!foundDollar && args[i].startsWith("$")) {
        flag = args[i].substring(1);
        foundDollar = true;
      } else {
        filteredArray.push(args[i]);
      }
    }
    return {
      filteredArray: filteredArray,
      flag: flag
    };
  }

  private textCase(templateName: Menu, inputName: string, args: string[], extendParams: {}): {} {
    // const isHumpcase = (config.get("global") as any)["isHumpcase"];
    const resourcesName = FileNameUtils.removeSuffix(templateName).toLocaleLowerCase();
    let className = inputName;
    let fileConfig: FileConfig = new FileConfig();
   
    if(this.parseConfig("file")?.spotStyleName){
      className = StringFormatting.replaceDotWithHyphen(className);
    }

    // 获取配置信息
    className = fileConfig.prefix + (fileConfig.prefix ? "-" : "") + className + (fileConfig.suffix ? "-" : "") + fileConfig.suffix;  
    let result = {
      inputName: inputName,
      args: args,
      resourcesName: resourcesName,
      hyphensName: StringFormatting.toHyphenCase(className),
      dynamicName: StringFormatting.toPascalCase(className),
      fileName: StringFormatting.toPascalCase(inputName),
      ...extendParams
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
