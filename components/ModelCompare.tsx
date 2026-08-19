"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  MessageSquareText,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { topics } from "@/data/content";

const MODELS = ["ChatGPT", "Claude", "Gemini"] as const;
const METRICS = [
  { key: "accuracy", label: "Scientific Accuracy", short: "Accuracy" },
  { key: "clarity", label: "Clarity", short: "Clarity" },
  { key: "usefulness", label: "Educational Usefulness", short: "Usefulness" },
] as const;

const STRATEGIES = {
  analogy: {
    label: "Analogy",
    description:
      "Explain the concept with a simple, accurate analogy and clearly state where the analogy stops being accurate.",
    instruction:
      "Use one simple everyday analogy that a learner under 20 can understand. Clearly explain where the analogy stops being accurate.",
  },
  lesson: {
    label: "Lesson",
    description:
      "Teach the concept like a short lesson with a clear structure and a memorable key takeaway.",
    instruction:
      "Teach it as a short lesson with the sections: What it is, Why it matters, and Key takeaway.",
  },
  comparison: {
    label: "Comparison",
    description:
      "Explain the concept by comparing it with a related idea that learners may easily confuse it with.",
    instruction:
      "Compare it with one closely related neuroscience concept that learners may confuse it with, then explain the difference.",
  },
  custom: {
    label: "Custom",
    description: "Write your own prompting strategy for a new experiment.",
    instruction: "",
  },
} as const;

type StrategyKey = keyof typeof STRATEGIES;
type MetricKey = (typeof METRICS)[number]["key"];
type ScoreMap = Record<string, number | null>;
type TextMap = Record<string, string>;

type SavedState = {
  topicMode: "preset" | "custom";
  topicId: string;
  customTopic: string;
  strategy: StrategyKey;
  customStrategy: string;
  scores: ScoreMap;
  responses: TextMap;
  comments: TextMap;
};

const STORAGE_KEY = "neurolearn-week5-guided-workflow-v1";

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "untitled";
}

function baseKey(topicKey: string, strategyKey: string, model: string) {
  return `${topicKey}__${strategyKey}__${model}`;
}

function scoreKey(topicKey: string, strategyKey: string, model: string, metric: MetricKey) {
  return `${baseKey(topicKey, strategyKey, model)}__${metric}`;
}

function buildPrompt(topicTitle: string, strategy: StrategyKey, customStrategy: string) {
  const instruction = strategy === "custom" ? customStrategy.trim() : STRATEGIES[strategy].instruction;
  return `Explain ${topicTitle} for a learner under 20. ${instruction} Keep the answer scientifically accurate, clear, concise, and educational. Do not invent facts or citations.`;
}

export default function ModelCompare() {
  const [topicMode, setTopicMode] = useState<"preset" | "custom">("preset");
  const [topicId, setTopicId] = useState(topics[0].id);
  const [customTopic, setCustomTopic] = useState("");
  const [strategy, setStrategy] = useState<StrategyKey>("analogy");
  const [customStrategy, setCustomStrategy] = useState("");
  const [scores, setScores] = useState<ScoreMap>({});
  const [responses, setResponses] = useState<TextMap>({});
  const [comments, setComments] = useState<TextMap>({});
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw) as SavedState;
      if (state.topicMode) setTopicMode(state.topicMode);
      if (state.topicId) setTopicId(state.topicId);
      if (typeof state.customTopic === "string") setCustomTopic(state.customTopic);
      if (state.strategy && state.strategy in STRATEGIES) setStrategy(state.strategy);
      if (typeof state.customStrategy === "string") setCustomStrategy(state.customStrategy);
      if (state.scores) setScores(state.scores);
      if (state.responses) setResponses(state.responses);
      if (state.comments) setComments(state.comments);
    } catch {
      // Ignore malformed local data.
    }
  }, []);

  const presetTopic = topics.find((item) => item.id === topicId) ?? topics[0];
  const topicTitle = topicMode === "custom" ? customTopic.trim() : presetTopic.title;
  const topicKey = topicMode === "custom" ? `custom-${slug(customTopic)}` : presetTopic.id;
  const strategyInstruction = strategy === "custom" ? customStrategy.trim() : STRATEGIES[strategy].instruction;
  const strategyKey = strategy === "custom" ? `custom-${slug(customStrategy)}` : strategy;
  const prompt = topicTitle && strategyInstruction ? buildPrompt(topicTitle, strategy, customStrategy) : "";

  const responseCount = useMemo(
    () => MODELS.filter((model) => (responses[baseKey(topicKey, strategyKey, model)] ?? "").trim().length > 0).length,
    [responses, topicKey, strategyKey],
  );

  const scoreCount = useMemo(() => {
    let count = 0;
    MODELS.forEach((model) => {
      METRICS.forEach((metric) => {
        if (scores[scoreKey(topicKey, strategyKey, model, metric.key)] != null) count += 1;
      });
    });
    return count;
  }, [scores, topicKey, strategyKey]);

  const evaluationCount = useMemo(
    () => MODELS.filter((model) => (comments[baseKey(topicKey, strategyKey, model)] ?? "").trim().length > 0).length,
    [comments, topicKey, strategyKey],
  );

  const topicReady = topicTitle.length > 0;
  const strategyReady = strategy !== "custom" || customStrategy.trim().length > 0;
  const setupReady = topicReady && strategyReady;
  const responsesReady = responseCount === MODELS.length;
  const scoresReady = scoreCount === MODELS.length * METRICS.length;
  const evaluationsReady = evaluationCount === MODELS.length;
  const workflowComplete = setupReady && responsesReady && scoresReady && evaluationsReady;

  const steps = [
    { label: "Topic", done: topicReady, detail: topicReady ? topicTitle : "Not selected" },
    { label: "Strategy", done: strategyReady, detail: strategyReady ? STRATEGIES[strategy].label : "Not selected" },
    { label: "Responses", done: responsesReady, detail: `${responseCount}/3` },
    { label: "Scoring", done: scoresReady, detail: `${scoreCount}/9` },
    { label: "Evaluation", done: evaluationsReady, detail: `${evaluationCount}/3` },
  ];

  function setScore(model: string, metric: MetricKey, value: number) {
    setSaved(false);
    setScores((current) => ({ ...current, [scoreKey(topicKey, strategyKey, model, metric)]: value }));
  }

  function setResponse(model: string, value: string) {
    setSaved(false);
    setResponses((current) => ({ ...current, [baseKey(topicKey, strategyKey, model)]: value }));
  }

  function setComment(model: string, value: string) {
    setSaved(false);
    setComments((current) => ({ ...current, [baseKey(topicKey, strategyKey, model)]: value }));
  }

  function totalFor(model: string) {
    return METRICS.reduce((total, metric) => total + (scores[scoreKey(topicKey, strategyKey, model, metric.key)] ?? 0), 0);
  }

  function saveProgress() {
    const state: SavedState = {
      topicMode,
      topicId,
      customTopic,
      strategy,
      customStrategy,
      scores,
      responses,
      comments,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }

  function resetCurrentRun() {
    if (!window.confirm("Clear responses, scores, and evaluations for the current topic and strategy?")) return;
    const prefix = `${topicKey}__${strategyKey}__`;
    setResponses((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(prefix))));
    setComments((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(prefix))));
    setScores((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(prefix))));
    setSaved(false);
  }

  async function copyPrompt() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function exportCsv() {
    if (!setupReady) return;
    const rows = [[
      "Topic",
      "Prompt Strategy",
      "Strategy Instruction",
      "Model",
      "Prompt",
      "AI Response",
      "Scientific Accuracy",
      "Clarity",
      "Educational Usefulness",
      "Total / 15",
      "Evaluation Comment",
    ]];

    MODELS.forEach((model) => {
      const key = baseKey(topicKey, strategyKey, model);
      rows.push([
        topicTitle,
        STRATEGIES[strategy].label,
        strategyInstruction,
        model,
        prompt,
        responses[key] ?? "",
        String(scores[scoreKey(topicKey, strategyKey, model, "accuracy")] ?? ""),
        String(scores[scoreKey(topicKey, strategyKey, model, "clarity")] ?? ""),
        String(scores[scoreKey(topicKey, strategyKey, model, "usefulness")] ?? ""),
        String(totalFor(model)),
        comments[key] ?? "",
      ]);
    });

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neurolearn-${slug(topicTitle)}-${slug(STRATEGIES[strategy].label)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="compare" className="border-y border-white/5 bg-white/[.018] py-28">
      <div className="section-shell">
        <div className="mb-10 max-w-4xl">
          <p className="section-label">Week 5 · Guided Comparison Workflow</p>
          <h2 className="section-title">Run the full experiment inside the website.</h2>
          <p className="section-copy">
            Enter a neuroscience topic, choose a prompting strategy, paste three AI responses, score each response with the same rubric,
            then add evaluation comments and export the final comparison.
          </p>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step.label} className={`rounded-2xl border p-4 ${step.done ? "border-emerald-300/20 bg-emerald-300/[.055]" : "border-white/8 bg-white/[.025]"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[.16em] text-white/35">Step {index + 1}</span>
                <span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${step.done ? "bg-emerald-300 text-slate-950" : "bg-white/6 text-white/35"}`}>
                  {step.done ? <Check size={14} /> : index + 1}
                </span>
              </div>
              <div className="mt-3 font-semibold">{step.label}</div>
              <div className="mt-1 truncate text-xs text-white/38">{step.detail}</div>
            </div>
          ))}
        </div>

        <WorkflowStep number="01" title="Enter a neuroscience topic" subtitle="Use one of the project topics or type a new concept for the experiment." icon={<FileText size={20} />}>
          <div className="grid gap-5 lg:grid-cols-[.65fr_1.35fr]">
            <div className="flex gap-2 rounded-2xl border border-white/8 bg-black/10 p-1.5">
              <button type="button" onClick={() => setTopicMode("preset")} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ${topicMode === "preset" ? "bg-white text-slate-950" : "text-white/45"}`}>Project topics</button>
              <button type="button" onClick={() => setTopicMode("custom")} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ${topicMode === "custom" ? "bg-white text-slate-950" : "text-white/45"}`}>Custom topic</button>
            </div>

            {topicMode === "preset" ? (
              <label className="grid gap-2 text-sm font-semibold text-white/62">
                Topic
                <select value={topicId} onChange={(event) => setTopicId(event.target.value)} className="control-select w-full">
                  {topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
            ) : (
              <label className="grid gap-2 text-sm font-semibold text-white/62">
                Custom neuroscience topic
                <input value={customTopic} onChange={(event) => setCustomTopic(event.target.value)} placeholder="e.g. How sleep affects brain aging" className="rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-violet-400/60" />
              </label>
            )}
          </div>
        </WorkflowStep>

        <WorkflowStep number="02" title="Choose a prompting strategy" subtitle="The same strategy and prompt will be used for ChatGPT, Claude, and Gemini." icon={<Sparkles size={20} />} locked={!topicReady}>
          <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <label className="grid gap-2 text-sm font-semibold text-white/62">
                Prompt strategy
                <select value={strategy} onChange={(event) => setStrategy(event.target.value as StrategyKey)} className="control-select w-full">
                  {(Object.keys(STRATEGIES) as StrategyKey[]).map((key) => <option key={key} value={key}>{STRATEGIES[key].label}</option>)}
                </select>
              </label>
              {strategy === "custom" && (
                <label className="mt-4 grid gap-2 text-sm font-semibold text-white/62">
                  Custom strategy instruction
                  <textarea value={customStrategy} onChange={(event) => setCustomStrategy(event.target.value)} rows={4} placeholder="e.g. Explain it through a short story, then finish with three key facts." className="resize-y rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-violet-400/60" />
                </label>
              )}
              <p className="mt-4 text-sm leading-6 text-white/42">{STRATEGIES[strategy].description}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/15 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="text-xs font-bold uppercase tracking-[.16em] text-violet-300">Prompt preview</div>
                <button type="button" disabled={!prompt} onClick={copyPrompt} className="flex items-center gap-2 text-xs font-semibold text-white/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-white/65">{prompt || "Complete the topic and strategy to generate the controlled prompt."}</pre>
            </div>
          </div>
        </WorkflowStep>

        <WorkflowStep number="03" title="Paste three AI responses" subtitle="Run the same prompt in all three models, then paste each response below." icon={<MessageSquareText size={20} />} locked={!setupReady} badge={`${responseCount}/3 responses`}>
          <div className="grid gap-4 lg:grid-cols-3">
            {MODELS.map((model) => {
              const key = baseKey(topicKey, strategyKey, model);
              const filled = (responses[key] ?? "").trim().length > 0;
              return (
                <label key={model} className="grid gap-3 rounded-2xl border border-white/8 bg-black/10 p-4 text-sm font-semibold text-white/65">
                  <div className="flex items-center justify-between gap-3">
                    <span>{model}</span>
                    {filled && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300"><Check size={13} /> Added</span>}
                  </div>
                  <textarea value={responses[key] ?? ""} onChange={(event) => setResponse(model, event.target.value)} rows={12} placeholder={`Paste the ${model} response here...`} className="resize-y rounded-xl border border-white/8 bg-[#0b0e1b] px-4 py-3 font-normal leading-6 text-white/65 outline-none placeholder:text-white/20 focus:border-violet-400/60" />
                </label>
              );
            })}
          </div>
        </WorkflowStep>

        <WorkflowStep number="04" title="Score each response" subtitle="Use the same 1–5 rubric for every model so the comparison stays consistent." icon={<ClipboardCheck size={20} />} locked={!responsesReady} badge={`${scoreCount}/9 scores`}>
          <div className="grid gap-4 lg:grid-cols-3">
            {MODELS.map((model) => (
              <article key={model} className="rounded-2xl border border-white/8 bg-black/10 p-4">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{model}</h3>
                  <div className="text-2xl font-semibold">{totalFor(model)}<span className="text-xs text-white/30">/15</span></div>
                </div>
                <div className="space-y-5">
                  {METRICS.map((metric) => (
                    <div key={metric.key}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm text-white/55">{metric.label}</span>
                        <span className="text-xs text-white/28">/5</span>
                      </div>
                      <ScorePicker value={scores[scoreKey(topicKey, strategyKey, model, metric.key)] ?? null} onChange={(value) => setScore(model, metric.key, value)} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </WorkflowStep>

        <WorkflowStep number="05" title="Add evaluation comments" subtitle="Record why each AI received its scores. These comments can later be generated through an API." icon={<MessageSquareText size={20} />} locked={!scoresReady} badge={`${evaluationCount}/3 evaluations`}>
          <div className="grid gap-4 lg:grid-cols-3">
            {MODELS.map((model) => {
              const key = baseKey(topicKey, strategyKey, model);
              return (
                <label key={model} className="grid gap-3 rounded-2xl border border-white/8 bg-black/10 p-4 text-sm font-semibold text-white/65">
                  <div className="flex items-center justify-between gap-3"><span>{model} evaluation</span><span className="text-xs text-white/30">Score {totalFor(model)}/15</span></div>
                  <textarea value={comments[key] ?? ""} onChange={(event) => setComment(model, event.target.value)} rows={7} placeholder="Explain the strengths, weaknesses, and the reason for the rubric scores..." className="resize-y rounded-xl border border-white/8 bg-[#0b0e1b] px-4 py-3 font-normal leading-6 text-white/65 outline-none placeholder:text-white/20 focus:border-violet-400/60" />
                </label>
              );
            })}
          </div>
        </WorkflowStep>

        <div className={`mt-6 rounded-[1.75rem] border p-5 transition sm:p-6 ${workflowComplete ? "border-violet-300/20 bg-violet-300/[.045]" : "border-white/8 bg-white/[.025]"}`}>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold"><ClipboardCheck size={20} /> Final comparison</div>
              <p className="mt-2 text-sm text-white/42">
                {workflowComplete ? `${topicTitle} · ${STRATEGIES[strategy].label} strategy · complete.` : "Complete all five steps to finish this run-through."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={resetCurrentRun} disabled={!setupReady} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/55 hover:text-white disabled:opacity-30"><RotateCcw size={16} /> Reset run</button>
              <button type="button" onClick={exportCsv} disabled={!setupReady} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/65 hover:text-white disabled:opacity-30"><Download size={16} /> Export CSV</button>
              <button type="button" onClick={saveProgress} className="flex items-center gap-2 rounded-xl bg-violet-300 px-4 py-2.5 text-sm font-semibold text-slate-950"><Save size={16} /> {saved ? "Saved" : "Save progress"}</button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {MODELS.map((model) => {
              const key = baseKey(topicKey, strategyKey, model);
              return (
                <article key={model} className="rounded-2xl border border-white/8 bg-black/10 p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div><div className="text-xs font-bold uppercase tracking-[.15em] text-white/32">Model</div><h3 className="mt-1 text-xl font-semibold">{model}</h3></div>
                    <div className="text-3xl font-semibold">{totalFor(model)}<span className="text-xs text-white/30">/15</span></div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {METRICS.map((metric) => <MiniScore key={metric.key} label={metric.short} value={scores[scoreKey(topicKey, strategyKey, model, metric.key)] ?? null} />)}
                  </div>
                  <p className="mt-5 min-h-20 text-sm leading-6 text-white/45">{comments[key]?.trim() || "Evaluation comment will appear here."}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-cyan-300/10 bg-cyan-300/[.035] px-4 py-3 text-xs leading-5 text-cyan-100/55">
            <Sparkles size={15} className="shrink-0" />
            API-ready structure: a future server route can generate the three responses and evaluation comments while keeping this same scoring workflow and interface.
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({
  number,
  title,
  subtitle,
  icon,
  children,
  locked = false,
  badge,
}: {
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  locked?: boolean;
  badge?: string;
}) {
  return (
    <section className={`mt-5 overflow-hidden rounded-[1.75rem] border transition ${locked ? "border-white/5 bg-white/[.012] opacity-45" : "border-white/8 bg-white/[.027]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/7 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-sm font-bold text-violet-200">{number}</span>
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">{icon}{title}</div>
            <p className="mt-1 text-sm text-white/38">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {badge && <span className="rounded-full border border-white/8 bg-white/[.025] px-3 py-1.5 text-xs font-semibold text-white/42">{badge}</span>}
          {locked && <span className="text-xs font-semibold text-white/30">Complete the previous step</span>}
          {!locked && <ChevronDown size={17} className="text-white/25" />}
        </div>
      </div>
      <div className={`p-5 sm:p-6 ${locked ? "pointer-events-none select-none" : ""}`}>{children}</div>
    </section>
  );
}

function ScorePicker({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          type="button"
          key={score}
          onClick={() => onChange(score)}
          aria-label={`Score ${score} out of 5`}
          className={`grid size-9 place-items-center rounded-lg border text-sm font-semibold transition ${
            value === score
              ? "border-violet-300 bg-violet-300 text-slate-950 shadow-[0_0_22px_rgba(167,139,250,.22)]"
              : "border-white/8 bg-white/[.025] text-white/45 hover:border-white/18 hover:text-white"
          }`}
        >
          {score}
        </button>
      ))}
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-white/7 bg-white/[.02] p-2.5 text-center">
      <div className="text-[10px] uppercase tracking-[.08em] text-white/30">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value ?? "–"}<span className="text-[10px] text-white/25">/5</span></div>
    </div>
  );
}
