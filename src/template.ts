export class Template{
    static replace(template: string,data:any): string{
        let tplStr = template;
        var reg = /{{(\w+)}}/;
        var result = null;
        while (result = reg.exec(tplStr)){
            tplStr = tplStr.replace(result[0],data[result[1]]);
        }
        return tplStr; 
    }
}