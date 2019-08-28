# vue-typescript-file 说明

用于简单的创建ts组件，看的上的可以自己下载扩展。  
和vuex-module-decorators搭配使用更加。  

More efficient file creation  
`npm install vuex-module-decorators`

```Vuex index.ts
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: { },
});
```

## 预览

![image](/images/create-component.gif)

右击文件夹添加组件(right-click folder)  

1.添加vue ts组件  
2.添加vuexmodule  
3.添加Class  
4.添加Enum  
5.添加Interface
6.添加Declare  

```snippets
v-init    Vue component init snippet  
vx-init   Vuex store init snippet  
vx-module Vuex module snippet  
```

需要添加前后缀请选择  

```extends
文件 => 首选项 => 设置 => 扩展 => vue-ts-files
```

进行设置

添加组件自定义标签模板，请在settings.json编辑类似如下代码

```templates
"vue-ts-files.component.templates": [
        "<v-ons-page>",
        "</v-ons-page>"
    ]
```

### 1.0.7

添加三个代码段，用于生成组件  
添加设置模板引擎

### 1.0.5

添加设置组件的css预编译

### 1.0.4

允许组件类名中添加前后缀，防止与基本类重名  
允许vuex模块在类名中添加后缀  
允许在添加组件时自定义添加标签
解决创建相同文件覆盖问题

### 1.0.3

添加声明文件创建

### 1.0.1

enum拼错的Bug

### 1.0.0

没啥技术含量的添加组件。

-----------------------------------------------------------------------------------------------------------

## 自定义

需要自己添加组件的请修改枚举类`menu`，以首字母大写的命名方式添加需要的组件，并在`templates`文件夹下添加相应的模板文件  
需要扩展变量的请修改`file-contents.ts`文件下的`textCase()`方法，修改或添加需要的信息  
对于添加的组件有特殊后缀要求的~请修改`resources.ts`文件  
