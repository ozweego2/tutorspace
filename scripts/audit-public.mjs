import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:30*1024*1024});const objects=git('rev-list','--objects','--all').trim().split('\n');const findings=[];let blobs=0;
const patterns=[/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{30,}/,/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bAKIA[A-Z0-9]{16}\b/];
for(const line of objects){const [sha,...name]=line.split(' ');if(git('cat-file','-t',sha).trim()!=='blob')continue;const bytes=execFileSync('git',['cat-file','blob',sha],{maxBuffer:15*1024*1024});if(bytes.includes(0))continue;blobs++;const text=bytes.toString('utf8');if(patterns.some(p=>p.test(text)))findings.push(name.join(' ')||sha);}
const bundle=fs.readdirSync('demo-dist/assets').filter(p=>p.endsWith('.js')).map(p=>fs.readFileSync('demo-dist/assets/'+p,'utf8')).join('\n');for(const marker of ['tutorspace-math-workspace','oai-authenticated-user-id','TELEGRAM_BOT_TOKEN','cloudflare:workers'])if(bundle.includes(marker))findings.push('demo bundle: '+marker);
console.log(JSON.stringify({commits:Number(git('rev-list','--all','--count')),textBlobsChecked:blobs,credentialOrPrivateBackendFindings:findings},null,2));if(findings.length)process.exitCode=1;
