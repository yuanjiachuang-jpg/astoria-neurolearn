"use client";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [["Learn","#learn"],["Prompt Lab","#prompt-lab"],["Compare","#compare"],["Method","#method"]];

export default function Navbar(){
  const [open,setOpen]=useState(false);
  return <header className="fixed left-1/2 top-4 z-50 w-[min(94%,1120px)] -translate-x-1/2">
    <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
      <a href="#home" className="flex items-center gap-2 font-semibold">
        <span className="grid size-9 place-items-center rounded-xl bg-white/10"><Brain size={19}/></span>
        NeuroLearn
      </a>
      <nav className="hidden items-center gap-7 text-sm text-white/65 md:flex">
        {links.map(([l,h])=><a key={h} href={h} className="hover:text-white">{l}</a>)}
      </nav>
      <a href="#prompt-lab" className="hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 md:block">Explore</a>
      <button className="md:hidden" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<nav className="glass mt-2 grid gap-2 rounded-2xl p-3 md:hidden">
      {links.map(([l,h])=><a key={h} href={h} onClick={()=>setOpen(false)} className="rounded-xl px-3 py-3 text-white/75 hover:bg-white/5">{l}</a>)}
    </nav>}
  </header>
}
