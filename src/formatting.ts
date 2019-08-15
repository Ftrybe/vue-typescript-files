export const toCamelCase = (input: string) => input.replace(/-([a-z])/ig, (all, letter) => letter.toUpperCase());

export const toTileCase = (input: string) => input.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const toUpperCase = (input: string) => toCamelCase(input.charAt(0).toUpperCase() + input.slice(1));

export const toHyphensCase = (input: string) =>  input.charAt(0).toLowerCase() + input.substr(1).replace(/[A-Z]+/g, txt => "-" + txt).toLowerCase();