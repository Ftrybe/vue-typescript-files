import * as fs from 'fs-extra';
import { join }  from 'path';
import StringFormatting from './formatting';
import { HandleBarsHelper } from './handlebars-helper';
import * as vscode from 'vscode';
import { FileNameUtils } from './file-name.utils';
import { Menu } from './enums/menu';
import { FileConfig } from './models/file-config';
import { TemplateConfig } from "./models/template-config";
import ExtendParams from './extend-params';
import { CommandOptions } from "./models/command-options";
import { HANDLEBARS_FILE_SPLIT_SYMBOL } from './config';
export class FileContents {
  private readonly TEMPLATES_FOLDER = 'templates';
  private readonly NEW_CONFIG_NAME = 'vue-typescript-files';
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration(this.NEW_CONFIG_NAME);
  }

  private getTemplate(workspacePath: string , templateName: string): string {
    const workspaceConfigDir = join(workspacePath, '.' + this.NEW_CONFIG_NAME);
    // 获取当前工作区下是否有自定义模版
    const hasworkspaceConfigDir = fs.existsSync(workspaceConfigDir);
    
    if (hasworkspaceConfigDir) {
      const templatePath = join(workspaceConfigDir, templateName);
      if  (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf8');
      }
    }
    // * 解析模版配置
    const templateConfig : TemplateConfig = this.parseConfig('template');

    // * 自定义模版路径
    
    const customPath = templateConfig.path;
    
    if (customPath && fs.existsSync(join(customPath, templateName)) ) {
      return fs.readFileSync(join(customPath, templateName), 'utf8');
    }

    const rootPath = join(__dirname, this.TEMPLATES_FOLDER, templateName);

    if (fs.existsSync(rootPath)) {
      return fs.readFileSync(rootPath, 'utf8');
    }
    
    return '';

  }

  private getWorkspacePath(uri: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const workspacePath = workspaceFolder?.uri.fsPath || '';
    return workspacePath;
  }

  // 获得修改后的模板内容
  public async getTemplateContent(uri: vscode.Uri, templateName: Menu, inputName: string, args: string[]) {
    let result = '';
    let tmplName = templateName.toString();
    const workspacePath = this.getWorkspacePath(uri);
    const options = this.buildArgs(args);
    
    if (options.hasTemplateModifier()) {
      let [prefix, suffix] = tmplName.split(".");
      tmplName = prefix + HANDLEBARS_FILE_SPLIT_SYMBOL + options.templateModifier + "." + suffix;
    }
    const template = this.getTemplate(workspacePath,tmplName);
    if (template && template != '') {
      const params = await ExtendParams.getExtendParams(workspacePath, templateName, inputName,options);
      const text = this.textCase(templateName, inputName, params);
      const intance = HandleBarsHelper.getInstance(workspacePath);
      const templateDelegate = intance.compile(template, { noEscape: true});
      result = templateDelegate(text);
    }
    return result;
  }

  private buildArgs(args: string[]): CommandOptions {
    let templateModifier = '';
    let foundDollar = false;
    let scriptParameters: string[] = [];
    let skips: number[] = [];
    let dynamicPathParts: string[] = [];
    let overridePath = '';
    for (let i = 0; i < args.length; i++) {
        if (skips.includes(i)) {
            continue; // 跳过已处理的参数
        }
        const arg = args[i];
        
        if (!foundDollar && arg.startsWith("$")) {
            templateModifier = arg.substring(1);
            foundDollar = true;
        } else if (arg.startsWith("-e")) {
            if (i + 1 < args.length) { // 确保有下一个元素
                const next = args[i + 1];
                if (next && next.includes('=')) { // 检查是否为 key=value 形式
                    scriptParameters.push(next);
                    skips.push(i + 1); // 添加到跳过的索引中
                }
            }
        } else if (arg.startsWith("-url")) {
            if (i + 1 < args.length) { // 确保有下一个元素
                overridePath = args[i + 1];
                skips.push(i + 1); // 添加到跳过的索引中
            }
        } else if (arg.startsWith(":")) {
            dynamicPathParts.push(arg.substring(1));
        }
    }

    return new CommandOptions(
        scriptParameters,
        templateModifier,
        dynamicPathParts,
        overridePath
    )
}

  public textCase(templateName: string | Menu, inputName: string, extendParams: {}): {} {
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
