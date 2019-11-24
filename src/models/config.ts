export class ComponentConfig {
    prefix: string = "";
    suffix: string = "";
    templates: string = "";
    styleLang: string = "";
    templateLang: string = "";
}
export class VuexConfig {
    suffix: string = "";
}
export class MenuConfig {
    component: boolean = true;
    vuex: boolean = true;
    declare: boolean = true;
    class: boolean = true;
    interface: boolean = true;
    enum: boolean = true;
}