import {build} from 'vite';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
await build({configFile:new URL('../demo/vite.config.ts',import.meta.url).pathname.replace(/^\/([A-Z]:\/)/,'$1')});
for(const page of ['overview','calendar','students','homework','bank','progress','finance','settings','about']){await mkdir('demo-dist/'+page,{recursive:true});await copyFile('demo-dist/index.html','demo-dist/'+page+'/index.html');}
await copyFile('demo-dist/index.html','demo-dist/404.html');await writeFile('demo-dist/.nojekyll','');
const base=process.env.DEMO_BASE||'/tutorspace/';const fonts='demo-dist/fonts/fonts.css';await writeFile(fonts,(await readFile(fonts,'utf8')).replaceAll('url(/fonts/',`url(${base}fonts/`));
console.log('Demo built: no backend, ChatGPT login, production records or external messaging.');
