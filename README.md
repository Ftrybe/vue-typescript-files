# vue-typescript-file 说明

## 详细功能介绍  

较为详细的功能介绍和动图演示，请点击[csdn](https://blog.csdn.net/zz56138/article/details/102828867 "csdn详细说明")  
  
使用vuex子模块创建按钮时，请先安装vuex-module-decorators库。
`npm install vuex-module-decorators`  

## 预览  

![image](/images/create-component.gif)  

右击文件夹添加组件(right-click folder)  

### 基本功能

1.添加vue typescript组件  
2.添加vuex module子模块（请手动添加stroe目录，并在以下创建index.ts文件和modules目录）
3.添加指令文件
3.添加空的class文件  
4.添加空的enum文件  
5.添加空的interface文件  
6.添加全局的组件声明文件  
7.snippets  

### snippets说明

```snippets
v-init    在空的vue文件中生成vue typescript模版
v-[lifecycle] vue生命周期方法代码提示
vx-init   生成vuex index文件模版  
vx-module 生成vuex 子模块模版  
```

### 创建组件命令行参数说明

添加组件创建参数

```options
-c 不使用设置文件中设置的前后缀
-p|-prefix [prefix] 给组件类名添加前缀
-s|-suffix [suffix] 给组件类名添加后缀
```

使用带有参数的选项时，将不使用全局前后缀设置。  
如：  
    使用 -p 命令，将保留全局设置的suffix属性，若不想使用全局suffix设置请继续使用不带有参数的-s命令  

### 配置说明

需要添加全局组件前后缀请选择  

```extends
文件 => 首选项 => 设置 => 扩展 => vue-typescript-files
```

添加组件自定义标签模板，请配置模版路径。前往git参考复制模版到指定路径下。 

添加自定义模版文件配置
配置vue-typescript-files.template.path为指定目录，添加自定义配置文件，文件命名规则如下  
class: class.tmpl    
component: component.tmpl  
declare: declare.tmpl  
directive: directive.tmpl  
enum: enum.tmpl  
interface: interface.tmpl  
vuex: vuex.tmpl  
该插件使用 ```handlebars```进行模版渲染，相关语法自行进行了解。  
本插件主要返回以下属性： 
```
    如输入componentName
    upperName: 首字母大写的文件名称 ComponentName
    hyphensName:  中线分隔的名称 component-name
    inputName : 输入的文件名称 
    resourcesName: 资源类型.包括component, class, declare, directive,enum,interface, vuex
    dynamicName： 拼接前后缀的文件名称，首字母大写
    args: 拼接的参数
```
冷知识，可以修改插件配置文件下package.json修改右击按钮名称，根据resourcesName后缀等参数拼接实现自定义模版.
handlebars添加帮助程序:eq,ne,lt,gt,lte,gte,and,or,inc,seq_contains方法。


#### 有任何不足或需求请在github/csdn上留言（评论），谢谢


Thanks you all for your support!

## Additional Support
* [JetBrains](https://www.jetbrains.com/?from=vue-typescript-file) - Thanks a lot for supporting vue-typescript-file project.

![JenBrains logo](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png)