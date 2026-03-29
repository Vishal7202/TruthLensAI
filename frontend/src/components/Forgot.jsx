import { useNavigate } from "react-router-dom";

export default function Forgot(){

  const navigate=useNavigate();

  return(
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">

      <div className="text-center">
        <h1 className="text-3xl mb-4">Forgot Password</h1>
        <p className="mb-6">Feature coming soon</p>

        <button
          onClick={()=>navigate("/login")}
          className="px-6 py-3 bg-sky-500 rounded-full">
          Back to Login
        </button>
      </div>

    </div>
  );
}
