"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, Sparkles } from "lucide-react";

export default function Hero(){
  const {scrollY}=useScroll();
  const y=useTransform(scrollY,[0,700],[0,150]);
  const opacity=useTransform(scrollY,[0,500],[1,.15]);
  return <section id="home" className="relative flex min-h-screen items-center overflow-hidden px-5 pt-24">
    <div className="neural-bg absolute inset-0"/>
    <motion.div style={{y,opacity}} className="relative mx-auto w-full max-w-6xl text-center">
      <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.045] px-4 py-2 text-xs text-white/65">
        <Sparkles size={14}/>AI × Neuroscience × Youth Learning
      </motion.div>
      <motion.h1 initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} transition={{duration:.9}} className="mx-auto max-w-5xl text-balance text-6xl font-semibold tracking-[-.065em] sm:text-7xl md:text-8xl">
        Understand the aging brain.
        <span className="gradient-text block">Question the AI explaining it.</span>
      </motion.h1>
      <motion.p initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{delay:.15}} className="mx-auto mt-8 max-w-2xl text-pretty leading-7 text-white/55 sm:text-lg">
        A learning experience for young people that compares how large language models explain complex neuroscience—and how prompts change the result.
      </motion.p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a href="#learn" className="rounded-2xl bg-white px-6 py-3.5 font-semibold text-slate-950">Start learning</a>
        <a href="#prompt-lab" className="glass rounded-2xl px-6 py-3.5 font-semibold text-white/85">Open Prompt Lab</a>
      </div>
    </motion.div>
    <a href="#learn" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/45"><ArrowDown className="animate-bounce"/></a>
  </section>
}
