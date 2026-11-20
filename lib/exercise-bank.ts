import {studyPlans} from './curriculum';
export type Exercise={id:string;subject:string;levels:string[];topic:string;prompt:string;answer?:string};
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);
const signed=(n:number)=>n<0?`− ${Math.abs(n)}`:`+ ${n}`;
export const exerciseBank:Exercise[]=studyPlans.flatMap(plan=>plan.steps.flatMap((step,i)=>step.exercises.map((prompt,j)=>({id:`${plan.key}-${i+1}-${j+1}`,subject:plan.subject,levels:plan.levels,topic:step.topic,prompt}))));
for(let i=1;i<=20;i++){
 const x=i%9+1,a=i%5+2,b=i%7+1;
 exerciseBank.push({id:`LIN-${i}`,subject:'Математика',levels:['7 класс','8 класс','9 класс'],topic:'Линейные уравнения',prompt:`Решите уравнение ${a}x + ${b} = ${a*x+b}. Выполните проверку подстановкой.`,answer:`x = ${x}`});
 const r=i%6+1,t=r+i+1;
 exerciseBank.push({id:`QUAD-${i}`,subject:'Математика',levels:['8 класс','9 класс','10 класс'],topic:'Квадратные уравнения',prompt:`Решите уравнение x² ${signed(-r-t)}x ${signed(r*t)} = 0. Укажите оба корня.`,answer:`x₁ = ${r}, x₂ = ${t}`});
 const d=[4,6,8,12][i%4],e=[3,5,7][i%3],n=i%(d-1)+1,m=i%(e-1)+1,total=n*e+m*d,den=d*e,g=gcd(total,den);
 exerciseBank.push({id:`FRAC-${i}`,subject:'Математика',levels:['5 класс','6 класс','7 класс'],topic:'Дроби',prompt:`Вычислите ${n}/${d} + ${m}/${e}. Сократите результат.`,answer:den/g===1?String(total/g):`${total/g}/${den/g}`});
 const price=1000+i*200,discount=[10,15,20,25][i%4];
 exerciseBank.push({id:`PERCENT-${i}`,subject:'Математика',levels:['5 класс','6 класс','7 класс','8 класс','9 класс'],topic:'Проценты',prompt:`Товар стоит ${price} ₽. Его цену снизили на ${discount}%. Найдите новую цену и сумму скидки.`,answer:`Новая цена — ${price*(100-discount)/100} ₽; скидка — ${price*discount/100} ₽.`});
 const v=i%8+2,seconds=(i%5+1)*30;
 exerciseBank.push({id:`SPEED-${i}`,subject:'Физика',levels:['7 класс','8 класс','9 класс'],topic:'Равномерное движение',prompt:`Тело движется равномерно со скоростью ${v} м/с в течение ${seconds} с. Найдите пройденный путь.`,answer:`s = vt = ${v*seconds} м.`});
 const resistance=i+2,current=i%4+1;
 exerciseBank.push({id:`OHM-${i}`,subject:'Физика',levels:['8 класс','9 класс'],topic:'Закон Ома',prompt:`Через резистор сопротивлением ${resistance} Ом проходит ток ${current} А. Найдите напряжение на резисторе.`,answer:`U = IR = ${resistance*current} В.`});
}
exerciseBank.push(
 {id:'GEO-1',subject:'Математика',levels:['8 класс','9 класс'],topic:'Геометрия: треугольники',prompt:'Катеты прямоугольного треугольника равны 5 и 12 см. Найдите площадь треугольника и радиус вписанной окружности.',answer:'Площадь — 30 см², радиус — 2 см.'},
 {id:'PROB-1',subject:'Математика',levels:['7 класс','8 класс','9 класс'],topic:'Вероятность',prompt:'В коробке 3 красных, 5 синих и 2 зелёных шара. Случайно выбирают один шар. Найдите вероятность выбрать синий шар.',answer:'5/10 = 1/2.'}
);
const unique=new Map<string,Exercise>();for(const exercise of exerciseBank){const key=exercise.subject+'|'+exercise.prompt,existing=unique.get(key);if(existing)existing.levels=[...new Set([...existing.levels,...exercise.levels])];else unique.set(key,exercise);}exerciseBank.splice(0,exerciseBank.length,...unique.values());
export function homeworkFromExercises(exercises:Exercise[]){return exercises.map((e,i)=>`${i+1}. ${e.prompt}`).join('\n\n');}
