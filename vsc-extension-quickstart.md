# vue-typescript-file 说明

## 预览  

![image](/images/create-component.gif)  

右击文件夹添加组件(right-click folder)  

### 基本功能

组件提供资源管理器右击菜单扩展。对应的模版文件需要自己编写。  

目前提供7个扩展按钮，如下：

1. 生成组件模版
2. 生成vuex模版
3. 生成指令模版
4. 生成组件声明模版
5. 生成类文件模版
6. 生成枚举模版
7. 生成接口模版

如果需要的扩展按钮不为以上7种，可以直接进入插件包管理目录，修改package.json中对应的按钮显示名称以实现自定义扩展。

### 创建组件命令行参数说明

空格分隔符后除了带`$`符号的的参数都可以在模版中使用 `{{args}}`获取.

当使用带有`$`符号的参数时，将对模版名称进行拼接查找。如： 如果选择创建`Class`，文件名输入 `User $-dialog` 那么将会寻找在定义模版路径下的 `class-dialog`文件进行渲染。

### 配置说明

需要添加全局组件前后缀请选择  

```extends
文件 => 首选项 => 设置 => 扩展 => vue-typescript-files
```

添加组件自定义标签模板，请配置模版路径。前往git参考复制模版到指定路径下。 

**模版文件加载说明**

1. 在当前工作区下添加`.vue-typescript-files`目录，渲染模版将优先寻找当前目录下的模版
2. 配置vue-typescript-files.template.path为指定目录，在`.vue-typescript-files`目录下找不到文件时将使用当前目录下的模版
3. 插件自带的模版最后获取

**自定义模版命名**

对于自定义模版有严格的命名要求。文件必须以指定模版类型为前缀,以`.tmpl`结尾。支持的类型如下：

1. class => class.tmpl
2. component => component.tmpl
3. declare => declare.tmpl  
4. directive =>  directive.tmpl 
5. enum => enum.tmpl 
6. interface => interface.tmpl
7. vuex => vuex: vuex.tmpl

该插件使用 ```handlebars```进行模版渲染，相关语法自行进行了解。  
本插件主要返回以下属性： 

```
    如输入componentName
    hyphensName:  中线分隔的名称 component-name
    inputName : 输入的文件名称 
    resourcesName: 资源类型.包括component, class, declare, directive,enum,interface, vuex
    dynamicName： 大写开头的动态名称
    args: 拼接的参数
```
