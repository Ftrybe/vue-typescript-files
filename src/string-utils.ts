export class StringUtils {
    public static removeSuffix(str:string){
        return str.substr(0,str.indexOf("."));
    }
}
