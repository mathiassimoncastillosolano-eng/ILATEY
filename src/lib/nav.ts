import { useNavigate, useLocation } from 'react-router'
export function useGoTo(){const n=useNavigate(),l=useLocation();return(id:string)=>{const s=()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});if(l.pathname!=='/'){n('/');setTimeout(s,120)}else s()}}
