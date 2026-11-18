export function studentColor(id:string){let hash=0;for(const c of id)hash=(hash*31+c.charCodeAt(0))|0;return Math.abs(hash)%6;}
export function studentPalette(ids:string[]){const used=new Set<number>(),result=new Map<string,number>();for(const id of [...ids].sort()){let tone=studentColor(id);if(used.size<6)while(used.has(tone))tone=(tone+1)%6;used.add(tone);result.set(id,tone);}return result;}
