import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const base=process.env.DEMO_BASE||'/tutorspace/';
export default defineConfig({root,base,plugins:[{name:'demo-navigation',enforce:'pre',transform(code,id){if(!id.replaceAll('\\','/').includes('/app/')||!id.endsWith('.tsx'))return;let text=code.replaceAll("href={'/'+key}",`href={'${base}'+key}`).replace(/href=(["'])(\/(?:overview|calendar|students|homework|bank|progress|finance|settings|about|signout-with-chatgpt)?[^"']*)\1/g,(_,q,path)=>`href=${q}${path.startsWith('/signout')?base:base+path.slice(1)}${q}`);if(text.includes('window.location.assign(')){text=`import {demoNavigate as __demoNavigate} from ${JSON.stringify(fileURLToPath(new URL('./route.ts',import.meta.url)))};\n`+text.replaceAll('window.location.assign(','__demoNavigate(');}return text;}} ,react()],build:{outDir:'demo-dist',emptyOutDir:true},server:{host:'127.0.0.1',port:4175},preview:{host:'127.0.0.1',port:4175}});
