export const topics = [
  {
    id:"brain-aging",
    label:"Topic 01",
    title:"Brain Aging",
    subtitle:"Change does not automatically mean disease.",
    body:"As people age, some mental tasks may take longer. That is not the same as dementia, which interferes with daily life.",
    check:"A careful explanation should distinguish normal aging from neurological disease.",
    accent:"from-violet-500/30 to-cyan-400/20"
  },
  {
    id:"alzheimers",
    label:"Topic 02",
    title:"Alzheimer’s Disease",
    subtitle:"A complex disease, not a single broken switch.",
    body:"Alzheimer’s gradually affects memory, thinking, and independence. Amyloid, tau, inflammation, genetics, and other processes may all play roles.",
    check:"Good science communication should avoid presenting one mechanism as the complete cause.",
    accent:"from-fuchsia-500/25 to-amber-300/20"
  },
  {
    id:"neuroinflammation",
    label:"Topic 03",
    title:"Neuroinflammation",
    subtitle:"The brain’s immune response can protect—or harm.",
    body:"Immune activity in the nervous system can help respond to injury. Persistent or abnormal activation may disrupt neurons and signaling.",
    check:"Analogies can help, but they should state where the comparison stops being accurate.",
    accent:"from-emerald-400/25 to-blue-500/20"
  }
];

export const results: Record<string, any[]> = {
  "brain-aging":[
    {model:"ChatGPT",text:"Explains normal aging clearly and separates slower recall from dementia.",accuracy:4,clarity:5,usefulness:5},
    {model:"Claude",text:"Adds nuance about individual differences and preserved abilities.",accuracy:5,clarity:4,usefulness:4},
    {model:"Gemini",text:"Uses accessible language but some claims need closer source checking.",accuracy:4,clarity:4,usefulness:4}
  ],
  "alzheimers":[
    {model:"ChatGPT",text:"Readable overview, though the role of amyloid and tau may be simplified.",accuracy:4,clarity:5,usefulness:4},
    {model:"Claude",text:"Balances biological detail with uncertainty and avoids a single-cause story.",accuracy:5,clarity:4,usefulness:5},
    {model:"Gemini",text:"Friendly structure, but a few statements may be too broad.",accuracy:4,clarity:5,usefulness:4}
  ],
  "neuroinflammation":[
    {model:"ChatGPT",text:"Memorable analogy, but oversimplification must be checked.",accuracy:4,clarity:5,usefulness:5},
    {model:"Claude",text:"Explains protective and harmful roles with strong context.",accuracy:5,clarity:4,usefulness:4},
    {model:"Gemini",text:"Easy introduction, though mechanistic details need verification.",accuracy:4,clarity:4,usefulness:4}
  ]
};
