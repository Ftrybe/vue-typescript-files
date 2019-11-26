import * as HandleBars from "handlebars";
export class Template {
    public static noEscape(template: string, data: any): string {
        const templateDelegate: HandleBars.TemplateDelegate = HandleBars.compile(template, { noEscape: true });
        return templateDelegate(data);
    }
    public static escape(template: string, data: any): string {
        const templateDelegate: HandleBars.TemplateDelegate = HandleBars.compile(template);
        return templateDelegate(data);
    }
}