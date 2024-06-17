export class CommandOptions {
    scriptParameters: string[];
    templateModifier: string;
    dynamicPathParts: string[];
    overridePath: string;

    constructor(scriptParameters: string[], templateModifier: string, dynamicPathParts: string[], overridePath: string) {
        this.scriptParameters = scriptParameters;
        this.templateModifier = templateModifier;
        this.dynamicPathParts = dynamicPathParts;
        this.overridePath = overridePath;
    }

	public hasTemplateModifier() {
		return this.templateModifier != null && this.templateModifier.length > 0;
	}

	public overidePathOrDefualt(defaultValue: string) {
		return this.overridePath != null && this.overridePath.length > 0 ? this.overridePath : defaultValue;
	}
}