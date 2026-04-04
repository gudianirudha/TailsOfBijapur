import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ================= STRICT API URL =================
  // Relies entirely on your .env files or Vercel Environment Variables
  const API_URL = import.meta.env.VITE_API_URL;

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Invalid credentials.");
        setLoading(false);
        return;
      }

      // Success: Store token and route to dashboard
      localStorage.setItem("adminToken", data.token);
      navigate("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server connection failed. System offline.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#050505] text-[#F5F5F5] min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Login Card */}
      <div className="bg-[#111] border border-white/10 p-10 md:p-14 rounded-[3rem] w-full max-w-lg relative z-10 shadow-2xl">
        
        <div className="text-center mb-10">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-xs mb-4 flex items-center justify-center gap-2">
            <Lock size={14} /> Restricted Access
          </span>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
            SYSTEM <span className="text-transparent stroke-text italic">LOGIN.</span>
          </h2>
          <p className="text-gray-500 text-sm font-mono tracking-widest uppercase mt-4">
            Tails of Bijapur • Command Center
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Authorized Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium"
                placeholder="admin@tailsofbijapur.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Passcode
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message UI */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-red-400 text-sm font-medium leading-snug">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
          >
            {loading ? "Authenticating..." : "Initialize Session"} 
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

      </div>

      {/* Global CSS for Stroke */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 2px rgba(255,255,255,0.8);
          color: transparent;
        }
      `}} />
    </div>
  );
}