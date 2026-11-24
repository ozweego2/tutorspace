export const demoBase=import.meta.env.BASE_URL;
export function demoPath(path:string){if(path.startsWith(demoBase)&&demoBase!=='/')return path;return demoBase+path.replace(/^\//,'');}
export function demoNavigate(path:string){location.assign(demoPath(path));}
