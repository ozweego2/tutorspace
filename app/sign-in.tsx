'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, LockKeyhole, ArrowUpRight, CalendarDays, BookOpen, Wallet } from 'lucide-react';

export default function SignIn({ signInPath }: { signInPath: string }) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'connecting'>('loading');
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');

  async function checkSession() {
    setPhase('loading'); setError('');
    try {
      const response = await fetch('/api/session', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error();
      const session = await response.json() as { email?: string };
      setAccount(session.email || '');
    } catch { setError('Не удалось проверить подключение. Можно повторить проверку или перейти ко входу.'); }
    setPhase('ready');
  }
  useEffect(() => { void checkSession(); const restore=()=>{setPhase('ready');};window.addEventListener('pageshow',restore);return()=>window.removeEventListener('pageshow',restore); }, []);

  if (phase === 'loading') return <main className="entry-loading" role="status" aria-live="polite"><div className="entry-symbol">✳︎</div><div className="brand">tutor<span>space</span></div><p>Проверяем подключение к вашему пространству</p><span className="loading-track"><i /></span></main>;

  return <main className="signin entry-screen">
    <section className="signin-art">
      <div className="brand large">tutor<span>space</span><i>✳︎</i></div>
      <div className="entry-story"><span className="eyebrow">ЛИЧНАЯ ПРАКТИКА В ПОРЯДКЕ</span><h1>Ваш ритм.<br />Ваши ученики.<br /><em>Ваше пространство.</em></h1><p>Планы на месяцы вперед.<br />Все детали одного занятия — рядом.</p>
        <div className="entry-preview" aria-hidden="true"><div className="entry-preview-top"><span>МОЯ НЕДЕЛЯ</span><span>ПН — ПТ</span></div><div className="entry-preview-row"><span>ПН</span><i /><div><strong>Математика</strong><small>Урок и материалы</small></div><Check size={18} /></div><div className="entry-preview-row"><span>ПТ</span><i /><div><strong>Следующее занятие</strong><small>Запланировано вами</small></div><ArrowUpRight size={18} /></div></div>
      </div>
      <div className="entry-features"><span><CalendarDays size={15} />Расписание</span><span><BookOpen size={15} />Задания</span><span><Wallet size={15} />Оплаты</span></div>
    </section>
    <section className="signin-form">
      <span className="entry-step">01 <i /> ВХОД В TUTORSPACE</span><h2>С возвращением</h2><p>Войдите в аккаунт и продолжайте<br />с того места, где остановились.</p>
      {account && <label className="entry-account"><span>Ваш аккаунт ChatGPT</span><input aria-label="Ваш аккаунт ChatGPT" readOnly value={account} /><small><Check size={12} />Аккаунт найден. Можно продолжить работу.</small></label>}
      <a href={account?'/overview':signInPath} target="_top" className="primary entry-submit" onClick={() => setPhase('connecting')}>{phase === 'connecting' ? 'Открываем ваше пространство…' : account ? 'Войти в TutorSpace' : 'Продолжить с ChatGPT'}<ArrowRight size={18} /></a>
      {account&&<a className="entry-change-account" href="/signout-with-chatgpt?return_to=%2F" target="_top">Выйти из текущей сессии</a>}<div className="entry-private"><LockKeyhole size={14} /><span>Вход через ChatGPT.<br />Это приватная версия: доступ нужен каждому аккаунту отдельно.</span></div>
      {error && <div className="entry-error" role="alert"><p>{error}</p><button type="button" onClick={checkSession}>Повторить проверку</button></div>}
      <footer>Только ваши ученики. Только ваши записи.</footer>
    </section>
  </main>;
}
