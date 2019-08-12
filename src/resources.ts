import { CommandList } from './commands';


export const getTmplResouces = (name:string) =>{
  let map:Map<string,any> = new Map<string,any>();
  for(const value of CommandList){
    map.set(
      value,
      {
        files:[
          {
            name: (config:any) => "ts",
            type: value.toLocaleLowerCase() + ".tmpl"
          }
        ]
      }
    );
  }
  return map.get(name);
};
