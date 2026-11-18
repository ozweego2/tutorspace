'use client';
import { useMemo, useState, type PointerEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, ArrowUpRight, Check, Clock, Pencil, GripVertical, List, CalendarRange, X, Users, Sparkles } from 'lucide-react';
import { type Data, type Row, money, dateLabel, timeLabel, localDate, localTime, labels } from '../lib/tutor';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function monthDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first); start.setDate(1 - (first.getDay() + 6) % 7);
  const length = Math.ceil(((first.getDay() + 6) % 7 + new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()) / 7) * 7;
  return Array.from({ length }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
}
function pointerLight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return;
  const el = event.currentTarget, rect = el.getBoundingClientRect();
  el.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
  el.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
}

export default function Schedule({ data, onOpen, onAdd, onEdit, onConduct }: {
  data: Data; onOpen: (id: string) => void; onAdd: (start?: string) => void;
  onEdit: (row: Row) => void; onConduct: (row: Row) => Promise<void>;
}) {
  const [view, setView] = useState('agenda'), [anchor, setAnchor] = useState(new Date());
  const [studentId, setStudentId] = useState('all'), [past, setPast] = useState(false), [day, setDay] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null), [dropDay, setDropDay] = useState<string | null>(null), [working, setWorking] = useState<string | null>(null);
  const today = localDate(new Date()), days = useMemo(() => monthDays(anchor), [anchor]);
  const student = (id: string) => data.students.find(s => s.id === id);
  const all = data.lessons.filter(l => studentId === 'all' || l.studentId === studentId).sort((a, b) => a.start.localeCompare(b.start));
  const inMonth = (start: string) => { const d = new Date(start); return d.getMonth() === anchor.getMonth() && d.getFullYear() === anchor.getFullYear(); };
  const month = all.filter(l => inMonth(l.start));
  const weekStart = dayStart(anchor); weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const visible = all.filter(l => {
    const key = localDate(new Date(l.start));
    if (view === 'week') return key >= localDate(weekDays[0]) && key <= localDate(weekDays[6]) && (!day || key === day);
    return inMonth(l.start) && (!day || key === day) && (past || day || key >= today);
  });
  const groups = new Map<string, Row[]>();
  for (const lesson of visible) { const key = localDate(new Date(lesson.start)); groups.set(key, [...groups.get(key) || [], lesson]); }
  const pending = month.filter(l => l.status === 'planned' && Date.parse(l.end) > Date.now());
  const title = view === 'week' ? `${dateLabel(localDate(weekDays[0]), { day: 'numeric', month: 'short' })} — ${dateLabel(localDate(weekDays[6]), { day: 'numeric', month: 'short' })}` : dateLabel(localDate(anchor), { month: 'long', year: 'numeric' }).replace(' г.', '');
  const shift = (direction: number) => { const d = new Date(anchor); view === 'week' ? d.setDate(d.getDate() + direction * 7) : d.setMonth(d.getMonth() + direction, 1); setAnchor(d); setDay(null); };
  function moveTo(target: Date) {
    const lesson = all.find(l => l.id === dragged); setDropDay(null); setDragged(null);
    if (!lesson || lesson.status !== 'planned') return;
    const start = new Date(lesson.start); start.setFullYear(target.getFullYear(), target.getMonth(), target.getDate());
    if (start.toISOString() !== lesson.start) onEdit({ ...lesson, start: localTime(start) });
  }
  async function conduct(lesson: Row) { setWorking(lesson.id); try { await onConduct(lesson); } finally { setWorking(null); } }

  const miniCalendar = <div className="mini-calendar"><div className="mini-month"><strong>{dateLabel(localDate(anchor), { month: 'long' })}</strong><span>{anchor.getFullYear()}</span></div><div className="mini-weekdays">{weekdays.map(d => <span key={d}>{d}</span>)}</div><div className="mini-days">{days.map(d => { const key = localDate(d), hasLesson = month.some(l => localDate(new Date(l.start)) === key); return <button key={key} aria-label={`Занятия ${dateLabel(key)}`} aria-pressed={day === key} className={`${d.getMonth() !== anchor.getMonth() ? 'outside' : ''} ${key === today ? 'today' : ''} ${day === key ? 'selected' : ''}`} onClick={() => { setDay(day === key ? null : key); if (d.getMonth() !== anchor.getMonth()) setAnchor(d); }}>{d.getDate()}{hasLesson && <i />}</button>; })}</div>{day && <button className="clear-day" onClick={() => setDay(null)}><X size={12} />Показать весь месяц</button>}</div>;

  return <section className={`schedule-new mode-${view}`}>
    <header className="schedule-top"><div className="schedule-period"><button className="icon-button" aria-label="Предыдущий период" onClick={() => shift(-1)}><ChevronLeft size={18} /></button><h2>{title}</h2><button className="icon-button" aria-label="Следующий период" onClick={() => shift(1)}><ChevronRight size={18} /></button><button className="secondary schedule-today" onClick={() => { setAnchor(new Date()); setDay(null); }}>Сегодня</button></div><div className="schedule-view" aria-label="Вид расписания">{[['agenda', 'Ближайшие', List], ['week', 'Неделя', CalendarRange], ['month', 'Месяц', CalendarDays]].map(([key, label, Icon]) => { const I = Icon as typeof List; return <button key={String(key)} aria-pressed={view === key} className={view === key ? 'selected' : ''} onClick={() => { setView(String(key)); setDay(null); }}><I size={15} />{String(label)}</button>; })}</div></header>
    <div className="schedule-layout">
      {view !== 'month' && <aside className="schedule-rail">{miniCalendar}<div className="schedule-summary"><span className="eyebrow">В ЭТОМ МЕСЯЦЕ</span><strong>{pending.length}<small>занятий впереди</small></strong><p><Clock size={14} />{(pending.reduce((n, l) => n + l.duration, 0) / 60).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ч запланировано</p></div><div className="schedule-rail-note"><span>✳︎</span><p>Понедельник и пятница?<br />Создайте серию за один раз.</p><button className="text-button" onClick={() => onAdd()}>Добавить занятия<ArrowUpRight size={14} /></button></div></aside>}
      <div className="schedule-content"><div className="schedule-filter"><div>{day ? <button className="day-filter-chip" onClick={() => setDay(null)}>{dateLabel(day)}<X size={13} /></button> : <span className="schedule-count">{view === 'month' ? month.length : visible.length} занятий · {view === 'agenda' && !past ? 'начиная с сегодня' : view === 'week' ? 'на этой неделе' : 'в выбранном месяце'}</span>}</div><div><select aria-label="Ученики в расписании" value={studentId} onChange={e => setStudentId(e.target.value)}><option value="all">Все ученики</option>{data.students.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</select>{view === 'agenda' && <label className="past-toggle"><input type="checkbox" checked={past} onChange={e => setPast(e.target.checked)} />Прошедшие</label>}</div></div>
      {view === 'week' && <div className="week-selector">{weekDays.map((d, i) => { const key = localDate(d); return <button key={key} className={`${day === key ? 'selected' : ''} ${key === today ? 'today' : ''}`} onClick={() => setDay(day === key ? null : key)}><small>{weekdays[i]}</small><strong>{d.getDate()}</strong><span>{all.filter(l => localDate(new Date(l.start)) === key).length || '—'}</span></button>; })}</div>}
      {view === 'month' ? <><div className="month-view-tip"><GripVertical size={15} /><span>Перетащите запланированное занятие на другую дату или нажмите свободный день.</span></div><div className="planning-weekdays">{weekdays.map(d => <span key={d}>{d}</span>)}</div><div className="planning-grid">{days.map(d => { const key = localDate(d), events = all.filter(l => localDate(new Date(l.start)) === key); return <div key={key} className={`planning-day ${d.getMonth() !== anchor.getMonth() ? 'outside' : ''} ${key === today ? 'today' : ''} ${dropDay === key ? 'drop-target' : ''}`} onDragOver={e => { if (dragged) { e.preventDefault(); setDropDay(key); } }} onDragLeave={() => setDropDay(current => current === key ? null : current)} onDrop={e => { e.preventDefault(); moveTo(d); }}><div className="planning-day-heading"><button aria-label={`Добавить занятие ${dateLabel(key)}`} className="planning-date" onClick={() => onAdd(`${key}T17:00`)}>{d.getDate()}</button><button className="planning-add" aria-label={`Новое занятие ${dateLabel(key)}`} onClick={() => onAdd(`${key}T17:00`)}><Plus size={13} /><span>Урок</span></button></div>{events.map(l => <button key={l.id} draggable={l.status === 'planned'} onDragStart={e => { setDragged(l.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', l.id); }} onDragEnd={() => { setDragged(null); setDropDay(null); }} className={`planning-event ${l.status} ${dragged === l.id ? 'being-dragged' : ''}`} onClick={() => onOpen(l.id)}><span><strong>{timeLabel(l.start)}</strong>{l.status === 'done' ? <Check size={11} /> : l.status === 'planned' ? <GripVertical size={11} /> : <X size={11} />}</span><b>{student(l.studentId)?.name}</b><small>{l.topic || 'Тема еще не указана'}</small><span className="planning-tooltip">{student(l.studentId)?.name}<br />{l.topic || l.subject} · {l.duration} мин<br />{labels[l.status]}</span></button>)}</div>; })}</div></> : <div className="schedule-agenda">{Array.from(groups).map(([key, lessons]) => <section className="agenda-day-group" key={key}><div className="agenda-day-label"><span className={key === today ? 'today' : ''}>{key === today ? 'Сегодня' : dateLabel(key, { weekday: 'long' })}</span><h3>{dateLabel(key)}</h3><span>{lessons.length} {lessons.length === 1 ? 'занятие' : lessons.length < 5 ? 'занятия' : 'занятий'}</span></div><div className="schedule-day-lessons">{lessons.map(l => <article key={l.id} className={`schedule-row ${l.status}`} onPointerMove={pointerLight}><button className="schedule-row-main" onClick={() => onOpen(l.id)}><div className="schedule-time"><strong>{timeLabel(l.start)}</strong><small>{timeLabel(l.end)}</small></div><span className="schedule-person-avatar">{(student(l.studentId)?.name || 'У').split(' ').slice(0, 2).map((s: string) => s[0]).join('')}</span><div className="schedule-lesson-info"><h4>{student(l.studentId)?.name}</h4><p>{l.topic || 'Тему можно добавить позже'}</p><small>{l.subject} · {l.duration} мин</small></div><div className="schedule-row-end"><span className={`badge ${l.status}`}>{labels[l.status]}</span><strong>{money(l.price)}</strong></div></button><div className="schedule-row-actions"><button className="row-action" aria-label={`Изменить занятие ${student(l.studentId)?.name} ${timeLabel(l.start)}`} title="Изменить или перенести" onClick={() => onEdit(l)}><Pencil size={16} /></button>{l.status === 'planned' && <button className="row-action conduct" disabled={working === l.id} title="Отметить проведенным" aria-label={`Занятие проведено ${student(l.studentId)?.name} ${timeLabel(l.start)}`} onClick={() => conduct(l)}><Check size={18} /></button>}</div></article>)}</div></section>)}{!visible.length && <div className="schedule-empty"><div className="schedule-empty-symbol"><CalendarDays size={30} /><span>✳︎</span></div><h3>{day ? 'Этот день свободен' : 'Есть место для новых занятий'}</h3><p>{past || view === 'week' || day ? 'Занятия появятся здесь, когда вы их запланируете.' : 'Впереди в этом месяце пока нет занятий. Можно добавить новое, посмотреть другой месяц или включить прошедшие.'}</p><button className="primary" onClick={() => onAdd(day ? `${day}T17:00` : undefined)}><Plus size={16} />Добавить занятие</button></div>}<button className="agenda-add-line" onClick={() => onAdd(day ? `${day}T17:00` : undefined)}><Plus size={16} />Запланировать еще занятие</button></div>}
      </div>
    </div>
  </section>;
}
