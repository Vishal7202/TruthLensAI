import { useEffect, useState } from "react";

export default function Settings() {

  // ================= STATE =================
  const [email, setEmail] = useState("vk641933@gmail.com");

  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("English");
  const [depth, setDepth] = useState("Balanced");
  const [explain, setExplain] = useState("Detailed");

  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  // ================= LOAD SAVED =================
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("truthlens_settings"));
    if (s) {
      setDarkMode(s.darkMode);
      setLanguage(s.language);
      setDepth(s.depth);
      setExplain(s.explain);
    }
  }, []);

  // ================= APPLY DARK MODE =================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // ================= SAVE =================
  function saveSettings() {

    const data = { darkMode, language, depth, explain };

    localStorage.setItem("truthlens_settings", JSON.stringify(data));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ================= LOGOUT =================
  function logout() {

    localStorage.removeItem("truthlens_settings");
    localStorage.removeItem("auth");

    window.location.href = "/login";
  }

  return (
    <div className="max-w-4xl">

      <h2 className="text-3xl font-semibold mb-8
        bg-gradient-to-r from-sky-400 to-indigo-400
        text-transparent bg-clip-text">
        Settings
      </h2>

      {/* ACCOUNT */}
      <div className="p-8 mb-10 rounded-2xl
        bg-gradient-to-br from-slate-900/80 to-slate-800/60
        backdrop-blur-xl border border-slate-700/50">

        <p className="text-sm text-slate-400 mb-1">Email</p>
        <p className="text-lg mb-4">{email}</p>

        <button
          onClick={()=>setShowPassword(true)}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700">
          Change Password
        </button>
      </div>

      {/* PREFERENCES */}
      <div className="p-8 mb-10 rounded-2xl
        bg-gradient-to-br from-slate-900/80 to-slate-800/60
        backdrop-blur-xl border border-slate-700/50 space-y-6">

        <h3 className="text-xl font-semibold">Preferences</h3>

        {/* DARK MODE */}
        <div className="flex justify-between items-center">
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={()=>setDarkMode(!darkMode)}
            className="w-6 h-6"
          />
        </div>

        {/* LANGUAGE */}
        <div className="flex justify-between items-center">
          <span>Language</span>
          <select
            value={language}
            onChange={(e)=>setLanguage(e.target.value)}
            className="bg-black border border-slate-600 px-3 py-2 rounded-lg"
          >
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>

      </div>

      {/* AI SETTINGS */}
      <div className="p-8 rounded-2xl
        bg-gradient-to-br from-slate-900/80 to-slate-800/60
        backdrop-blur-xl border border-slate-700/50 space-y-6">

        <h3 className="text-xl font-semibold">AI Settings</h3>

        <div className="flex justify-between items-center">
          <span>Verification Depth</span>
          <select
            value={depth}
            onChange={(e)=>setDepth(e.target.value)}
            className="bg-black border border-slate-600 px-3 py-2 rounded-lg"
          >
            <option>Fast</option>
            <option>Balanced</option>
            <option>Deep</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <span>Explainability Level</span>
          <select
            value={explain}
            onChange={(e)=>setExplain(e.target.value)}
            className="bg-black border border-slate-600 px-3 py-2 rounded-lg"
          >
            <option>Simple</option>
            <option>Detailed</option>
            <option>Technical</option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-6">

          <button
            onClick={logout}
            className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700">
            Logout
          </button>

          <button
            onClick={saveSettings}
            className="px-8 py-3 rounded-full
            bg-gradient-to-r from-sky-500 to-indigo-500">
            Save Changes
          </button>

        </div>

        {saved && (
          <p className="text-green-400 mt-4">Settings saved successfully</p>
        )}

      </div>

      {/* PASSWORD MODAL */}
      {showPassword && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-slate-900 p-8 rounded-2xl w-[400px] space-y-4">

            <h3 className="text-xl font-semibold">Change Password</h3>

            <input placeholder="Current Password"
              type="password"
              className="w-full p-3 rounded-lg bg-black border border-slate-700"/>

            <input placeholder="New Password"
              type="password"
              className="w-full p-3 rounded-lg bg-black border border-slate-700"/>

            <input placeholder="Confirm Password"
              type="password"
              className="w-full p-3 rounded-lg bg-black border border-slate-700"/>

            <div className="flex justify-end gap-3 pt-4">

              <button
                onClick={()=>setShowPassword(false)}
                className="px-5 py-2 bg-gray-600 rounded-lg">
                Cancel
              </button>

              <button
                onClick={()=>setShowPassword(false)}
                className="px-5 py-2 bg-blue-600 rounded-lg">
                Update
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
