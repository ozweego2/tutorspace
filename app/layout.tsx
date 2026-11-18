import type { Metadata } from 'next';
import './globals.css';
import './product-v2.css';
import './planner.css';
import './product-v3.css';
import './mobile.css';
export const viewport = { width:'device-width', initialScale:1, viewportFit:'cover' };
export const metadata: Metadata = { title:'TutorSpace — пространство репетитора', description:'Расписание, ученики, домашние задания и оплаты в одном рабочем пространстве.', icons:{icon:'/favicon.svg'} };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{document.documentElement.dataset.mode=localStorage.getItem('tutorspace-mode')||'light'}catch(e){}"}}/></head><body>{children}</body></html>}
