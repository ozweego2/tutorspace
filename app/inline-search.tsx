'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, X, Users, CalendarDays, BookOpen, ArrowUpRight } from 'lucide-react';
import { type Data, type Kind, dateLabel, timeLabel } from '../lib/tutor';

type Result = { kind: Kind; id: string; title: string; subtitle: string };
export default function InlineSearch({ data, onSelect, disabled = false }: { data: Data; onSelect: (kind: Kind, id: string) => void; disabled?: boolean }) {
  const [query, setQuery] = useState(''), [open, setOpen] = useState(false), [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null), wrapper = useRef<HTMLDivElement>(null);
  const q = query.trim().toLocaleLowerCase('ru');
  const match = (text: string) => text.toLocaleLowerCase('ru').includes(q);
  const studentName = (id: string) => data.students.find(s => s.id === id)?.name || 'Ученик';
  const results: Result[] = [
    ...data.students.filter(s => match(s.name)).slice(0, 4).map(s => ({ kind: 'students' as Kind, id: s.id, title: s.name, subtitle: s.level || 'Ученик' })),
    ...data.lessons.filter(l => q && match(`${l.topic} ${studentName(l.studentId)}`)).slice(0, 4).map(l => ({ kind: 'lessons' as Kind, id: l.id, title: l.topic || l.subject, subtitle: `${studentName(l.studentId)} · ${dateLabel(l.start)} ${timeLabel(l.start)}` })),
    ...data.homework.filter(h => q && match(h.title)).slice(0, 3).map(h => ({ kind: 'homework' as Kind, id: h.id, title: h.title, subtitle: `${studentName(h.studentId)} · задание` })),
  ].slice(0, 8);

  useEffect(() => {
    const key = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.current?.focus(); setOpen(true); } };
    const outside = (event: PointerEvent) => { if (!wrapper.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener('keydown', key); document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, []);
  const choose = (r: Result) => { setOpen(false); setQuery(''); onSelect(r.kind, r.id); input.current?.blur(); };

  return <div ref={wrapper} className={`inline-search ${open ? 'is-open' : ''}`} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
    <Search size={17} /><input ref={input} disabled={disabled} role="combobox" aria-label="Быстрый поиск" aria-expanded={open} aria-controls="quick-search-results" aria-autocomplete="list" aria-activedescendant={open && results[selected] ? `quick-result-${selected}` : undefined} placeholder="Найти ученика, тему, задание…" value={query} onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setSelected(0); setOpen(true); }} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); input.current?.blur(); } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setSelected(i => results.length ? (i + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length : 0); } else if (e.key === 'Enter' && open && results[selected]) { e.preventDefault(); choose(results[selected]); } }} />
    {query ? <button className="search-clear" aria-label="Очистить поиск" onMouseDown={e => e.preventDefault()} onClick={() => { setQuery(''); input.current?.focus(); }}><X size={14} /></button> : <kbd>⌘ K</kbd>}
    {open && <div className="inline-results"><div className="search-caption">{q ? `Результаты поиска · ${results.length}` : 'Ученики под рукой'}</div><div id="quick-search-results" role="listbox">{results.map((r, i) => { const Icon = r.kind === 'students' ? Users : r.kind === 'lessons' ? CalendarDays : BookOpen; return <button id={`quick-result-${i}`} type="button" role="option" aria-selected={selected === i} key={`${r.kind}-${r.id}`} className={selected === i ? 'highlighted' : ''} onMouseDown={e => e.preventDefault()} onMouseEnter={() => setSelected(i)} onClick={() => choose(r)}><span className="search-result-icon"><Icon size={17} /></span><span><strong>{r.title}</strong><small>{r.subtitle}</small></span><ArrowUpRight size={15} /></button>; })}</div>{!results.length && <div className="search-empty"><Search size={22} /><strong>{q ? 'Ничего не нашлось' : 'Здесь появятся ваши ученики'}</strong><p>{q ? 'Попробуйте часть имени или другую тему.' : 'Добавьте первого ученика, чтобы находить его в один клик.'}</p></div>}<div className="search-hint"><span>↑ ↓ выбрать · Enter открыть</span><span>Esc закрыть</span></div></div>}
  </div>;
}
