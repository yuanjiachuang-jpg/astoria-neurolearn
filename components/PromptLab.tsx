"use client";
import { useMemo,useState } from "react";
import { Copy,Check,WandSparkles } from "lucide-react";
import { topics } from "@/data/content";

const audiences:any={child:"a learner aged 10 to 12",teen:"a teenager aged 13 to 17",beginner:"a first-year college student with little neuroscience background"};
const styles:any={analogy:"Use one accurate everyday analogy and explain its limits.",lesson:"Organize the answer into: What it is, Why it matters, and Key takeaway.",comparison:"Compare it with one related concept learners often confuse it with."};

export default function PromptLab(){
  const [topicId,setTopicId]=useState(topics[0].id);
  const [audience,setAudience]=useState("teen");
  const [style,setStyle]=useState("analogy");
  const [copied,setCopied]=useState(false);
  const topic=topics.find(t=>t.id===topicId)!;
  const prompt=useMemo(()=>`You are a careful neuroscience educator.

Explain ${topic.title} to ${audiences[audience]}.

Requirements:
- Be scientifically accurate and distinguish established knowledge from uncertainty.
- Avoid unnecessary jargon and define technical words.
- ${styles[style]}
- Use no more than 250 words.
- Do not invent facts, studies, or citations.
- End with one question that checks understanding.`,[topic,audience,style]);

  async function copy(){await navigator.clipboard.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),1200)}

  return <section id="prompt-lab" className="section-shell py-28">
    <div className="mb-12 max-w-3xl"><p className="section-label">Prompt Lab</p><h2 className="section-title">Change the instruction. Change the explanation.</h2><p className="section-copy">Build a controlled prompt now. Later, send the same prompt to several models for formal comparison.</p></div>
    <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
      <div className="panel grid content-start gap-5">
        <Select label="Topic" value={topicId} onChange={setTopicId} options={topics.map(t=>[t.id,t.title])}/>
        <Select label="Audience" value={audience} onChange={setAudience} options={[["child","Ages 10–12"],["teen","Ages 13–17"],["beginner","College beginner"]]}/>
        <Select label="Explanation style" value={style} onChange={setStyle} options={[["analogy","Analogy-based"],["lesson","Structured lesson"],["comparison","Concept comparison"]]}/>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/40"><WandSparkles size={15}/>Generated locally—no API key required.</div>
      </div>
      <div className="panel relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent"/>
        <div className="mb-6 flex items-center justify-between"><span className="rounded-full bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">Generated prompt</span><button onClick={copy} className="flex items-center gap-2 text-sm text-white/55 hover:text-white">{copied?<Check size={16}/>:<Copy size={16}/>} {copied?"Copied":"Copy"}</button></div>
        <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-white/72">{prompt}</pre>
      </div>
    </div>
  </section>
}

function Select({label,value,onChange,options}:{label:string,value:string,onChange:(v:string)=>void,options:string[][]}){
  return <label className="grid gap-2 text-sm font-medium text-white/72">{label}<select value={value} onChange={e=>onChange(e.target.value)} className="rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-white outline-none focus:border-violet-400/70">{options.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
}
