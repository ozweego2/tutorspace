'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Download, LogOut, CheckCheck, Clock, ArrowUpRight } from 'lucide-react';
import { type Data, type Row, localDate } from '../lib/tutor';

export default function SettingsPanel({ data, user, onPreview, onReload, notify }: { data: Data; user: { name: string; email: string }; onPreview: (appearance: Row) => void; onReload: () => Promise<void>; notify: (message: string) => void }) {
  const [draft, setDraft] = useState(data.preferences), [pending, setPending] = useState(0), [status, setStatus] = useState(''), [error, setError] = useState('');
  const saved = useRef(data.preferences), queue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => { saved.current = data.preferences; }, [data.preferences]);
  function enqueue(getValue: () => Row, message = '') {
    setPending(n => n + 1); setStatus('Сохраняем…'); setError('');
    queue.current = queue.current.catch(() => {}).then(async () => {
      try {
        const next = getValue();
        const r = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'preferences', data: next }), signal: AbortSignal.timeout(20000) });
        const result = await r.json() as Row; if (!r.ok) throw Error(result.error || 'Ошибка сохранения');
        saved.current = next; await onReload(); setError(''); setStatus('Сохранено'); if (message) notify(message);
      } catch (e) { setError(e instanceof Error && e.name !== 'TimeoutError' ? e.message : 'Нет ответа от сервера. Попробуйте сохранить еще раз.'); setStatus('Не сохранено'); }
      finally { setPending(n => n - 1); }
    });
  }
  function appearance(patch: Row) {
    const next = { ...draft, ...patch }; setDraft(next); onPreview(next);
    enqueue(() => ({ ...saved.current, accent: next.accent, font: next.font }));
  }
  function save(e: FormEvent) { e.preventDefault(); const next = { ...draft }; enqueue(() => ({ ...saved.current, ...next }), 'Настройки сохранены'); }
  function exportData() { const a = document.createElement('a'), url = URL.createObjectURL(new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' })); a.href = url; a.download = `TutorSpace-${localDate(new Date())}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

  return <div className="settings-grid settings-v2"><div>
    <section className="panel appearance-panel"><div className="section-title"><div><span className="eyebrow">ВНЕШНИЙ ВИД</span><h2>Ваше настроение</h2></div><span className={`appearance-status ${error ? 'error' : ''}`} role="status">{pending ? <><Clock size={13} />Сохраняем…</> : status ? <><CheckCheck size={14} />{status}</> : 'Сохраняется автоматически'}</span></div><p>Выберите цвет — пространство изменится сразу.</p>
      <div className="palette-cards">{[['forest', 'Лесной', 'Спокойный и собранный'], ['cobalt', 'Кобальт', 'Четкий и прохладный'], ['plum', 'Сливовый', 'Мягкий и выразительный']].map(([accent, title, caption]) => <button type="button" key={accent} aria-label={`Цвет ${title}`} aria-pressed={draft.accent === accent} className={`palette-card palette-${accent} ${draft.accent === accent ? 'selected' : ''}`} onClick={() => appearance({ accent })}><span className="palette-preview"><i /><span><b /><b /><b /></span><em /></span><strong>{title}<span className="palette-check">{draft.accent === accent && <Check size={13} />}</span></strong><small>{caption}</small></button>)}</div>
      <div className="font-choices"><span>Характер заголовков</span><div><button type="button" aria-pressed={draft.font === 'sans'} className={draft.font === 'sans' ? 'selected' : ''} onClick={() => appearance({ font: 'sans' })}><strong>Аа</strong><span>Современный</span></button><button type="button" aria-pressed={draft.font === 'serif'} className={draft.font === 'serif' ? 'selected' : ''} onClick={() => appearance({ font: 'serif' })}><strong className="serif-example">Аа</strong><span>Книжный</span></button></div></div>
      {error && <div className="form-error" role="alert">{error}<button onClick={() => enqueue(() => ({ ...saved.current, accent: draft.accent, font: draft.font }))}>Повторить</button></div>}
    </section>
    <form className="panel profile-settings" onSubmit={save}><span className="eyebrow">ВАША ПРАКТИКА</span><h2>Профиль и ставка</h2><div className="settings-fields"><label className="field"><span>Как к вам обращаться</span><input aria-label="Как к вам обращаться" value={draft.name} maxLength={120} required onChange={e => setDraft({ ...draft, name: e.target.value })} /></label><label className="field"><span>Аккаунт ChatGPT</span><input aria-label="Аккаунт ChatGPT" readOnly value={user.email} /></label><label className="field"><span>Стоимость часа по умолчанию, ₽</span><input aria-label="Стоимость часа по умолчанию, ₽" type="number" min="0" max="1000000" step="0.01" required value={draft.rate / 100} onChange={e => setDraft({ ...draft, rate: Math.round(Number(e.target.value) * 100) })} /><small>Ставка для новых учеников. Проведенные занятия не пересчитываются.</small></label><button className="primary" disabled={!!pending}>Сохранить профиль<Check size={16} /></button></div></form>
  </div><div><section className="panel"><span className="eyebrow">ВАШИ ДАННЫЕ</span><h2>Копия под рукой</h2><p className="muted">Ученики, занятия, задания, результаты и оплаты — одним файлом. Вложения скачиваются из заданий отдельно.</p><button className="secondary" onClick={exportData}><Download size={16} />Экспортировать записи</button></section><section className="settings-about"><div className="brand">tutor<span>space</span><i>✳︎</i></div><p>Личное пространство преподавателя.</p><small>Версия 1.1.0 · 18 ноября 2026<br />Учебный проект по основам проектной деятельности.</small><a className="text-button" href="/" target="_self">Экран входа<ArrowUpRight size={15} /></a><a className="text-button" href="/signout-with-chatgpt?return_to=%2F" target="_top"><LogOut size={15} />Выйти из аккаунта</a></section></div></div>;
}
