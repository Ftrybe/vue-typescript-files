import { FileSuffix } from "./enums/file-suffix";
import { Menu } from "./enums/menu";

export class FileNameUtils {
    public static removeSuffix(str: string) {
        return str.substring(0, str.indexOf("."));
    }

    public static getSuffix(menuName: Menu | string): string {
        let suffix = "";
        switch (menuName) {
            case Menu.component:
                suffix = FileSuffix.vue;
                break;
            case Menu.declare:
                suffix = FileSuffix.declare;
                break;
            default:
                suffix = FileSuffix.ts;
        }
        return suffix;
    }
}
