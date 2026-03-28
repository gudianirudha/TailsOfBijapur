import React, { useState } from "react";
import { ArrowRight, HeartPulse, ShieldAlert, Activity, CheckCircle2, AlertCircle } from "lucide-react";

export default function Volunteer() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student", // Added default to match select options
    time: "weekends", // Added default to match select options
    why: "",
  });
  
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("submitting");
    
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setStatus("success");
        setMsg("Application secured. Welcome to the Vanguard.");
        setForm({ name: "", email: "", phone: "", role: "student", time: "weekends", why: "" });
      } else {
        setStatus("error");
        setMsg("Transmission failed. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-24">
      
      {/* ================= HERO SECTION ================= */}
      <section className="pt-40 pb-16 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="max-w-5xl">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 block flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping" /> Join The Vanguard
          </span>
          <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-8">
            BE THE REASON <br />
            <span className="text-transparent stroke-text italic">THEY SURVIVE.</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl">
          Every injured or abandoned animal is just waiting for someone to care enough to stop. Don't just feel sorry for them. Be the one who stops. Join us on the ground and help save a life today          </p>
        </div>
      </section>

      {/* ================= SPLIT CONTENT & FORM ================= */}
      <section className="py-12 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mt-12">
          
          {/* LEFT: The Manifesto */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
                ON THE <span className="text-orange-600">FRONT LINES.</span>
              </h2>
              <div className="h-1 w-20 bg-orange-600 mb-8" />
              <p className="text-gray-400 leading-relaxed text-lg mb-6 text-justify">
                Volunteering with Tails of Bijapur means being present when it
                truly matters. You don&apos;t need to be a professional rescuer to make a difference. We need compassionate individuals, coordinators, fosters, and extra hands.
              </p>
              <p className="text-gray-400 leading-relaxed text-lg text-justify italic border-l-2 border-white/20 pl-4">
                If you believe compassion should be acted upon, not just felt, we&apos;d love to have you walk this journey with us.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <ShieldAlert className="text-orange-500" />, title: "Emergency Ops", text: "On-spot rescue and trauma assistance." },
                { icon: <HeartPulse className="text-orange-500" />, title: "Recovery", text: "Fostering and post-op medical care." },
                { icon: <Activity className="text-orange-500" />, title: "Logistics", text: "Transporting animals and supplies." }
              ].map((item, i) => (
                <div key={i} className="bg-[#151515] p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors">
                  <div className="mb-4">{item.icon}</div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Aesthetic Image */}
            <div className="w-full rounded-[2rem] overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700 h-[300px]">
               <img src="/images/volu.jpg" alt="Volunteer Action" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none' }} />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </div>
          </div>

          {/* RIGHT: The Recruitment Form */}
          <div className="lg:col-span-7 relative">
            {/* Background Glow */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
            
            <form onSubmit={submit} className="bg-[#111] border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl relative z-10">
              
              <div className="mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Application</h3>
                <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">Secure Your Place on the Team</p>
              </div>

              <div className="space-y-6">
                
                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                    <input 
                      required 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" 
                      placeholder="Jane Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                    <input 
                      required
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" 
                      placeholder="+91" 
                    />
                  </div>
                </div>

                {/* Email (Full Width) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                  <input 
                    required 
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" 
                    placeholder="jane@example.com" 
                  />
                </div>

                {/* Logistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Occupation</label>
                    <select 
                      value={form.role} 
                      onChange={(e) => setForm({ ...form, role: e.target.value })} 
                      className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                    >
                      <option value="student">Student</option>
                      <option value="professional">Working Professional</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Time Commitment</label>
                    <select 
                      value={form.time} 
                      onChange={(e) => setForm({ ...form, time: e.target.value })} 
                      className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                    >
                      <option value="weekends">Weekends Only</option>
                      <option value="evenings">2-4 hours per week</option>
                      <option value="flexible">5-8 hours per week</option>
                      <option value="full">8+ hours per week</option>
                    </select>
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Why do you want to join?</label>
                  <textarea 
                    rows="4" 
                    required
                    value={form.why} 
                    onChange={(e) => setForm({ ...form, why: e.target.value })} 
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" 
                    placeholder="Tell us a bit about your motivation..." 
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={status === "submitting"}
                  className="w-full py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50 flex justify-center items-center gap-2 group"
                >
                  {status === "submitting" ? 'Transmitting...' : 'Submit Application'} 
                  {status !== "submitting" && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
                </button>

                {/* Status Messages */}
                {msg && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm uppercase tracking-widest ${status === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                    {status === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {msg}
                  </div>
                )}

                <p className="text-xs text-center text-gray-600 uppercase tracking-widest">
                  Secure Channel. Details used strictly for deployment.
                </p>
              </div>
            </form>

          </div>
        </div>
      </section>

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 2px rgba(255,255,255,0.8);
          color: transparent;
        }
        @media (max-width: 768px) {
          .stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.8); }
        }
      `}} />
    </div>
  );
}