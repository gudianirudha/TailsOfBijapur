import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, Mail, Key, ArrowRight, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Secure the token and redirect to the Command Center
      localStorage.setItem("adminToken", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#050505] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Aesthetic Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Login Container */}
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="bg-orange-600/10 p-5 rounded-2xl text-orange-500 mb-6 border border-orange-500/20">
            <Lock size={40} />
          </div>
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-xs mb-3 flex items-center gap-2">
            <ShieldAlert size={14} /> Restricted Access
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
            COMMAND <br /><span className="text-gray-600">LOGIN.</span>
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Admin Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium placeholder:text-gray-700" 
                placeholder="commander@tailsofbijapur.com" 
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Security Key</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium placeholder:text-gray-700" 
                placeholder="••••••••••••" 
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold uppercase tracking-widest">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 mt-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50 flex justify-center items-center gap-3 group"
          >
            {loading ? 'Authenticating...' : 'Authorize Access'} 
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-8">
          Unauthorized access is strictly prohibited.
        </p>

      </div>
    </div>
  );
}