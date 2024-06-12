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
    const workspacePath = this.getWorkspacePath(uri);
    const template = this.getTemplate(workspacePath,templateName);
    if (template && template != '') {
      const text = this.textCase(templateName, inputName, args);
      const intance = HandleBarsHelper.getInstance(workspacePath);
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
   
    if(this.parseConfig("file")?.spotStyleName){
      className = StringFormatting.replaceDotWithHyphen(className);
    }
    // 获取配置信息
    className = fileConfig.prefix + (fileConfig.prefix ? "-" : "") + className + (fileConfig.suffix ? "-" : "") + fileConfig.suffix;
    
    const result = {
      inputName: inputName,
      args: inputArgs,
      resourcesName: resourcesName,
      hyphensName: StringFormatting.toHyphenCase(className),
      dynamicName: StringFormatting.toPascalCase(className),
      fileName: StringFormatting.toPascalCase(inputName),
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
