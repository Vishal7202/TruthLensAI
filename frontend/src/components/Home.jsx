import Navbar from "./Navbar";
import VerifyPanel from "./VerifyPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white">

      <Navbar />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Know What’s True —
            <span className="text-blue-400"> Instantly.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-300">
            TruthLens AI verifies claims using intelligent source analysis,
            credibility scoring, and explainable AI results.
          </p>

          <button className="mt-8 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-900/40">
            Try Verification Now
          </button>
        </div>

        {/* RIGHT PRODUCT PREVIEW */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="h-72 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-gray-300">
            Product Preview
          </div>
        </div>

      </section>

      {/* VERIFY PANEL — MUST BE IMMEDIATE */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <VerifyPanel />
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8">

        {[
          "AI Source Checking",
          "Credibility Score",
          "Explainable Results"
        ].map((title, i) => (
          <div key={i}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:-translate-y-2 hover:border-blue-400/40 transition duration-300 shadow-lg">

            <h3 className="text-xl font-semibold text-blue-300">{title}</h3>

            <p className="mt-4 text-gray-400">
              Advanced AI processing ensures reliable and transparent
              verification results in seconds.
            </p>

          </div>
        ))}

      </section>

    </div>
  );
}
