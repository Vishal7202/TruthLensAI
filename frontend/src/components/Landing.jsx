
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import {
  ShieldCheck,
  FileCheck,
  SearchCheck,
  Mail,
  Phone,
  Globe,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing(){

  const [name,setName]=useState("");
const [email,setEmail]=useState("");
const [message,setMessage]=useState("");
const [loading,setLoading]=useState(false);

const sendMessage=async()=>{

if(!name||!email||!message){
alert("Please fill all fields");
return;
}

try{
setLoading(true);

const res=await fetch("http://127.0.0.1:8000/contact",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({name,email,message})
});

const data=await res.json();

if(data.success){
alert("Message sent successfully");
setName("");
setEmail("");
setMessage("");
}else{
alert("Failed to send");
}

}catch(err){
console.error(err);
alert("Server error");
}
finally{
setLoading(false);
}
};

const navigate = useNavigate();

const fadeUp={
hidden:{opacity:0,y:40},
show:{opacity:1,y:0,transition:{duration:0.6}}
};

const stagger={
hidden:{},
show:{transition:{staggerChildren:0.15}}
};

const goTo=id=>{
document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
};

    return(

    <div className="text-white min-h-screen relative overflow-hidden bg-[#020617]">

    <Navbar />



<div className="absolute inset-0 -z-10
bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_35%),
radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_40%)]"/>


{/* ================= HERO ================= */}
<section id="home"
className="max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-24
grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

{/* LEFT TEXT */}
<motion.div variants={fadeUp} initial="hidden" animate="show">

<h1 className="
text-3xl sm:text-4xl md:text-5xl lg:text-6xl
font-bold leading-tight
bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400
text-transparent bg-clip-text">

Verify Truth<br/>Detect Fraud<br/>Build Trust
</h1>

<p className="mt-6 text-base md:text-lg text-slate-300 max-w-xl">
TruthLens AI verifies claims, authenticates documents, and detects fraud 
using advanced machine learning in real-time.
</p>

<div className="mt-8 flex gap-4 flex-wrap">

<button
onClick={()=>navigate("/login")}
className="px-7 py-3 md:px-8 md:py-4 rounded-xl font-semibold
bg-gradient-to-r from-sky-500 to-indigo-500
hover:scale-105 transition shadow-xl shadow-blue-500/30">
Start Free
</button>

<button className="px-7 py-3 md:px-8 md:py-4 rounded-xl border border-white/20
hover:bg-white/10 transition">
Live Demo
</button>

</div>

<div className="mt-10 flex gap-8 flex-wrap text-sm text-slate-300">

<div><p className="text-xl md:text-2xl font-bold text-white">10K+</p><p>Verifications</p></div>
<div><p className="text-xl md:text-2xl font-bold text-white">98%</p><p>Accuracy</p></div>
<div><p className="text-xl md:text-2xl font-bold text-white">500+</p><p>Users</p></div>

</div>

</motion.div>


{/* RIGHT IMAGE — ALWAYS RIGHT */}
<div className="flex justify-center md:justify-end">

<img
src="/hero-ai.png"
className="w-[260px] sm:w-[320px] md:w-[420px] lg:w-[480px] xl:w-[520px]
h-auto object-contain
drop-shadow-[0_0_60px_rgba(59,130,246,0.35)]"
/>

</div>

</section>


{/* ================= 3 FEATURE CARDS ================= */}
<section id="features" className="max-w-6xl mx-auto px-6 pb-24">

<motion.div variants={stagger} initial="hidden" whileInView="show"
viewport={{once:true}}
className="grid md:grid-cols-3 gap-6">

{[
["AI Fact Verification", SearchCheck],
["Document Authentication", FileCheck],
["Fraud Prevention", ShieldCheck]
].map(([t,Icon],i)=>(

<motion.div key={i} variants={fadeUp}
className="text-center py-10 rounded-2xl
border border-white/10 bg-white/[0.04]
hover:bg-white/[0.08] hover:-translate-y-1 transition">

<Icon size={28} className="mx-auto mb-4 text-sky-400"/>
<p className="font-medium">{t}</p>

</motion.div>

))}

</motion.div>
</section>


{/* ================= HOW ================= */}
<section id="how" className="max-w-6xl mx-auto px-6 pb-28 text-center">

<h2 className="text-3xl md:text-4xl font-semibold mb-14">
How TruthLens AI Works
</h2>

<div className="grid md:grid-cols-3 gap-10">

{[
["1","Submit Claim","Paste text or upload PDF"],
["2","AI Analysis","Credibility + sources + context"],
["3","Get Result","Truth score + explanation"]
].map(([num,title,desc],i)=>(

<div key={i}
className="
p-8 md:p-10 rounded-3xl
bg-white/[0.04]
border border-white/10
relative
transition duration-300
hover:bg-white/[0.08]
hover:-translate-y-2
hover:shadow-xl hover:shadow-cyan-500/20
">
<div className="absolute -top-5 left-1/2 -translate-x-1/2
w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500
flex items-center justify-center font-bold">{num}</div>

<h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
<p className="text-slate-400">{desc}</p>

</div>

))}

</div>
</section>
<section className="max-w-7xl mx-auto px-6 pb-24 text-center">

<h2 className="text-3xl md:text-4xl font-semibold mb-16">
AI-Driven Verification for Trust
</h2>

<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

{[
["/card-ai.png","AI Recognition"],
["/card-doc.png","Verify Documents"],
["/card-fraud.png","Fraud Detection"]
].map(([img,title],i)=>(

<div key={i}
className="
p-5 md:p-6
rounded-3xl
bg-gradient-to-b from-white/[0.06] to-white/[0.02]
border border-white/10
hover:border-sky-400/40
hover:shadow-xl hover:shadow-sky-500/10
hover:-translate-y-1
transition duration-300
">

{/* IMAGE FRAME */}
<div className="
bg-[#020617]
rounded-2xl
p-4 md:p-5
flex items-center justify-center
">

<img
src={img}
alt={title}
className="
w-full
max-h-[170px] sm:max-h-[190px] md:max-h-[210px]
object-contain
transition duration-300
hover:scale-105
"
/>

</div>

<h3 className="mt-5 font-semibold text-lg text-white">
{title}
</h3>

</div>

))}

</div>

</section>
{/* ================= CONTACT IMPROVED ================= */}
<section id="contact"
className="max-w-6xl mx-auto px-6 pb-32">

<h2 className="text-3xl md:text-4xl font-semibold text-center mb-14">
Contact Us
</h2>

<div className="grid md:grid-cols-2 gap-12 items-start">

{/* FORM */}
<div className="p-10 rounded-3xl bg-white/[0.04] border border-white/10">

<input
value={name}
onChange={e=>setName(e.target.value)}
placeholder="Your Name"
className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 border border-white/10"/>

<input
value={email}
onChange={e=>setEmail(e.target.value)}
placeholder="Email Address"
className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 border border-white/10"/>

<textarea
value={message}
onChange={e=>setMessage(e.target.value)}
placeholder="Your Message"
className="w-full mb-6 px-4 py-3 rounded-lg bg-black/40 border border-white/10 h-32"/>

<button
onClick={sendMessage}
disabled={loading}
className="px-7 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:scale-105 transition disabled:opacity-50">
{loading?"Sending...":"Send Message"}
</button>

</div>

{/* INFO */}
<div className="space-y-5 text-slate-300">

<h3 className="text-xl font-semibold">Reach us anytime</h3>

<div className="flex items-center gap-3">
<Mail className="text-sky-400"/> support@truthlens.ai
</div>

<div className="flex items-center gap-3">
<Phone className="text-sky-400"/> +91-9876543210
</div>

<div className="flex items-center gap-3">
<Globe className="text-sky-400"/> www.truthlens.ai
</div>

<p className="text-slate-400 text-sm pt-4">
We usually respond within 24 hours.
</p>

</div>

</div>

</section>

{/* ================= PREMIUM FULL FOOTER ================= */}


<footer
  className="relative text-white mt-20 overflow-hidden"
  style={{
    backgroundImage: "url('/footer-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}
>

{/* DARK OVERLAY */}
<div className="absolute inset-0 bg-gradient-to-b
from-[#020617]/40
via-[#020617]/70
to-[#020617]/90" />

{/* GLOW EFFECT */}
<div className="absolute bottom-0 left-1/2 -translate-x-1/2
w-[900px] h-[260px]
bg-[radial-gradient(circle,rgba(56,189,248,0.35),transparent_70%)]
blur-3xl opacity-80" />

<div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-16">

{/* ===== GRID ===== */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12
text-center sm:text-left">

{/* ===== BRAND ===== */}
<div>

<div className="flex items-center gap-3 justify-center sm:justify-start mb-4">
<img src="/logo.png" className="h-10" />
<span className="text-2xl font-semibold">TruthLens AI</span>
</div>

<p className="text-slate-300 leading-relaxed">
AI powered verification & fraud detection platform.
Secure documents, detect manipulation, and build digital trust.
</p>

<p className="mt-4 text-cyan-400 font-medium">
Trusted. Secure. Intelligent.
</p>

</div>


{/* ===== PRODUCT ===== */}
<div>
<p className="text-cyan-300 font-semibold mb-5">Product</p>

<ul className="space-y-3 text-slate-300">

<li className="hover:text-cyan-300 cursor-pointer transition"
onClick={()=>navigate("/dashboard")}>Dashboard</li>

<li className="hover:text-cyan-300 cursor-pointer transition"
onClick={()=>navigate("/verify")}>Verify Document</li>

<li className="hover:text-cyan-300 cursor-pointer transition"
onClick={()=>navigate("/fraud")}>Fraud Detection</li>

<li className="hover:text-cyan-300 cursor-pointer transition"
onClick={()=>navigate("/api")}>API Access</li>

</ul>
</div>


{/* ===== COMPANY ===== */}
<div>
<p className="text-cyan-300 font-semibold mb-5">Company</p>

<ul className="space-y-3 text-slate-300">

<li className="hover:text-cyan-300 cursor-pointer transition"
onClick={()=>goTo("about")}>About</li>

<li className="hover:text-cyan-300 cursor-pointer transition"
onClick={()=>goTo("how")}>How It Works</li>

<li>
  <Link to="/privacy" className="hover:text-cyan-300">
    Privacy Policy
  </Link>
</li>

<li>
  <Link to="/terms" className="hover:text-cyan-300">
    Terms & Conditions
  </Link>
</li>

</ul>
</div>


{/* ===== CONTACT ===== */}
<div>

<p className="text-cyan-300 font-semibold mb-5">Contact</p>

<p className="text-slate-300 mb-4">Download our app</p>

<div className="flex gap-3 justify-center sm:justify-start mb-6">

<img src="/appstore.png" className="h-11 hover:scale-105 transition cursor-pointer"/>
<img src="/googleplay.png" className="h-11 hover:scale-105 transition cursor-pointer"/>

</div>

<p className="text-slate-300 mb-5">support@truthlens.ai</p>

<div className="flex gap-3 justify-center sm:justify-start">

<div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
<Facebook size={18}/>
</div>

<div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
<Twitter size={18}/>
</div>

<div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
<Linkedin size={18}/>
</div>

<div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
<Mail size={18}/>
</div>

</div>

</div>

</div>


{/* ===== COPYRIGHT ===== */}
<div className="border-t border-white/10 mt-14 pt-8 text-center text-slate-400 text-sm">
© {new Date().getFullYear()} TruthLens AI — All rights reserved.
</div>

</div>

</footer>
</div>
);
}