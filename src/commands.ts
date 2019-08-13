// 需要插入的添加的命令列表
export const CommandList = [
    "Component",
    "Class",
    "Interface"];
// 生成一个集合
export function CommandsMap(){
    let map:Map<string,any> = new Map<string,any>();
    for(const vlaue of CommandList){
        map.set("extension.addVue"+ vlaue ,
        {
            filename: "vue-"+ vlaue.toLocaleLowerCase(),
            resource: vlaue
        });
    }
   return map;
}