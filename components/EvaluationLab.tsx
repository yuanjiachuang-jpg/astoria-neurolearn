"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Download,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { topics } from "@/data/content";

const MODELS = ["ChatGPT", "Claude", "Gemini"] as const;
const DEFAULT_CATEGORIES = [
  "Scientific Accuracy",
  "Clarity",
  "Readability",
  "Educational Usefulness",
  "Completeness",
];

const CATEGORY_HELP: Record<string, string> = {
  "Scientific Accuracy": "Are the scientific claims correct and non-misleading?",
  Clarity: "Is the explanation logically organized and easy to follow?",
  Readability: "Is the language appropriate and comfortable for the target audience?",
  "Educational Usefulness": "Does the response actually help a learner understand the concept?",
  Completeness: "Does it include the key ideas needed for a useful explanation?",
};

type ScoreMap = Record<string, number | null>;
type ResponseMap = Record<string, string>;

type SavedState = {
  categories: string[];
  customCategory: string;
  scores: ScoreMap;
  responses: ResponseMap;
  methodology: string;
  evaluator: string;
  secondsElapsed: number;
};

const STORAGE_KEY = "neurolearn-week3-evaluation";

function scoreKey(topicId: string, model: string, category: string) {
  return `${topicId}__${model}__${category}`;
}

export default function EvaluationLab() {
  const [categories, setCategories] = useState<string[]>([
    "Scientific Accuracy",
    "Clarity",
    "Educational Usefulness",
  ]);
  const [customCategory, setCustomCategory] = useState("");
  const [scores, setScores] = useState<ScoreMap>({});
  const [responses, setResponses] = useState<ResponseMap>({});
  const [methodology, setMethodology] = useState(
    "I will score each response using the same 1–5 rubric. I will compare scientific claims against reliable neuroscience sources, then judge clarity and educational usefulness for a learner under 20."
  );
  const [evaluator, setEvaluator] = useState("Human evaluator (me)");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const savedState = JSON.parse(raw) as SavedState;
      if (savedState.categories?.length) setCategories(savedState.categories);
      if (typeof savedState.customCategory === "string") setCustomCategory(savedState.customCategory);
      if (savedState.scores) setScores(savedState.scores);
      if (savedState.responses) setResponses(savedState.responses);
      if (savedState.methodology) setMethodology(savedState.methodology);
      if (savedState.evaluator) setEvaluator(savedState.evaluator);
      if (Number.isFinite(savedState.secondsElapsed)) setSecondsElapsed(savedState.secondsElapsed);
    } catch {
      // Ignore malformed local data.
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSecondsElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const totalExpected = topics.length * MODELS.length * 3;
  const completed = useMemo(() => {
    let count = 0;
    topics.forEach((topic) => {
      MODELS.forEach((model) => {
        categories.forEach((category) => {
          if (scores[scoreKey(topic.id, model, category)] != null) count += 1;
        });
      });
    });
    return count;
  }, [scores, categories]);

  const progress = Math.round((completed / totalExpected) * 100);

  function toggleCategory(category: string) {
    setSaved(false);
    setCategories((current) => {
      if (current.includes(category)) return current.filter((item) => item !== category);
      if (current.length >= 3) return current;
      return [...current, category];
    });
  }

  function addCustomCategory() {
    const clean = customCategory.trim();
    if (!clean || categories.length >= 3 || categories.includes(clean)) return;
    setCategories((current) => [...current, clean]);
    setCustomCategory("");
  }

  function setScore(topicId: string, model: string, category: string, value: number) {
    setSaved(false);
    setScores((current) => ({ ...current, [scoreKey(topicId, model, category)]: value }));
  }

  function saveEvaluation() {
    const state: SavedState = {
      categories,
      customCategory,
      scores,
      responses,
      methodology,
      evaluator,
      secondsElapsed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  function resetEvaluation() {
    if (!window.confirm("Reset all Week 3 scores and the timer?")) return;
    setScores({});
    setResponses({});
    setSecondsElapsed(0);
    setRunning(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  function exportCsv() {
    const rows = [["Topic", "Model", "AI Response", ...categories]];
    topics.forEach((topic) => {
      MODELS.forEach((model) => {
        rows.push([
          topic.title,
          model,
          responses[`${topic.id}__${model}`] ?? "",
          ...categories.map((category) => {
            const value = scores[scoreKey(topic.id, model, category)];
            return value == null ? "" : String(value);
          }),
        ]);
      });
    });
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neurolearn-week3-rubric.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function setResponse(topicId: string, model: string, value: string) {
    setSaved(false);
    setResponses((current) => ({ ...current, [`${topicId}__${model}`]: value }));
  }

  const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
  const seconds = String(secondsElapsed % 60).padStart(2, "0");

  return (
    <section id="evaluate" className="section-shell py-28">
      <div className="mb-12 max-w-4xl">
        <p className="section-label">Week 3 · Evaluation Framework</p>
        <h2 className="section-title">Score every response with one consistent rubric.</h2>
        <p className="section-copy">
          This interface follows the internship task: choose exactly three criteria, evaluate three AI
          platforms across three neuroscience topics, and complete 27 individual rubric scores.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Rubric progress" value={`${completed}/${totalExpected}`} detail={`${progress}% complete`} />
        <StatCard label="Evaluation timer" value={`${minutes}:${seconds}`} detail={running ? "Timer running" : "Timer paused"} />
        <StatCard label="Responses" value="9" detail="3 topics × 3 AI platforms" />
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="panel">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold"><ClipboardCheck size={20}/> Choose 3 rubric categories</div>
              <p className="mt-2 text-sm text-white/45">Exactly three categories are used in every score table.</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${categories.length === 3 ? "bg-emerald-400/10 text-emerald-200" : "bg-amber-400/10 text-amber-200"}`}>
              {categories.length}/3 selected
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {DEFAULT_CATEGORIES.map((category) => {
              const active = categories.includes(category);
              const disabled = !active && categories.length >= 3;
              return (
                <button
                  type="button"
                  key={category}
                  disabled={disabled}
                  onClick={() => toggleCategory(category)}
                  className={`rounded-2xl border p-4 text-left transition ${active ? "border-violet-400/60 bg-violet-400/10" : "border-white/8 bg-white/[.02] hover:border-white/15"} ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{category}</span>
                    <span className={`grid size-6 place-items-center rounded-full border ${active ? "border-violet-300 bg-violet-300 text-slate-950" : "border-white/15"}`}>
                      {active && <Check size={14}/>} 
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/42">{CATEGORY_HELP[category]}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") addCustomCategory(); }}
              placeholder="Or add a custom category..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-400/70"
            />
            <button onClick={addCustomCategory} disabled={categories.length >= 3} className="rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/65 hover:text-white disabled:opacity-30">Add</button>
          </div>
        </div>

        <div className="panel">
          <div className="mb-5 flex items-center gap-2 text-lg font-semibold"><Sparkles size={20}/> Scoring methodology</div>
          <label className="grid gap-2 text-sm font-medium text-white/65">
            Who is grading?
            <select value={evaluator} onChange={(e) => setEvaluator(e.target.value)} className="control-select w-full">
              <option>Human evaluator (me)</option>
              <option>Human evaluator + source checking</option>
              <option>Different AI model as evaluator</option>
              <option>Hybrid: human + AI assistance</option>
            </select>
          </label>
          <label className="mt-4 grid gap-2 text-sm font-medium text-white/65">
            Methodology paragraph
            <textarea
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              rows={6}
              className="resize-none rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-sm leading-6 text-white/75 outline-none focus:border-violet-400/70"
            />
          </label>
          <button onClick={() => setShowGuide(!showGuide)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-200">
            1–5 scoring guide <ChevronDown size={16} className={`transition ${showGuide ? "rotate-180" : ""}`}/>
          </button>
          {showGuide && (
            <div className="mt-3 grid gap-2 rounded-xl border border-white/8 bg-white/[.025] p-4 text-xs text-white/55">
              <span><b className="text-white">5</b> — Excellent; no meaningful weakness for this criterion.</span>
              <span><b className="text-white">4</b> — Good; minor weakness but still strong.</span>
              <span><b className="text-white">3</b> — Acceptable; useful but has noticeable limitations.</span>
              <span><b className="text-white">2</b> — Weak; important problems reduce usefulness.</span>
              <span><b className="text-white">1</b> — Poor; major issues or failure on the criterion.</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[.025] p-4">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <Clock3 size={18}/>
          <span>Track how long it takes to complete all three tables.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setRunning((value) => !value)} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
            {running ? "Pause timer" : secondsElapsed ? "Resume timer" : "Start timer"}
          </button>
          <button onClick={resetEvaluation} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/55 hover:text-white"><RotateCcw size={15}/>Reset</button>
        </div>
      </div>

      <div className="space-y-6">
        {topics.map((topic, topicIndex) => (
          <article key={topic.id} className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[.025]">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/7 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Table {topicIndex + 1} · Neuroscience topic</p>
                <h3 className="mt-2 text-2xl font-semibold">{topic.title}</h3>
              </div>
              <code className="max-w-full rounded-xl bg-black/20 px-3 py-2 text-xs text-white/45">Please explain {topic.title} in 3 paragraphs.</code>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[.14em] text-white/35">
                    <th className="w-[180px] px-5 py-4 font-semibold">AI platform</th>
                    {categories.map((category) => <th key={category} className="px-4 py-4 font-semibold">{category}</th>)}
                    {categories.length < 3 && <th className="px-4 py-4 font-semibold text-amber-200/60">Choose {3 - categories.length} more</th>}
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map((model) => (
                    <tr key={model} className="border-t border-white/6">
                      <td className="px-5 py-5">
                        <div className="font-semibold">{model}</div>
                        <div className="mt-1 text-xs text-white/35">Response to {topic.title}</div>
                        <textarea
                          value={responses[`${topic.id}__${model}`] ?? ""}
                          onChange={(event) => setResponse(topic.id, model, event.target.value)}
                          rows={3}
                          placeholder="Paste the AI response here..."
                          className="mt-3 w-[260px] resize-y rounded-xl border border-white/8 bg-black/15 px-3 py-2 text-xs leading-5 text-white/60 outline-none placeholder:text-white/20 focus:border-violet-400/60"
                        />
                      </td>
                      {categories.map((category) => (
                        <td key={category} className="px-4 py-4">
                          <ScorePicker
                            value={scores[scoreKey(topic.id, model, category)] ?? null}
                            onChange={(value) => setScore(topic.id, model, category, value)}
                          />
                        </td>
                      ))}
                      {categories.length < 3 && <td className="px-4 py-4 text-sm text-white/25">—</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[.03] p-5">
        <div>
          <div className="font-semibold">Week 3 deliverable status</div>
          <p className="mt-1 text-sm text-white/42">{completed === totalExpected ? "All 27 rubric scores are complete." : `${totalExpected - completed} scores remaining.`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/65 hover:text-white"><Download size={16}/>Export CSV</button>
          <button onClick={saveEvaluation} className="flex items-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
            {saved ? <Check size={16}/> : <Save size={16}/>} {saved ? "Saved locally" : "Save progress"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ScorePicker({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
  return (
    <div className="flex min-w-[190px] gap-1.5">
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

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="panel">
      <div className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-[-.04em]">{value}</div>
      <div className="mt-2 text-xs text-white/38">{detail}</div>
    </div>
  );
}
