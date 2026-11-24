import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import Workspace from '../app/workspace';
import AboutPage from '../app/about/page';
import {demoStore,installDemo} from './browser-store';
import {demoBase,demoNavigate} from './route';
import '../app/globals.css';
import '../app/product-v2.css';
import '../app/planner.css';
import '../app/product-v3.css';
import '../app/mobile.css';
import '../app/product-v4.css';
import '../app/product-v5.css';
import './demo.css';
installDemo();
try{const mode=JSON.parse(localStorage.getItem('tutorspace-public-demo-v1')||'null')?.preferences?.mode||'dark';document.documentElement.dataset.mode=mode;}catch{}
const pages=['overview','calendar','students','homework','bank','progress','finance','settings','about'];
function Demo(){const [revision,setRevision]=useState(0);const segment=location.pathname.replace(demoBase,'').replace(/\/+$/,'');const page=pages.includes(segment)?segment:'overview';return <><aside className="demo-ribbon" aria-label="Демонстрационная версия"><span><strong>Учебное демо</strong><span>Вымышленные ученики · записи только в твоём браузере</span></span><div><a href="https://github.com/ozweego2/tutorspace" target="_blank" rel="noopener noreferrer">Код и коммиты</a><button onClick={()=>{if(confirm('Сбросить демонстрационные записи в этом браузере? Личный сайт и другие посетители не изменятся.')){demoStore.reset();setRevision(x=>x+1);demoNavigate('/overview');}}}>Сбросить демо</button></div></aside><div key={revision} className="demo-content">{page==='about'?<AboutPage/>:<Workspace user={{name:'Демонстрация',email:'demo@tutorspace.local'}} initialPage={page}/>}</div></>;}
createRoot(document.getElementById('root')!).render(<Demo/>);
