import type { FlowerType, Product } from '../data/products'
const Petal=({a,rx,ry,d,c,s='rgba(114,86,77,.35)'}:{a:number;rx:number;ry:number;d:number;c:string;s?:string})=><ellipse cx={0} cy={-d} rx={rx} ry={ry} fill={c} stroke={s} strokeWidth={1.5} transform={`rotate(${a})`}/>
export function Flower({t,x,y,r,c}:{t:FlowerType;x:number;y:number;r:number;c:string}){
 return <g transform={`translate(${x} ${y})`}>{t==='tulipan'?<><Petal a={-22} rx={r*.42} ry={r*.8} d={r*.35} c={c}/><Petal a={22} rx={r*.42} ry={r*.8} d={r*.35} c={c}/><Petal a={0} rx={r*.46} ry={r*.9} d={r*.4} c={c} s="rgba(114,86,77,.5)"/></>
 :t==='rosa'?<><circle r={r} fill={c} stroke="rgba(114,86,77,.4)" strokeWidth={1.5}/>{[1,2,3,4].map(i=><circle key={i} r={r*(1-i*.2)} fill="none" stroke="rgba(114,86,77,.45)" strokeWidth={3.5-i*.5} strokeDasharray={`${r*1.4} ${r*.5}`} transform={`rotate(${i*50})`}/>)}</>
 :t==='girasol'?<>{Array.from({length:14},(_,i)=><Petal key={i} a={i*25.7} rx={r*.17} ry={r*.5} d={r*.62} c="#E0B04A"/>)}<circle r={r*.5} fill="#72564D"/></>
 :<>{Array.from({length:10},(_,i)=><Petal key={i} a={i*36} rx={r*.2} ry={r*.46} d={r*.58} c="#FCFAF7"/>)}<circle r={r*.28} fill="#E0B04A"/></>}</g>}
const POS=[[200,150,52],[135,205,46],[265,205,46],[168,115,42],[238,118,42],[200,235,44]]
const KINDS:FlowerType[]=['tulipan','rosa','margarita']
/** Ilustración referencial. view: 0 frontal · 1 lateral · 2 detalle · 3 envoltorio · 4 regalo */
export default function Bouquet({p,view=0}:{p:Pick<Product,'type'|'colors'|'name'>;view?:number}){
 const n=view===2?3:6
 const body=<>{POS.slice(0,n).map(([x,y,r],i)=><path key={'s'+i} d={`M${x} ${y+r*.6} Q${(x+200)/2} 330 200 440`} stroke="#8a9677" strokeWidth={5} fill="none" strokeLinecap="round"/>)}
 <ellipse cx={150} cy={330} rx={12} ry={32} fill="#8a9677" transform="rotate(-50 150 330)"/><ellipse cx={252} cy={335} rx={12} ry={32} fill="#8a9677" transform="rotate(50 252 335)"/>
 {POS.slice(0,n).map(([x,y,r],i)=><Flower key={i} t={p.type==='mixto'?KINDS[i%3]:p.type} x={x} y={y} r={r} c={p.colors[i%p.colors.length]}/>)}
 <path d="M95 290 L305 290 L232 478 L168 478 Z" fill={view===3?'#D9B7AC':'#E8D4CC'} stroke="#B98272" strokeWidth={1.5}/><path d="M200 290 L168 478 M200 290 L232 478" stroke="#B98272" opacity={.5}/><rect x={176} y={326} width={48} height={14} rx={7} fill="#B98272"/></>
 const tf=view===1?'translate(60 0) rotate(14 200 450) scale(.92 1)':view===2?'translate(-140 -50) scale(1.7)':view===3?'translate(-40 -50) scale(1.2)':undefined
 return <svg viewBox="0 0 400 500" role="img" aria-label={`${p.name}, imagen referencial`} className="block h-full w-full"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6F2EA"/><stop offset="1" stopColor="#E8D4CC"/></linearGradient></defs><rect width="400" height="500" fill="url(#bg)"/><circle cx="200" cy="230" r="170" fill="#FCFAF7" opacity=".55"/><g transform={tf}>{body}</g>
 {view===4&&<><rect x={40} y={410} width={320} height={80} rx={8} fill="#72564D"/><rect x={190} y={410} width={20} height={80} fill="#B98272"/><text x={93} y={175} fontSize={13} fontFamily="Georgia" fill="#72564D" textAnchor="middle" transform="rotate(-8 90 170)">para ti ♡</text></>}</svg>}
