export function recurrenceStarts(start:string,until:string,days:number[],interval=1){
 const first=Date.parse(start),end=Date.parse(until),moscow=new Date(first+3*3600000),offset=(moscow.getUTCDay()+6)%7;
 const dates:string[]=[];
 for(let day=0;day<=366;day++){const date=first+day*86400000;if(date>end)break;const week=Math.floor((offset+day)/7),dow=new Date(date+3*3600000).getUTCDay();if(week%interval===0&&days.includes(dow))dates.push(new Date(date).toISOString());}
 return dates;
}
