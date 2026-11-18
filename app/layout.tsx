import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'TutorSpace — пространство репетитора', description:'Расписание, ученики, домашние задания и оплаты в одном рабочем пространстве.', icons:{icon:'/favicon.svg'} };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru"><body>{children}</body></html>}
