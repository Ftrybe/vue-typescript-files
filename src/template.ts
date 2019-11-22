import * as HandleBars from "handlebars";
export class Template{
    static replace(template: string,data:any): string{
        const templateDelegate:HandleBars.TemplateDelegate = HandleBars.compile(template,{noEscape:true});
        return templateDelegate(data);
    }
}