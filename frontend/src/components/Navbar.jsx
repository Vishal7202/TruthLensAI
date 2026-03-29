import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, clearAuth } from "../utils/auth";

export default function Navbar(){

const [mobileOpen,setMobileOpen]=useState(false);
const [profileOpen,setProfileOpen]=useState(false);
const [user,setUser]=useState(getUser());
const [active,setActive]=useState("home");

const navigate=useNavigate();
const location=useLocation();
const profileRef=useRef();

/* 👉 detect landing or dashboard */
const isLanding = location.pathname === "/";

/* close menus on route change */
useEffect(()=>{
setMobileOpen(false);
setProfileOpen(false);
},[location.pathname]);

/* sync login across tabs */
useEffect(()=>{
const syncUser=()=>setUser(getUser());
window.addEventListener("storage",syncUser);
return()=>window.removeEventListener("storage",syncUser);
},[]);

/* close dropdown outside */
useEffect(()=>{
const close=e=>{
if(profileRef.current && !profileRef.current.contains(e.target)){
setProfileOpen(false);
}};
document.addEventListener("mousedown",close);
return()=>document.removeEventListener("mousedown",close);
},[]);

/* 👉 scroll detection ONLY on landing */
useEffect(()=>{

if(!isLanding) return;

const sections=["home","features","how","contact"];

const onScroll=()=>{
for(let id of sections){
const el=document.getElementById(id);
if(el){
const rect=el.getBoundingClientRect();
if(rect.top<=120 && rect.bottom>=120){
setActive(id);
break;
}
}
}
};


window.addEventListener("scroll",onScroll);
return()=>window.removeEventListener("scroll",onScroll);

},[isLanding]);

/* logout */
const handleLogout=()=>{
clearAuth();
setUser(null);
navigate("/login",{replace:true});
};

/* scroll helper */
const goTo=id=>{
setActive(id);
setMobileOpen(false);

if(!isLanding){
navigate("/");
setTimeout(()=>{
document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
},350);
}else{
document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
}
};

/* link style */
const link=id=>`
px-4 py-2 rounded-lg text-sm font-medium transition
${active===id
? "bg-cyan-500/20 text-cyan-300"
: "text-gray-300 hover:text-white hover:bg-white/10"}
`;

return(

<nav className="fixed top-0 left-0 w-full z-[999] bg-[#020617]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">

<div className="max-w-7xl mx-auto px-4">

<div className="flex h-20 items-center justify-between">

{/* LOGO */}
<div onClick={()=> isLanding ? goTo("home") : navigate("/")}
className="flex items-center gap-3 cursor-pointer group">

<img
src="/logo.png"
alt="TruthLens AI"
className="h-14 w-auto object-contain
drop-shadow-[0_0_18px_rgba(59,130,246,0.7)]
group-hover:scale-105 transition"
/>

<span className="text-2xl font-semibold tracking-wide
bg-gradient-to-r from-cyan-300 to-indigo-400
text-transparent bg-clip-text">
TruthLens AI
</span>

</div>

{/* DESKTOP MENU */}
<div className="hidden md:flex items-center gap-2">

{/* 👉 show landing menu ONLY on landing */}
{isLanding && (
<>
<button onClick={()=>goTo("home")} className={link("home")}>Home</button>
<button onClick={()=>goTo("features")} className={link("features")}>Features</button>
<button onClick={()=>goTo("how")} className={link("how")}>How it Works</button>
<button onClick={()=>goTo("contact")} className={link("contact")}>Contact</button>
</>
)}

{/* LOGIN */}
{!user ? (
<button
onClick={()=>navigate("/login")}
className="ml-4 bg-gradient-to-r from-sky-500 to-indigo-500
hover:scale-105 transition px-6 py-2 rounded-xl
font-semibold shadow-lg shadow-blue-500/30">
Login
</button>
):( 

<div ref={profileRef} className="relative ml-4">

<button onClick={()=>setProfileOpen(!profileOpen)}>
<img
src={user?.avatar || "https://i.pravatar.cc/40"}
alt="profile"
className="w-11 h-11 rounded-full border border-white/30"/>
</button>

{profileOpen&&(
<div className="absolute right-0 mt-3 w-52 bg-[#020617]
border border-white/10 shadow-2xl rounded-xl p-2">

<button onClick={()=>navigate("/dashboard")}
className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10">
Dashboard
</button>

<button onClick={handleLogout}
className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-500/20 text-red-400">
Logout
</button>

</div>
)}

</div>
)}

</div>

{/* MOBILE BTN */}
<button
onClick={()=>setMobileOpen(!mobileOpen)}
className="md:hidden text-white text-2xl">
☰
</button>

</div>

{/* MOBILE MENU */}
{mobileOpen&&(
<div className="md:hidden pb-4 flex flex-col gap-2">

{isLanding && (
<>
<button onClick={()=>goTo("home")} className={link("home")}>Home</button>
<button onClick={()=>goTo("features")} className={link("features")}>Features</button>
<button onClick={()=>goTo("how")} className={link("how")}>How it Works</button>
<button onClick={()=>goTo("contact")} className={link("contact")}>Contact</button>
</>
)}

{!user?(
<button
onClick={()=>{setMobileOpen(false);navigate("/login");}}
className="bg-cyan-500 text-black px-4 py-2 rounded-xl">
Login
</button>
):(
<button
onClick={handleLogout}
className="bg-red-500 text-white px-4 py-2 rounded-xl">
Logout
</button>
)}

</div>
)}

</div>
</nav>
);
}