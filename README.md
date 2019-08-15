# vue-typescript-file 说明

用于简单的创建ts组件，看的上的可以自己下载扩展。  
和vuex-module-decorators搭配使用更加。  

`npm install vuex-module-decorators`

## 预览

\!\[feature X\]\(images/feature-x.png\)

右击文件夹添加组件  

1.添加vue ts组件  
2.添加vuexmodule  
3.添加Class  
4.添加Enum  
5.添加Interface  
6.添加Declare  
### 1.0.0

没啥技术含量的添加组件。

### 1.0.1
enum拼错的Bug

### 1.0.3
添加声明文件创建

-----------------------------------------------------------------------------------------------------------

##自定义

需要自己添加组件的请修改 `commands.ts` 在数组中添加需要的组件，并在`templates`文件夹下添加相应的模板文件   
需要扩展变量的请修改`file-contents.ts`文件下的`getTemplateContent`方法，并修改调用它的方法   
对于添加的组件有特殊后缀要求的~请修改`resources.ts`文件  