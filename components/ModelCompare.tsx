"use client";
import { useState } from "react";
import { topics,results } from "@/data/content";
import { motion } from "motion/react";

type Metric="accuracy"|"clarity"|"usefulness";

export default function ModelCompare(){
  const [topicId,setTopicId]=useState(topics[0].id);
  const [metric,setMetric]=useState<Metric>("accuracy");
  const rows=results[topicId];
  return <section id="compare" className="border-y border-white/5 bg-white/[.018] py-28">
    <div className="section-shell">
      <div className="mb-12 max-w-3xl"><p className="section-label">Model comparison</p><h2 className="section-title">Do not ask which AI is “best.” Ask: best at what?</h2><p className="section-copy">These are placeholder scores for interface testing, not final research findings.</p></div>
      <div className="mb-8 flex flex-wrap gap-3">
        <select value={topicId} onChange={e=>setTopicId(e.target.value)} className="control-select">{topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select>
        {(["accuracy","clarity","usefulness"] as Metric[]).map(m=><button key={m} onClick={()=>setMetric(m)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize ${metric===m?"bg-white text-slate-950":"border border-white/8 text-white/55"}`}>{m}</button>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {rows.map((r:any)=><motion.article key={r.model} whileHover={{y:-6}} className="panel">
          <div className="mb-6 flex items-center justify-between"><h3 className="text-xl font-semibold">{r.model}</h3><span className="text-3xl font-semibold">{r[metric]}<small className="text-sm text-white/35">/5</small></span></div>
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/5"><motion.div key={`${topicId}-${metric}-${r.model}`} initial={{width:0}} animate={{width:`${r[metric]*20}%`}} transition={{duration:.65}} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300"/></div>
          <p className="leading-7 text-white/52">{r.text}</p>
        </motion.article>)}
      </div>
    </div>
  </section>
}
