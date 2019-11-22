export default class Formatting {
    private constructor(){}

    public static toCamelCase(input: string) {
        return input.replace(/-([a-z])/ig, (all, letter) => letter.toUpperCase());
    }

    public static toTileCase(input: string) {
        return input.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    public static toUpperCase(input: string) {
        return this.toCamelCase(input.charAt(0).toUpperCase() + input.slice(1));
    }
    
    public static toHyphensCase(input: string) {
        return input.charAt(0).toLowerCase() + input.substr(1).replace(/[A-Z]+/g, txt => "-" + txt).toLowerCase();
    }
}