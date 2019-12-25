import Commands from './commands';
import { Menu } from './enums/menu';
import { FileNameUtils } from './file-name.utils';

export class Resources{
  public static getTmplResources(name:Menu){
    let map: Map<string, any> = new Map<string, any>();
    const commandMap = new Commands().list();
    for (const value of commandMap) {
      let suffix = FileNameUtils.getSuffix(value);
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
  }
}
