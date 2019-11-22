import { Menu } from "./enums/menu";
import Formatting from "./formatting";

export default class Commands{
    public list(): Array<string>{
        let array:Array<string> = new Array();
        Object.values(Menu).forEach(value=>{
            array.push(value);
        });
        return array;
    }

    public map(): Map<string,any>{
        let map:Map<string,any> = new Map<string,any>();
        for(const value of this.list()){
            map.set("extension.add"+ Formatting.toUpperCase(value) ,
            {
                filename: value.toLocaleLowerCase(),
                resource: value
            });
        }
       return map;
    }
}