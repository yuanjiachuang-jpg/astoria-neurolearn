"use client";
import { motion } from "motion/react";

export default function TopicStory({topic,index}:{topic:any,index:number}){
  return <article className="sticky top-0 flex min-h-screen items-center border-t border-white/5 bg-[#070914] px-5 py-24">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
      <motion.div initial={{opacity:0,x:index%2===0?-45:45}} whileInView={{opacity:1,x:0}} viewport={{amount:.35}} transition={{duration:.75}} className={index%2?"md:order-2":""}>
        <p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-violet-300">{topic.label}</p>
        <h2 className="text-5xl font-semibold tracking-[-.05em] sm:text-6xl">{topic.title}</h2>
        <p className="mt-4 text-xl text-white/70">{topic.subtitle}</p>
        <p className="mt-8 max-w-xl leading-8 text-white/48">{topic.body}</p>
        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[.035] p-5 text-sm leading-6 text-white/65">
          <strong className="text-white">What to check in an AI answer:</strong><br/>{topic.check}
        </div>
      </motion.div>
      <motion.div initial={{opacity:0,scale:.84}} whileInView={{opacity:1,scale:1}} viewport={{amount:.4}} className={index%2?"md:order-1":""}>
        <div className={`relative mx-auto aspect-square max-w-[480px] rounded-[3rem] bg-gradient-to-br ${topic.accent} p-px`}>
          <div className="grid h-full place-items-center rounded-[calc(3rem-1px)] bg-[#0b0e1b]">
            <div className="brain-visual"><span className="text-[8rem] sm:text-[11rem]">🧠</span><div className="brain-ring ring-one"/><div className="brain-ring ring-two"/><div className="brain-ring ring-three"/></div>
          </div>
        </div>
      </motion.div>
    </div>
  </article>
}
