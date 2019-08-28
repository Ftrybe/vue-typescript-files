# vue-typescript-file 说明

用于简单的创建ts组件，看的上的可以自己下载扩展。  
和vuex-module-decorators搭配使用更加。  

More efficient file creation  
`npm install vuex-module-decorators`

## 预览

![image](/images/create-component.gif)

右击文件夹添加组件(right-click folder)  

### 基本功能

1.添加vue ts组件  
2.添加vuexmodule  
3.添加Class  
4.添加Enum  
5.添加Interface  
6.添加Declare  
7.snippets  

### snippets说明

```snippets
v-init    Vue component init snippet  
vx-init   Vuex store init snippet  
vx-module Vuex module snippet  
```

### 配置说明

需要添加前后缀请选择  

```extends
文件 => 首选项 => 设置 => 扩展 => vue-ts-files
```

添加组件自定义标签模板，请在settings.json编辑类似如下代码

```templates
"vue-ts-files.component.templates": [
        "<v-ons-page>",
        "</v-ons-page>"
    ]
```

-----------------------------------------------------------------------------------------------------------

## 自定义

需要自己添加组件的请修改枚举类`menu`，以首字母大写的命名方式添加需要的组件，并在`templates`文件夹下添加相应的模板文件  
需要扩展变量的请修改`file-contents.ts`文件下的`textCase()`方法，修改或添加需要的信息  
对于添加的组件有特殊后缀要求的~请修改`resources.ts`文件  
