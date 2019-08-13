import { CommandList } from './commands';


export const getTmplResouces = (name:string) =>{
  let map:Map<string,any> = new Map<string,any>();
  for(const value of CommandList){
    let suffix = "ts";
    if(value == "Component"){
      suffix = "vue";
    }
    map.set(
      value,
      {
        files:[
          {
            name: () => suffix,
            type: value.toLocaleLowerCase() + ".tmpl"
          }
        ]
      }
    );
  }
  return map.get(name);
};
