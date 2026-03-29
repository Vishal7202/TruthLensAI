import { useEffect, useState } from "react";

export default function ContactMessages(){

const [data,setData]=useState([]);
const [filtered,setFiltered]=useState([]);
const [loading,setLoading]=useState(true);
const [query,setQuery]=useState("");
const [toast,setToast]=useState("");
const [readMap,setReadMap]=useState({});   // read/unread state

const token=localStorage.getItem("token");


// ===== FETCH =====
const fetchMessages=()=>{
fetch("http://127.0.0.1:8000/contact-messages",{
headers:{ Authorization:`Bearer ${token}` }
})
.then(res=>res.json())
.then(d=>{
setData(d);
setFiltered(d);
setLoading(false);
});
};

useEffect(()=>{
fetchMessages();
const interval=setInterval(fetchMessages,20000);
return ()=>clearInterval(interval);
},[]);


// ===== SEARCH =====
useEffect(()=>{
const q=query.toLowerCase();
setFiltered(
data.filter(m=>
m.name.toLowerCase().includes(q) ||
m.email.toLowerCase().includes(q) ||
m.message.toLowerCase().includes(q)
)
);
},[query,data]);


// ===== DELETE =====
const deleteMsg=id=>{
if(!window.confirm("Delete this message?")) return;

fetch(`http://127.0.0.1:8000/contact-messages/${id}`,{
method:"DELETE",
headers:{ Authorization:`Bearer ${token}` }
})
.then(()=>{
fetchMessages();
setToast("Message deleted");
setTimeout(()=>setToast(""),2000);
});
};


// ===== MARK READ =====
const toggleRead=id=>{
setReadMap(prev=>({
...prev,
[id]:!prev[id]
}));
};


// ===== REPLY EMAIL =====
const replyMail=(email,message)=>{
const subject=encodeURIComponent("Reply from TruthLens");
const body=encodeURIComponent(`Regarding your message:\n\n"${message}"\n\n`);
window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`);
};


// ===== EXPORT CSV =====
const exportCSV=()=>{
const rows=[
["Name","Email","Message","Time"],
...filtered.map(m=>[m.name,m.email,m.message,m.time])
];

const csv=rows.map(r=>r.join(",")).join("\n");

const blob=new Blob([csv],{type:"text/csv"});
const url=URL.createObjectURL(blob);

const a=document.createElement("a");
a.href=url;
a.download="contact_messages.csv";
a.click();
};


// ===== PAGINATION =====
const [page,setPage]=useState(1);
const perPage=6;
const totalPages=Math.ceil(filtered.length/perPage);

const paginated=filtered.slice(
(page-1)*perPage,
page*perPage
);

// unread count
const unreadCount = filtered.filter(m=>!readMap[m.id]).length;


return(

<div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0b1225] text-white p-8">

{/* TOAST */}
{toast && (
<div className="fixed top-6 right-6 bg-green-500 text-black px-5 py-3 rounded-xl shadow-xl z-50">
{toast}
</div>
)}

{/* HEADER */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

<h1 className="text-3xl md:text-4xl font-semibold
bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
Contact Messages ({filtered.length})
</h1>

<div className="flex gap-3 flex-wrap">

<div className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold">
Unread: {unreadCount}
</div>

<input
placeholder="Search..."
value={query}
onChange={e=>{setQuery(e.target.value);setPage(1);}}
className="px-4 py-2 rounded-lg bg-black/40 border border-white/10"
/>

<button
onClick={exportCSV}
className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 font-semibold">
Export CSV
</button>

</div>

</div>

{/* CARD */}
<div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">

{loading ? (

<div className="text-center py-16 text-slate-300">
Loading messages...
</div>

) : paginated.length===0 ? (

<div className="text-center py-16 text-slate-400">
No messages found
</div>

) : (

<div className="overflow-x-auto">

<table className="w-full">

<thead>
<tr className="border-b border-white/10 text-slate-300 text-sm">
<th className="p-3 text-left">Name</th>
<th className="p-3 text-left">Email</th>
<th className="p-3 text-left">Message</th>
<th className="p-3 text-left">Time</th>
<th className="p-3"></th>
</tr>
</thead>

<tbody>

{paginated.map(m=>{

const read = readMap[m.id];

return(
<tr key={m.id}
className={`border-b border-white/5 transition
${read ? "opacity-60" : "bg-white/[0.03]"}
hover:bg-white/[0.05]`}>

<td className="p-3 font-medium">{m.name}</td>

<td className="p-3 text-sky-300">{m.email}</td>

<td className="p-3 max-w-[380px] whitespace-pre-wrap">
{m.message}
</td>

<td className="p-3 text-sm text-slate-400 whitespace-nowrap">
{m.time}
</td>

<td className="p-3 text-right flex gap-2 justify-end flex-wrap">

<button
onClick={()=>toggleRead(m.id)}
className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
{read ? "Unread" : "Read"}
</button>

<button
onClick={()=>replyMail(m.email,m.message)}
className="px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-black font-semibold">
Reply
</button>

<button
onClick={()=>deleteMsg(m.id)}
className="px-3 py-1 rounded bg-red-500 hover:bg-red-400 text-black font-semibold">
Delete
</button>

</td>

</tr>
);
})}

</tbody>

</table>

{/* PAGINATION */}
<div className="flex justify-center mt-6 gap-2">

<button
disabled={page===1}
onClick={()=>setPage(page-1)}
className="px-3 py-1 bg-white/10 rounded disabled:opacity-40">
Prev
</button>

<span className="px-3 py-1">
Page {page} / {totalPages||1}
</span>

<button
disabled={page===totalPages||totalPages===0}
onClick={()=>setPage(page+1)}
className="px-3 py-1 bg-white/10 rounded disabled:opacity-40">
Next
</button>

</div>

</div>

)}

</div>

</div>

);
}