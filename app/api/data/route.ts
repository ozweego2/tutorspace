import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { tables, type Kind, type Row } from '../../../lib/tutor';
export const dynamic='force-dynamic';
const json=(x:any,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
const mappings:Record<Kind,string[]>={students:['name','subject','phone','level','goal','notes','rate','archived'],lessons:['studentId','start','end','duration','subject','topic','status','price','notes','series'],homework:['studentId','lessonId','title','description','due','status','review','reviewed','link'],progress:['studentId','date','topic','type','score','notes'],payments:['studentId','date','amount','notes']};
const sqlName=(x:string)=>x.replace(/[A-Z]/g,c=>'_'+c.toLowerCase());
function decode(r:Row){return Object.fromEntries(Object.entries(r).filter(([k])=>k!=='owner').map(([k,v])=>[k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),v]))}
const need=(ok:any,message:string)=>{if(!ok)throw new Error(message)};
const text=(v:any,max=2000)=>String(v??'').trim().slice(0,max);
const integer=(v:any,min:number,max:number,label:string)=>{const n=Number(v);need(Number.isSafeInteger(n)&&n>=min&&n<=max,label);return n};
function iso(v:any){need(typeof v==='string'&&Number.isFinite(Date.parse(v)),'Укажите корректную дату');return new Date(v).toISOString()}
function validate(kind:Kind,d:Row,old:Row|null):Row{
 const created=old?.created||new Date().toISOString(),common={notes:text(d.notes)};
 if(kind==='students'){
  const name=String(d.name??'').trim();need(name.length>=2&&name.length<=120&&!/[\p{Cc}\p{Cf}]/u.test(name),'Имя должно содержать от 2 до 120 печатных символов');
  return {...common,name,subject:text(d.subject,120)||old?.subject||'Математика',phone:text(d.phone,60),level:text(d.level,120),goal:text(d.goal),rate:integer(d.rate??80000,0,100000000,'Укажите корректную часовую ставку'),archived:d.archived?1:0};
 }
 const studentId=text(d.studentId,60);need(studentId,'Выберите ученика');
 if(kind==='lessons'){
  const start=iso(d.start),duration=integer(d.duration,5,1440,'Длительность — от 5 до 1440 минут');need(['planned','done','cancelled'].includes(d.status),'Неизвестный статус занятия');
  const price=old?.status==='done'?old.price:integer(d.price,0,100000000,'Стоимость должна быть неотрицательной');
  return {...common,studentId,start,end:new Date(Date.parse(start)+duration*60000).toISOString(),duration,subject:text(d.subject,120)||'Математика',topic:text(d.topic,200),status:d.status,price,series:old?.series||d.series||null};
 }
 if(kind==='homework'){
  const title=text(d.title,200),due=iso(d.due);need(title,'Введите название задания');need(Date.parse(due)>=Date.parse(created),'Срок сдачи не может быть раньше выдачи задания');need(['assigned','completed','reviewed'].includes(d.status),'Неизвестный статус задания');
  const review=text(d.review);need(d.status!=='reviewed'||review,'Добавьте комментарий к проверенной работе');const link=text(d.link,1000);need(!link||/^https?:\/\//i.test(link),'Ссылка должна начинаться с https:// или http://');
  return {studentId,lessonId:d.lessonId||null,title,description:text(d.description,10000),due,status:d.status,review,reviewed:d.status==='reviewed'?(old?.reviewed||new Date().toISOString()):null,link};
 }
 if(kind==='progress'){need(text(d.topic,200),'Введите тему');need(['Тест','Контрольная','Коллоквиум'].includes(d.type),'Выберите тип работы');return {...common,studentId,date:iso(d.date),topic:text(d.topic,200),type:d.type,score:integer(d.score,0,100,'Балл — целое число от 0 до 100')}}
 return {...common,studentId,date:iso(d.date),amount:integer(d.amount,1,100000000,'Сумма оплаты должна быть больше нуля')};
}
export async function GET(){
 const user=await getChatGPTUser();if(!user)return json({error:'Требуется вход'},401);
 try{const db=env.DB!,names=[...Object.keys(tables),'attachments'];const results=await db.batch(names.map(t=>db.prepare(`SELECT * FROM ${t} WHERE owner=?`).bind(user.userId)));
  const prefs=await db.prepare('SELECT * FROM preferences WHERE owner=?').bind(user.userId).first<Row>();
  return json({...Object.fromEntries(names.map((t,i)=>[t,results[i].results.map(r=>decode(r as Row))])),preferences:prefs?decode(prefs):{name:user.fullName||'Преподаватель',rate:80000,accent:'forest',font:'sans',mode:'light'}});
 }catch(e){console.error(e);return json({error:'Не удалось загрузить записи. Попробуйте еще раз.'},500)}
}
export async function POST(req:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Требуется вход'},401);if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Запрос отклонен'},403);
 try{
  const db=env.DB!,b=await req.json() as Row,owner=user.userId;
  if(b.action==='preferences'){const d=b.data||{},rate=integer(d.rate,0,100000000,'Некорректная ставка');need(['forest','cobalt','plum'].includes(d.accent),'Неизвестная тема');need(['sans','serif'].includes(d.font),'Неизвестный шрифт');const previous=await db.prepare('SELECT mode FROM preferences WHERE owner=?').bind(owner).first<Row>();const mode=d.mode??previous?.mode??'light';need(['light','dark'].includes(mode),'Неизвестный режим оформления');await db.prepare('INSERT INTO preferences(owner,name,rate,accent,font,mode) VALUES(?,?,?,?,?,?) ON CONFLICT(owner) DO UPDATE SET name=excluded.name,rate=excluded.rate,accent=excluded.accent,font=excluded.font,mode=excluded.mode').bind(owner,text(d.name,120)||'Преподаватель',rate,d.accent,d.font,mode).run();return json({ok:true})}
  need(typeof b.kind==='string'&&Object.hasOwn(tables,b.kind),'Неизвестный раздел');const kind=b.kind as Kind,table=tables[kind];need(['save','delete'].includes(b.action),'Неизвестное действие');const id=b.id||b.requestId||crypto.randomUUID();need(/^[a-zA-Z0-9-]{1,80}$/.test(id),'Некорректный идентификатор');
  const existing=await db.prepare(`SELECT * FROM ${table} WHERE id=? AND owner=?`).bind(id,owner).first<Row>();if(b.id&&!existing)return json({error:'Запись не найдена'},404);
  if(existing&&!b.id&&b.action==='save')return json({ok:true,id,count:1});
  if(b.action==='delete'){
   need(!['students','lessons','payments'].includes(kind),'Ученика можно архивировать, занятие — отменить. Финансовая история сохраняется.');
   if(kind==='homework'){const files=await db.prepare('SELECT id FROM attachments WHERE homework_id=? AND owner=?').bind(id,owner).all<{id:string}>();if(env.BUCKET)await Promise.all(files.results.map(f=>env.BUCKET!.delete(`${owner}/${f.id}`)));await db.batch([db.prepare('DELETE FROM attachments WHERE homework_id=? AND owner=?').bind(id,owner),db.prepare('DELETE FROM homework WHERE id=? AND owner=?').bind(id,owner)])}else await db.prepare(`DELETE FROM ${table} WHERE id=? AND owner=?`).bind(id,owner).run();return json({ok:true});
  }
  const old=existing?decode(existing):null,d=validate(kind,b.data||{},old);
  if(kind!=='students'){const student=await db.prepare('SELECT * FROM students WHERE id=? AND owner=?').bind(d.studentId,owner).first<Row>();need(student,'Ученик не найден');need(!student!.archived||!!old,'Ученик в архиве. Восстановите его перед созданием записи.')}
  if(kind==='homework'&&d.lessonId){const l=await db.prepare('SELECT id FROM lessons WHERE id=? AND owner=? AND student_id=?').bind(d.lessonId,owner,d.studentId).first();need(l,'Связанное занятие не найдено')}
  const rows:Row[]=[{...d,id,created:old?.created||new Date().toISOString()}];
  if(kind==='lessons'&&!old&&b.repeat){
   const until=iso(b.repeat.until),days=b.repeat.days;need(Array.isArray(days)&&days.length&&days.every((n:any)=>Number.isInteger(n)&&n>=0&&n<7),'Выберите дни повторения');need(Date.parse(until)>=Date.parse(d.start)&&Date.parse(until)-Date.parse(d.start)<=366*86400000,'Повторение — максимум на год вперед');
   const series=crypto.randomUUID();rows[0].series=series;
   for(let day=1;day<=366;day++){const start=new Date(Date.parse(d.start)+day*86400000);if(start.getTime()>Date.parse(until))break;const dow=new Date(start.getTime()+3*3600000).getUTCDay();if(days.includes(dow))rows.push({...d,id:crypto.randomUUID(),created:rows[0].created,start:start.toISOString(),end:new Date(start.getTime()+d.duration*60000).toISOString(),series})}need(rows.length<=110,'За один раз можно создать не более 110 занятий');
  }
  if(kind==='lessons'&&d.status!=='cancelled'){for(const row of rows){const clash=await db.prepare('SELECT start FROM lessons WHERE owner=? AND id<>? AND status<>? AND start<? AND end>? LIMIT 1').bind(owner,row.id,'cancelled',row.end,row.start).first<{start:string}>();need(!clash,`Занятие пересекается с записью ${clash?new Date(clash.start).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'}):''}`)}}
  if(old){const cols=mappings[kind];await db.prepare(`UPDATE ${table} SET ${cols.map(c=>`${sqlName(c)}=?`).join(',')} WHERE id=? AND owner=?`).bind(...cols.map(c=>d[c]??null),id,owner).run()}else{const cols=['id','owner',...mappings[kind],'created'];await db.batch(rows.map(row=>db.prepare(`INSERT INTO ${table}(${cols.map(sqlName).join(',')}) VALUES(${cols.map(()=>'?').join(',')})`).bind(...cols.map(c=>c==='owner'?owner:row[c]??null))))}return json({ok:true,id,count:rows.length});
 }catch(e){const msg=e instanceof Error?e.message:'Ошибка сохранения';console.error(e);if(msg.includes('schedule_conflict'))return json({error:'Занятия пересекаются. Выберите другое время.'},409);if(msg.includes('D1_')||msg.includes('SQLITE_'))return json({error:'Изменение не сохранено. Обновите страницу и повторите.'},409);return json({error:msg},400)}
}
