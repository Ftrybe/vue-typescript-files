export interface PreviewState {
	fileName: string;
	templateDir: string;
	template: string;
	customParams: CustomParam[];
	templateList:  TemplateFile[];
}

export interface TemplateFile {
	name: string;

	path: string;
}

export interface CustomParam {
	key: string;
	type: 'string' | 'api' | 'js' | 'json';
	value: string | ApiParam | any;
}

export interface ApiParam {
	apiUrl: string;
	headers: { key: string; value: string }[];
}