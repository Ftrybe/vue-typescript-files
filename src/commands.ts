import { Menu } from "./enums/menu";

// 需要插入的添加的命令列表
export const CommandList = ():Array<string> =>{
    let array:Array<string> = new Array();
    for(const value in Menu){
        array.push(Menu[value])
    }
    return array;
}
// 生成一个集合
export function CommandsMap(){
    let map:Map<string,any> = new Map<string,any>();
    for(const value of CommandList()){
        map.set("extension.addVue"+ value ,
        {
            filename: value.toLocaleLowerCase(),
            resource: value
        });
    }
   return map;
}