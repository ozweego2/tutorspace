import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {fileURLToPath} from 'node:url';
const bundle=buildSync({entryPoints:[fileURLToPath(new URL('../lib/exercise-bank.ts',import.meta.url))],bundle:true,platform:'node',format:'cjs',write:false});
const bankModule={exports:{}};new Function('module','exports',bundle.outputFiles[0].text)(bankModule,bankModule.exports);
const {exerciseBank,homeworkFromExercises}=bankModule.exports;
assert.equal(new Set(exerciseBank.map(e=>e.id)).size,exerciseBank.length);
assert.equal(new Set(exerciseBank.map(e=>e.subject+'|'+e.prompt)).size,exerciseBank.length,'No duplicate exercise text');
for(const e of exerciseBank){
 assert.ok(e.prompt.trim()&&e.topic&&e.subject&&e.levels.length);
 if(e.id.startsWith('LIN-')){const [,a,b,c]=e.prompt.match(/(\d+)x \+ (\d+) = (\d+)/);const x=Number(e.answer.match(/= (\d+)/)[1]);assert.equal(Number(a)*x+Number(b),Number(c));}
 if(e.id.startsWith('QUAD-')){const [,sum,product]=e.prompt.match(/x² − (\d+)x \+ (\d+) = 0/);const [,r,t]=e.answer.match(/= (\d+), x₂ = (\d+)/);assert.equal(Number(r)+Number(t),Number(sum));assert.equal(Number(r)*Number(t),Number(product));}
 if(e.id.startsWith('FRAC-')){const [,n,d,m,k]=e.prompt.match(/(\d+)\/(\d+) \+ (\d+)\/(\d+)/).map(Number);const [a,b=1]=e.answer.split('/').map(Number);assert.equal(a*d*k,(n*k+m*d)*b);}
}
const draft=homeworkFromExercises([{id:'TEST',subject:'Математика',levels:['9 класс'],topic:'Тест',prompt:'Решите уравнение.',answer:'PRIVATE_SOLUTION'}]);
assert.ok(draft.includes('[TEST]'));assert.ok(!draft.includes('PRIVATE_SOLUTION'));
console.log(`${exerciseBank.length} exercises: unique IDs, valid generated maths, answers excluded from homework.`);
