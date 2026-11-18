import Workspace from './workspace';
import { getChatGPTUser, chatGPTSignInPath } from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await getChatGPTUser();
 if(!user)return <main className="signin"><div className="signin-art"><div className="brand large">tutor<span>space</span><i>✳︎</i></div><div><span className="eyebrow">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</span><h1>Больше внимания<br/>ученикам.</h1><p>Расписание, домашние задания и оплаты.<br/>Все на своих местах.</p></div><span className="signin-note">Создано для преподавателей, которые любят свое дело.</span></div><section className="signin-form"><div className="eyebrow">TUTORSPACE / 01</div><h2>Рады вас видеть</h2><p>Войдите, чтобы открыть свое рабочее пространство.</p><a className="primary" href={chatGPTSignInPath('/')} target="_top">Войти с ChatGPT <span>↗</span></a><small>Ваши ученики и записи доступны только вам.</small></section></main>;
 return <Workspace user={{name:user.fullName||'Преподаватель',email:user.email}}/>;
}
