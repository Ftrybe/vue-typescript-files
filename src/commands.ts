import { Menu } from "./enums/menu";
import Formatting from "./formatting";

export default class Commands{
    // * 根据定义的枚举类型获取指令名称
    public static list(): Array<string>{
        let array:Array<string> = new Array();
        Object.values(Menu).forEach(value=>{
            array.push(value);
        });
        return array;
    }

     // * 根据定义的枚举类型获取指令名称
    public static map(): Map<string,any>{
        let map:Map<string,any> = new Map<string,any>();
        for(const value of this.list()){
            map.set("extension.add"+ Formatting.toPascalCase(value) ,
            {
                filename: value.toLocaleLowerCase(),
                resource: value
            });
        }
       return map;
    }
}