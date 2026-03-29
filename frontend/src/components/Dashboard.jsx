import { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function Dashboard(){

const [loading,setLoading]=useState(true);
const [error,setError]=useState(null);
const [stats,setStats]=useState([]);
const [recent,setRecent]=useState([]);
const [trafficData,setTrafficData]=useState([]);
const [pieData,setPieData]=useState([]);
const [newCount,setNewCount]=useState(0);

const prevTotal=useRef(0);
const COLORS=["#22c55e","#ef4444","#9ca3af"];
const user=JSON.parse(localStorage.getItem("user")||"{}");

/* ===== SOUND ===== */
const playSound=()=>{
try{
const audio=new Audio("/notify.mp3");
audio.volume=0.3;
audio.play();
}catch{}
};

/* ===== COUNTER ANIMATION ===== */
const animateStats=(target)=>{
let start=[0,0,0,0];
let step=0;

const interval=setInterval(()=>{
step++;
const progress=Math.min(step/20,1);

setStats(target.map((s,i)=>({
...s,
value:Math.floor(start[i]+(s.value-start[i])*progress)
})));

if(progress===1) clearInterval(interval);
},25);
};

/* ===== FETCH ===== */
const fetchStats=async()=>{
try{
const token=localStorage.getItem("token");

const res=await fetch("http://127.0.0.1:8000/dashboard/stats",{
headers:{Authorization:`Bearer ${token}`}
});

if(!res.ok) throw new Error();
const data=await res.json();

const target=[
{label:"Total Checks",value:data.total??0,color:"from-sky-500 to-indigo-500"},
{label:"True Claims",value:data.true??0,color:"from-green-500 to-emerald-500"},
{label:"False Claims",value:data.false??0,color:"from-red-500 to-pink-500"},
{label:"Unverified",value:data.unverified??0,color:"from-yellow-400 to-orange-500"},
];

animateStats(target);

setRecent(data.recent||[]);
setTrafficData(data.traffic||[]);
setPieData([
{name:"True",value:data.true??0},
{name:"False",value:data.false??0},
{name:"Unverified",value:data.unverified??0},
]);

if(data.total>prevTotal.current){
setNewCount(data.total-prevTotal.current);
playSound();
}
prevTotal.current=data.total;

setError(null);

}catch{
setError("Could not load dashboard stats");
}
finally{
setLoading(false);
}
};

useEffect(()=>{
fetchStats();
const interval=setInterval(fetchStats,15000);
return()=>clearInterval(interval);
},[]);

if(loading){
return (
<div className="min-h-screen flex items-center justify-center bg-[#070f1f] text-white/60">
Loading dashboard...
</div>
);
}

if(error){
return(
<div className="min-h-screen flex flex-col items-center justify-center bg-[#070f1f] text-white space-y-4">
<p className="text-red-400">{error}</p>
<button onClick={()=>{setLoading(true);fetchStats();}}
className="px-6 py-2 bg-indigo-500 rounded-xl">
Retry
</button>
</div>
);
}

return(
<div className="relative w-full min-h-screen bg-[#070f1f] text-white overflow-hidden">

{/* ===== Ambient Glow ===== */}
<div className="absolute inset-0 -z-10">
<div className="absolute w-[800px] h-[800px] bg-indigo-600/20 blur-[180px] rounded-full top-[-250px] left-[-200px]" />
<div className="absolute w-[700px] h-[700px] bg-purple-600/20 blur-[160px] rounded-full bottom-[-250px] right-[-200px]" />
</div>

<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

<div className="relative z-10 max-w-[1300px] mx-auto px-8 py-10 space-y-10">

{/* ===== TOP BAR ===== */}
<div className="flex justify-between items-center">

<div>
<h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
Welcome {user?.name || "Admin"} 👋
</h1>
<p className="text-white/60 mt-1">Live platform overview</p>
</div>

<div className="relative">
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl backdrop-blur-xl">
🔔
</div>

{newCount>0 && (
<span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">
{newCount}
</span>
)}
</div>

</div>

{/* ===== MINI STATS ===== */}
<div className="flex gap-4 flex-wrap">
{stats.map((s,i)=>(
<div key={i}
className="px-5 py-3 rounded-xl
bg-gradient-to-b from-[#0e1628]/90 to-[#0b1324]/90
border border-white/10
backdrop-blur-xl
shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
{s.label}: <span className="font-bold">{s.value}</span>
</div>
))}
</div>

{/* ===== MAIN STATS ===== */}
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
{stats.map((s,i)=>(
<div key={i}
className="p-6 rounded-2xl
bg-gradient-to-b from-[#0e1628]/90 to-[#0b1324]/90
border border-white/10
backdrop-blur-xl
shadow-[0_20px_60px_rgba(0,0,0,0.6)]
hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]
hover:-translate-y-1
transition-all duration-500">

<div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${s.color}
flex items-center justify-center text-2xl font-bold`}>
{s.value}
</div>

<p className="mt-4 text-white/70">{s.label}</p>

<div className="text-xs mt-1 text-green-400">
▲ {Math.floor(Math.random()*6)+1}% today
</div>

</div>
))}
</div>

{/* ===== CHARTS ===== */}
<div className="grid lg:grid-cols-2 gap-6">

<div className="p-8 rounded-2xl
bg-gradient-to-b from-[#0e1628]/90 to-[#0b1324]/90
border border-white/10
backdrop-blur-xl
shadow-[0_20px_60px_rgba(0,0,0,0.6)]
hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]
transition-all duration-500">

<h3 className="mb-4 text-lg font-semibold text-sky-300">Traffic Overview</h3>

<ResponsiveContainer width="100%" height={260}>
<LineChart data={trafficData}>
<XAxis dataKey="day" stroke="#64748b"/>
<YAxis stroke="#64748b"/>
<Tooltip/>
<Line
type="monotone"
dataKey="checks"
stroke="#60a5fa"
strokeWidth={3}
dot={{ r:4 }}
activeDot={{ r:6 }}
/>
</LineChart>
</ResponsiveContainer>

</div>

<div className="p-8 rounded-2xl
bg-gradient-to-b from-[#0e1628]/90 to-[#0b1324]/90
border border-white/10
backdrop-blur-xl
shadow-[0_20px_60px_rgba(0,0,0,0.6)]
hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]
transition-all duration-500">

<h3 className="mb-4 text-lg font-semibold text-purple-300">Accuracy Ratio</h3>

<ResponsiveContainer width="100%" height={260}>
<PieChart>
<Pie
data={pieData}
dataKey="value"
outerRadius={90}
innerRadius={50}
paddingAngle={3}
>
{pieData.map((_,i)=>(<Cell key={i} fill={COLORS[i]} />))}
</Pie>
<Legend/>
</PieChart>
</ResponsiveContainer>

</div>

</div>

{/* ===== RECENT ===== */}
<div className="p-8 rounded-2xl
bg-gradient-to-b from-[#0e1628]/90 to-[#0b1324]/90
border border-white/10
backdrop-blur-xl
shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

<h3 className="mb-4 text-lg font-semibold text-indigo-300">Recent Verifications</h3>

<div className="space-y-4">
{recent.length===0 && <p className="text-white/50">No recent data</p>}

{recent.map((r,i)=>(
<div key={i}
className="flex justify-between items-center p-4 rounded-xl
bg-black/40 border border-white/10
hover:border-indigo-400/40 transition">

<div>
<p>{r.text}</p>
<p className="text-xs text-white/50">{r.date}</p>
</div>

<span className={`
px-3 py-1 rounded-full text-sm font-medium
${r.label==="TRUE" && "bg-green-600"}
${r.label==="FALSE" && "bg-red-600"}
${r.label==="UNVERIFIED" && "bg-gray-600"}
`}>
{r.label}
</span>

</div>
))}
</div>

</div>

</div>
</div>
);
}