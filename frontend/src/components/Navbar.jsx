import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, clearAuth, isLoggedIn } from "../utils/auth";

export default function Navbar(){

const [mobileOpen,setMobileOpen]=useState(false);
const [profileOpen,setProfileOpen]=useState(false);
const [user,setUser]=useState(getUser());
const [active,setActive]=useState("home");

const navigate=useNavigate();
const location=useLocation();
const profileRef=useRef();

const isLanding = location.pathname === "/";

/* ✅ sync user properly */
useEffect(()=>{
const sync=()=>setUser(getUser());
window.addEventListener("storage",sync);
window.addEventListener("focus",sync);
return()=>{
window.removeEventListener("storage",sync);
window.removeEventListener("focus",sync);
};
},[]);

/* close menus */
useEffect(()=>{
setMobileOpen(false);
setProfileOpen(false);
},[location.pathname]);

/* outside click */
useEffect(()=>{
const close=e=>{
if(profileRef.current && !profileRef.current.contains(e.target)){
setProfileOpen(false);
}};
document.addEventListener("mousedown",close);
return()=>document.removeEventListener("mousedown",close);
},[]);

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
},300);
}else{
document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
}
};

/* styles */
const link=id=>`
px-4 py-2 rounded-lg text-sm font-medium transition
${active===id
? "bg-cyan-500/20 text-cyan-300"
: "text-gray-300 hover:text-white hover:bg-white/10"}
`;

return(

<nav className="fixed top-0 left-0 w-full z-[999] bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">

<div className="max-w-7xl mx-auto px-4">

<div className="flex h-20 items-center justify-between">

{/* LOGO */}
<div onClick={()=> isLanding ? goTo("home") : navigate("/")}
className="flex items-center gap-3 cursor-pointer">

<img src="/logo.png" className="h-12"/>
<span className="text-xl text-cyan-300 font-semibold">
TruthLens AI
</span>

</div>

{/* DESKTOP */}
<div className="hidden md:flex items-center gap-2">

{isLanding && (
<>
<button onClick={()=>goTo("home")} className={link("home")}>Home</button>
<button onClick={()=>goTo("features")} className={link("features")}>Features</button>
<button onClick={()=>goTo("how")} className={link("how")}>How</button>
<button onClick={()=>goTo("contact")} className={link("contact")}>Contact</button>
</>
)}

{/* AUTH */}
{!isLoggedIn()?(
<button
onClick={()=>navigate("/login")}
className="ml-4 bg-indigo-500 px-5 py-2 rounded-xl">
Login
</button>
):(

<div ref={profileRef} className="relative ml-4">

<button onClick={()=>setProfileOpen(!profileOpen)}
className="flex items-center gap-2">

<img
src={user?.avatar || "https://i.pravatar.cc/40"}
className="w-10 h-10 rounded-full"/>

<span className="hidden lg:block text-sm">
{user?.name || "User"}
</span>

</button>

{profileOpen&&(
<div className="absolute right-0 mt-3 w-52 bg-[#020617]
border border-white/10 shadow-xl rounded-xl p-2">

<p className="px-4 py-2 text-sm text-gray-400">
{user?.email}
</p>

<button onClick={()=>navigate("/dashboard")}
className="w-full text-left px-4 py-2 hover:bg-white/10">
Dashboard
</button>

<button onClick={handleLogout}
className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20">
Logout
</button>

</div>
)}

</div>
)}

</div>

{/* MOBILE */}
<button
onClick={()=>setMobileOpen(!mobileOpen)}
className="md:hidden text-xl">
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
<button onClick={()=>goTo("how")} className={link("how")}>How</button>
<button onClick={()=>goTo("contact")} className={link("contact")}>Contact</button>
</>
)}

{!isLoggedIn()?(
<button onClick={()=>navigate("/login")}
className="bg-indigo-500 px-4 py-2 rounded">
Login
</button>
):(
<button onClick={handleLogout}
className="bg-red-500 px-4 py-2 rounded">
Logout
</button>
)}

</div>
)}

</div>
</nav>
);
}