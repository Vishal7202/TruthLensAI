import { useEffect, useState } from "react";

export default function History() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH FUNCTION =================
  const fetchHistory = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/history");
      if (!res.ok) throw new Error();

      const data = await res.json();
      setHistory(data || []);

    } catch {
      setHistory([]);
    }

    setLoading(false);
  };

  // ================= AUTO LOAD + AUTO REFRESH =================
  useEffect(() => {

    fetchHistory();

    // listen for verify event (from VerifyPanel)
    const handler = () => fetchHistory();
    window.addEventListener("historyUpdated", handler);

    return () => window.removeEventListener("historyUpdated", handler);

  }, []);

  return (
    <div className="space-y-8">

      <h2 className="text-2xl font-semibold">Verification History</h2>

      <div className="
        p-8 rounded-2xl
        bg-white/5 backdrop-blur-lg
        border border-white/10
        shadow-lg
      ">

        {/* LOADING */}
        {loading && (
          <p className="text-white/70 animate-pulse">
            Loading history...
          </p>
        )}

        {/* EMPTY */}
        {!loading && history.length === 0 && (
          <p className="text-white/70">
            No history yet. Verify something first.
          </p>
        )}

        {/* DATA */}
        <div className="space-y-4">

          {history.map((item, i) => {

            const percent = Math.round((item.confidence || 0) * 100);

            return (
              <div
                key={i}
                className="
                  flex justify-between items-center
                  p-4 rounded-xl
                  bg-black/40 border border-white/10
                  hover:bg-black/50 transition
                "
              >

                <div className="max-w-[75%]">

                  <p className="font-medium break-words">
                    {item.claim}
                  </p>

                  <p className="text-sm text-white/60">
                    Confidence: {percent}%
                  </p>

                  {item.time && (
                    <p className="text-xs text-white/40 mt-1">
                      {new Date(item.time).toLocaleString()}
                    </p>
                  )}

                </div>

                <span className={`
                  px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap
                  ${item.label==="TRUE" && "bg-green-600"}
                  ${item.label==="FALSE" && "bg-red-600"}
                  ${item.label==="UNVERIFIED" && "bg-gray-600"}
                  ${item.label==="MISLEADING" && "bg-yellow-500 text-black"}
                  ${item.label==="PARTIALLY_TRUE" && "bg-blue-600"}
                `}>
                  {item.label}
                </span>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}
