import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
export default function Reveal({children,className}:{children:ReactNode;className?:string}){return <motion.div className={className} initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.8,ease:'easeOut'}}>{children}</motion.div>}
