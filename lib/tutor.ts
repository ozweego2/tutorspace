export const tables={students:'students',lessons:'lessons',homework:'homework',progress:'progress',payments:'payments'} as const;
export type Kind=keyof typeof tables;
export type Row=Record<string,any>;
export type Data={students:Row[];lessons:Row[];homework:Row[];progress:Row[];payments:Row[];attachments:Row[];preferences:Row;library?:Row[]};
export const labels:Record<string,string>={draft:'Готовится',planned:'Запланировано',done:'Проведено',cancelled:'Отменено',assigned:'Ждём решение',completed:'Пора проверить',reviewed:'Проверено'};
export const money=(n:number)=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:n%100?2:0}).format((n||0)/100);
export function balance(d:Data,id:string){return d.payments.filter(x=>x.studentId===id).reduce((a,x)=>a+x.amount,0)-d.lessons.filter(x=>x.studentId===id&&x.status==='done').reduce((a,x)=>a+x.price,0)}
export function localDate(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function localTime(d:Date){return `${localDate(d)}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
export const dateLabel=(s:string,opts:Intl.DateTimeFormatOptions={day:'numeric',month:'long'})=>new Date(s).toLocaleDateString('ru-RU',opts);
export const timeLabel=(s:string)=>new Date(s).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
export function overdue(h:Row){return h.status!=='reviewed'&&h.status!=='draft'&&Date.parse(h.due)<Date.now()}
