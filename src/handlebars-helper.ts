import * as HandleBars from "handlebars";
import StringFormatter from "./formatting";
import IOUtil from "./ioutil";

export class HandleBarsHelper {

    private static instance: typeof HandleBars = HandleBars.create();
    private static workspacePath: string;

    public static getInstance(workspacePath: string): typeof HandleBars {
        this.handlebarHelper(this.instance);
        this.workspacePath = workspacePath;
        return this.instance;
    }

    public static handlebarHelper(instance: typeof HandleBars) {
        instance.registerHelper({
            eq: function (v1, v2) {
                return v1 === v2;
            },
            ne: function (v1, v2) {
                return v1 != v2;
            },
            lt: function (v1, v2) {
                return v1 < v2;
            },
            gt: function (v1, v2) {
                return v1 > v2;
            },
            lte: function (v1, v2) {
                return v1 <= v2;
            },
            gte: function (v1, v2) {
                return v1 >= v2;
            },
            and: function () {
                return Array.prototype.slice.call(arguments, 0, arguments.length - 1).every(Boolean);
            },
            or: function () {
                return Array.prototype.slice.call(arguments, 0, arguments.length - 1).some(Boolean);
            },
            inc: function (v1) {
                return parseInt(v1) + 1;
            },
            seq_contains: function (v1: Array<string>, v2: string) {
                for( var val of v1){
                    if (val == v2){
                        return true;
                    }
                }
                return false;
            },
            to_camel_case: function (v1) {
                return StringFormatter.toCamelCase(v1);
            },
            to_title_case: function(v1) {
                return StringFormatter.toTitleCase(v1);
            },
            to_pascal_case: function(v1) {
                return StringFormatter.toPascalCase(v1);
            },
            to_hyphen_case: function(v1) {
                return StringFormatter.toHyphenCase(v1);
            },
            to_locale_lower_case_first: function(v1) {
                return StringFormatter.toLocaleLowerCaseFirst(v1);
            },
            case_from_json: function(v1, filename) {
                const text = IOUtil.readText(HandleBarsHelper.workspacePath,filename);
                const json = JSON.parse(text);
                return json[v1] ?? json['default'];
            }
        });
    }
}