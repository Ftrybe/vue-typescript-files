# vue-typescript-file 说明

[csdn连接](https://blog.csdn.net/zz56138/article/details/102828867 "csdn详细说明")  
  
More efficient file creation  
`npm install vuex-module-decorators`

## 预览

![image](/images/create-component.gif)

右击文件夹添加组件(right-click folder)  

### 基本功能

1.vue typescript files  
2.vuexmodule  
3.class  
4.enum  
5.interface  
6.declare  
7.snippets  

### snippets说明

```snippets
v-init    Vue component init snippet
v-[lifecycle] vue lifecycle method tips  
vx-init   Vuex store init snippet  
vx-module Vuex module snippet  
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
文件 => 首选项 => 设置 => 扩展 => vue-ts-files
```

添加组件自定义标签模板，请在settings.json编辑类似如下代码

```templates
"vue-ts-files.component.templates": [
        "<v-ons-page>",
        "</v-ons-page>"
    ]
```
