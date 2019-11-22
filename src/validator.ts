export class Validator {
    public static hasNotIllegalCharacters(inputName: string) {
        const regx = /^[a-zA-Z]+[_0-9A-z]*/;
        return regx.test(inputName);
    }
    public static hasIllegalCharacters(inputName: string) {
        return !this.hasNotIllegalCharacters(inputName);
    }
    public static hasArgs(value: string) {
        if (value) {
            if (this.hasIllegalCharacters(value))
                return false;
            return true;
        }
        return false;
    }
}
