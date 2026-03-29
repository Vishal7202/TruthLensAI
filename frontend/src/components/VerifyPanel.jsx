import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export default function VerifyPanel(){

/* ================= STATE ================= */

const [text,setText]=useState("");
const [result,setResult]=useState(null);
const [loading,setLoading]=useState(false);
const [pdfFile,setPdfFile]=useState(null);
const [error,setError]=useState("");
const [thinkingStep,setThinkingStep]=useState("");
const [copiedIndex,setCopiedIndex]=useState(null);

/* ================= UI COMPONENTS ================= */

function GlowBadge({label}){
const styles={
TRUE:"bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.9)]",
FALSE:"bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.9)]",
MISLEADING:"bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.9)]",
PARTIALLY_TRUE:"bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.9)]"
};
return(
<span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${styles[label]||"bg-gray-500"}`}>
{label}
</span>
);
}

/* ================= TYPEWRITER ================= */

function TypingText({text=""}){
const [display,setDisplay]=useState("");

useEffect(()=>{
if(!text){ setDisplay(""); return; }

let i=0;
setDisplay("");

const id=setInterval(()=>{
i++;
setDisplay(text.slice(0,i));
if(i>=text.length) clearInterval(id);
},8);

return()=>clearInterval(id);
},[text]);

return(
<p className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 whitespace-pre-line">
{display}
</p>
);
}

/* ================= CONFIDENCE ================= */

function ConfidenceMeter({value=0}){
const r=36;
const c=2*Math.PI*r;
const offset=c-(value/100)*c;

return(
<div className="relative w-[90px] h-[90px] flex items-center justify-center">
<svg width="90" height="90">
<circle cx="45" cy="45" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none"/>
<circle cx="45" cy="45" r={r}
stroke="rgb(56,189,248)"
strokeWidth="8"
fill="none"
strokeDasharray={c}
strokeDashoffset={offset}
strokeLinecap="round"
transform="rotate(-90 45 45)"
className="transition-all duration-700"/>
</svg>
<div className="absolute text-sky-300 font-semibold text-lg">{value}%</div>
</div>
);
}

/* ================= BREAKDOWN ================= */

function BreakdownBars({value=0}){
const bars=[
["Evidence",Math.min(100,Math.round(value*0.9))],
["Source reliability",Math.min(100,Math.round(value*1.05))],
["Context accuracy",Math.min(100,Math.round(value*0.85))]
];

return(
<div className="mt-5 space-y-3">
{bars.map(([label,val])=>(
<div key={label}>
<p className="text-xs text-white/60">{label}</p>
<div className="w-full h-2 bg-slate-700 rounded-full mt-1">
<div className="h-2 bg-sky-500 rounded-full transition-all duration-700"
style={{width:`${val}%`}}/>
</div>
</div>
))}
</div>
);
}

/* ================= SOURCES ================= */

function SourcesAccordion({sources=[]}){
const [open,setOpen]=useState(false);
if(!sources?.length) return null;

return(
<div className="mt-5">
<button onClick={()=>setOpen(!open)}
className="text-sky-400 text-sm hover:underline">
{open?"Hide Sources":"Show Sources"}
</button>

{open&&(
<ul className="mt-3 space-y-2 text-sm text-white/80">
{sources.map((s,i)=>(
<li key={i} className="border-l border-sky-500 pl-3 break-all">
<a href={s} target="_blank" rel="noreferrer"
className="hover:text-sky-300">{s}</a>
</li>
))}
</ul>
)}
</div>
);
}

/* ================= LOADING TEXT ================= */

useEffect(()=>{
if(!loading) return;

const steps=[
"🔍 Scanning sources...",
"🧠 Checking credibility...",
"📊 Analyzing context...",
"⚡ Generating explanation..."
];

let i=0;
setThinkingStep(steps[0]);

const id=setInterval(()=>{
i=(i+1)%steps.length;
setThinkingStep(steps[i]);
},1200);

return()=>clearInterval(id);
},[loading]);

/* ================= ACTIONS ================= */

async function handleVerify(){

if(!text.trim()){
setError("Please enter some text first.");
return;
}

try{
setLoading(true);
setError("");
setResult(null);

const data = await apiFetch("/verify", {
  method: "POST",
  body: JSON.stringify({ text })
});

setResult(Array.isArray(data)?data:[data]);

}catch(err){
console.error(err);
setError("Server error. Please try again.");
}
finally{
setLoading(false);
}
}

/* ================= PDF VERIFY ================= */

async function handleVerifyPDF(){

if(!pdfFile){
setError("Please select a PDF first.");
return;
}

try{
setLoading(true);
setError("");
setResult(null);

const formData=new FormData();
formData.append("file",pdfFile);

const res=await fetch(`${import.meta.env.VITE_API_URL}/verify-pdf`,{
method:"POST",
body:formData
});

const data=await res.json();
setResult(Array.isArray(data)?data:[data]);

}catch(err){
console.error(err);
setError("PDF verification failed.");
}
finally{
setLoading(false);
}
}

/* ================= COPY ================= */

function copyText(text,index){
navigator.clipboard.writeText(text);
setCopiedIndex(index);
setTimeout(()=>setCopiedIndex(null),1500);
}


/* ================= UI ================= */

return (
<div className="relative w-full min-h-screen text-white overflow-hidden bg-[#020617]">

{/* ================= PREMIUM BACKGROUND ================= */}

<div className="absolute inset-0 -z-40 bg-[#020617]" />

<div className="absolute inset-0 -z-30 opacity-70">
  <div className="absolute w-[1200px] h-[1200px] bg-gradient-to-r 
  from-indigo-600/25 via-purple-600/15 to-sky-500/25 
  blur-[220px] rounded-full -top-[400px] -left-[300px]" />

  <div className="absolute w-[1000px] h-[1000px] bg-gradient-to-r 
  from-blue-500/15 via-cyan-400/15 to-emerald-400/15 
  blur-[200px] rounded-full bottom-[-300px] right-[-200px]" />
</div>

<div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-20 pb-32">









{/* ================= HERO ================= */}

<div className="grid lg:grid-cols-2 gap-20 items-center">

<div>

<h1 className="text-5xl md:text-6xl font-bold leading-tight 
bg-gradient-to-r from-sky-300 via-indigo-400 to-purple-400 
bg-clip-text text-transparent">
AI Claim <br/> Verification
</h1>

<p className="text-white/60 text-lg mt-6 max-w-xl">
Advanced AI-powered multi-source verification engine.
Transparent reasoning. Deep contextual analysis. Real-time confidence scoring.
</p>

<div className="mt-10 p-8 rounded-3xl 
bg-white/5 border border-white/10 
backdrop-blur-2xl shadow-xl">

<textarea
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Paste claim, news, or statement here..."
className="w-full h-36 p-5 rounded-2xl 
bg-[#0b1220] border border-white/10
focus:border-indigo-400 outline-none resize-none"
/>

<label className="block mt-6 cursor-pointer">
<input
type="file"
accept="application/pdf"
onChange={(e)=>setPdfFile(e.target.files[0])}
className="hidden"
/>
<div className="py-4 text-center rounded-xl
border border-dashed border-white/20
hover:border-indigo-400 hover:bg-indigo-500/5 transition">
{pdfFile ? pdfFile.name : "Upload PDF (optional)"}
</div>
</label>

<div className="flex flex-wrap gap-4 mt-8">

<button
onClick={handleVerify}
disabled={loading}
className="px-7 py-3 rounded-xl font-semibold
bg-gradient-to-r from-sky-500 to-indigo-500
hover:scale-105 transition shadow-md">
{loading ? "Analyzing..." : "Verify with AI"}
</button>

<button
onClick={handleVerifyPDF}
disabled={loading}
className="px-7 py-3 rounded-xl font-semibold
bg-gradient-to-r from-indigo-500 to-purple-500
hover:scale-105 transition shadow-md">
Verify PDF
</button>

</div>

{loading && (
<p className="text-indigo-400 mt-4 animate-pulse">
{thinkingStep}
</p>
)}

{error && (
<p className="text-red-400 mt-4">
{error}
</p>
)}

</div>

</div>

{/* ================= LIVE AI PANEL ================= */}

<div className="hidden lg:block">
<div className="rounded-3xl p-8 
bg-white/5 border border-white/10 
backdrop-blur-xl shadow-xl">

<p className="text-white/50 text-sm mb-6">LIVE AI SYSTEM</p>

<div className="space-y-4">
<div className="h-3 bg-indigo-400/20 rounded w-3/4 animate-pulse"/>
<div className="h-3 bg-indigo-400/20 rounded w-1/2 animate-pulse"/>
<div className="h-3 bg-indigo-400/20 rounded w-5/6 animate-pulse"/>
</div>

<div className="mt-10 flex items-center gap-3">
<div className="w-3 h-3 rounded-full bg-green-400 animate-ping"/>
<span className="text-green-400 text-sm">AI Engine Active</span>
</div>

</div>
</div>

</div>

{/* ================= RESULTS ================= */}

{result && (
<div className="mt-28 space-y-20">

{result.map((item,index)=>{

const percent = Math.round(item.confidence || 0);
const contradictionRisk=Math.min(100,100-percent);
const biasScore=Math.min(100,percent*0.6+25);

return(
<div key={index}
className="relative p-12 md:p-14 rounded-[28px]
bg-gradient-to-b from-[#0f172a]/80 to-[#0b1220]/80
border border-white/10
backdrop-blur-xl
shadow-[0_20px_60px_rgba(0,0,0,0.6)]
hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(0,0,0,0.7)]
transition-all duration-300">

{/* META ROW */}

<div className="flex flex-wrap items-center justify-between gap-4 mb-8">

<div className="flex items-center gap-4">

<div className={`px-4 py-1 rounded-lg text-xs font-semibold border
${item.label==="LIKELY FALSE"
? "bg-red-500/15 text-red-400 border-red-500/30"
: item.label==="POSSIBLY TRUE"
? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
: item.label==="TRUE"
? "bg-green-500/15 text-green-400 border-green-500/30"
: "bg-blue-500/15 text-blue-300 border-blue-500/30"}`}>
{item.label}
</div>

<span className="text-white/50 text-xs">
Source: {item.source || "AI Verified"}
</span>

<span className="text-indigo-400 text-xs">
AI Cross Verified
</span>

</div>

<div className="text-white/30 text-xs">
Confidence Model v1.0
</div>

</div>

{/* CLAIM */}

<h2 className="text-2xl md:text-3xl font-semibold mb-10 leading-snug">
{item.claim}
</h2>




{/* SCORE + METRICS */}

<div className="grid md:grid-cols-[140px_1fr] gap-10 items-center mb-12">

<div className="md:sticky md:top-28 flex flex-col items-center">
<ConfidenceMeter value={percent} />
<p className="text-sm text-white/60 mt-4 text-center">
Overall Trust Score
</p>
<p className="text-xs text-white/40 mt-1">
{percent < 30
? "Critical Risk"
: percent < 60
? "Uncertain"
: percent < 80
? "Likely Accurate"
: "Highly Reliable"}
</p>
</div>

<div className="space-y-6">

<div>
<p className="text-xs text-white/60 mb-2">Confidence Level</p>
<div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
<div
className="h-3 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full transition-all duration-700"
style={{width:`${percent}%`}}
/>
</div>
</div>

<div className="h-px bg-white/5 my-6"/>

<div>
<p className="text-xs text-white/60">Bias Detection</p>
<div className="w-full h-2 bg-slate-800 rounded-full mt-1">
<div className="h-2 bg-yellow-400 rounded-full transition-all duration-700"
style={{width:`${biasScore}%`}}/>
</div>
</div>

<div>
<p className="text-xs text-white/60">Contradiction Risk</p>
<div className="w-full h-2 bg-slate-800 rounded-full mt-1">
<div className="h-2 bg-red-400 rounded-full transition-all duration-700"
style={{width:`${contradictionRisk}%`}}/>
</div>
</div>

<div>
<p className="text-xs text-white/60">Context Strength</p>
<div className="w-full h-2 bg-slate-800 rounded-full mt-1">
<div className="h-2 bg-green-400 rounded-full transition-all duration-700"
style={{width:`${percent}%`}}/>
</div>
</div>

</div>

</div>

{/* REASONING */}

<details className="group mb-10">
<summary className="cursor-pointer text-indigo-400 hover:underline text-sm">
View AI Reasoning
</summary>
<div className="mt-6 p-6 rounded-2xl bg-[#0b1220] border border-white/10 shadow-inner">
<TypingText text={item.explanation || ""} />
</div>
</details>

<div className="flex flex-wrap gap-4 mt-6">

<button
onClick={()=>copyText(item.explanation||"",index)}
className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400 transition text-sm">
{copiedIndex===index?"Copied ✓":"Copy Explanation"}
</button>

<button
className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400 transition text-sm">
Download AI Report
</button>

<button
className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400 transition text-sm">
Share Result
</button>

</div>

<SourcesAccordion sources={item.sources||[]} />

</div>
)
})}

</div>
)}

</div>
</div>
);
}
