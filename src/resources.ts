import Commands  from './commands';
import { Menu } from './enums/menu';
import { FileSuffix } from './enums/file-suffix';

export const getTmplResouces = (name: Menu) => {
  let map: Map<string, any> = new Map<string, any>();
  const commandMap = new Commands().list();
  for (const value of commandMap) {
    let suffix = "";
    switch (value) {
      case Menu.component:
        suffix = FileSuffix.vue;
        break;
      case Menu.declare:
        suffix = FileSuffix.declare;
        break;
      default:
        suffix = FileSuffix.ts;
    }
    map.set(
      value,
      {
        files: [
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
