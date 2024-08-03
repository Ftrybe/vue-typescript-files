export interface PreviewState {
	fileName: string;
	templateDir: string;
	template: string;
	customParams: CustomParam[];
	templateList:  TemplateFile[];
	syncConfig: boolean;
}

export interface TemplateFile {
	name: string;

	path: string;
}

export interface CustomParam {
	key: string;
	type: 'string' | 'api' | 'js' | 'json';
	value: string | ApiParam | any;
	
	// 不进行配置
	scope: string;
}

export interface ApiParam {
	apiUrl: string;
	headers: { key: string; value: string }[];
}



export interface ConfigJson {
    [key: string]: string | {
        type: string;
        value: any;
        scope?: string[];
    };
}
