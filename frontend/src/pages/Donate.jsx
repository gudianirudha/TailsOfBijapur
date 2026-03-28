import React, { useState } from "react";
import { Heart, ShieldCheck, ArrowRight, QrCode, Lock, Zap, Coffee, Home, ChevronRight } from "lucide-react";

export default function Donate() {
  // ================= STATE =================
  const [donationType, setDonationType] = useState("oneTime"); // 'oneTime' or 'recurring'
  const [amount, setAmount] = useState("Rs. 1000");
  const [customAmount, setCustomAmount] = useState("");

  const oneTimeOptions = ["Rs. 250", "Rs. 500", "Rs. 1000", "Rs. 2500", "Other"];
  const recurringOptions = ["Rs. 100/mo", "Rs. 250/mo", "Rs. 500/mo", "Rs. 1000/mo", "Other"];

  const currentOptions = donationType === "oneTime" ? oneTimeOptions : recurringOptions;

  // Handler for option clicks
  const handleAmountClick = (opt) => {
    setAmount(opt);
    if (opt !== "Other") setCustomAmount("");
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-24 overflow-x-hidden font-sans">
      
      {/* ================= HERO SECTION ================= */}
      <section className="pt-40 pb-12 px-4 md:px-12 max-w-[1400px] mx-auto text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping" /> Fund The Mission
          </span>
          <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-8">
            YOUR KINDNESS <br />
            <span className="text-transparent stroke-text italic">SAVES LIVES.</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Your generous donation fuels our on-ground operations. We transform your financial support directly into food, shelter, and critical medical care.
          </p>
        </div>
      </section>

      {/* ================= MAIN DONATION TERMINAL ================= */}
      <section className="py-12 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: The "Why" / Trust Signals */}
          <div className="lg:col-span-5 bg-[#111] border border-white/5 rounded-[3rem] p-10 md:p-14 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
            
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 relative z-10">
              WHERE DOES <br /> <span className="text-orange-600">IT GO?</span>
            </h2>
            
            <div className="space-y-8 relative z-10">
              <div className="flex gap-4 items-start">
                <div className="bg-white/5 p-3 rounded-xl text-orange-500 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">100% Transparency</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Every rupee is accounted for and injected directly into animal welfare, medical bills, and sanctuary upkeep.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-white/5 p-3 rounded-xl text-orange-500 shrink-0">
                  <Heart size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Immediate Impact</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Emergency trauma care is expensive. Your funds allow us to authorize life-saving surgeries without hesitation.</p>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/10 relative z-10 flex items-center gap-4 text-gray-400">
               <Lock size={18} className="text-green-500" />
               <span className="text-xs font-bold uppercase tracking-widest">256-Bit Secure Encrypted Transfer</span>
            </div>
          </div>

          {/* Right: The Interactive Form */}
          <div className="lg:col-span-7 bg-[#151515] border border-white/10 rounded-[3rem] p-8 md:p-14 shadow-2xl relative">
            
            {/* Toggle Switch */}
            <div className="flex bg-[#0A0A0A] p-2 rounded-2xl border border-white/5 mb-10 relative">
              <button 
                onClick={() => { setDonationType("oneTime"); setAmount("Rs. 1000"); }}
                className={`flex-1 py-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all z-10 ${donationType === "oneTime" ? "text-black bg-white" : "text-gray-500 hover:text-white"}`}
              >
                One-Time
              </button>
              <button 
                onClick={() => { setDonationType("recurring"); setAmount("Rs. 500/mo"); }}
                className={`flex-1 py-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all z-10 ${donationType === "recurring" ? "text-black bg-white" : "text-gray-500 hover:text-white"}`}
              >
                Monthly
              </button>
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Select Contribution Amount</h3>
            
            {/* Amount Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {currentOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAmountClick(opt)}
                  className={`py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-2 ${
                    amount === opt
                      ? "bg-orange-600 border-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                      : "bg-[#0A0A0A] border-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Custom Amount Input (Conditionally Rendered) */}
            {amount === "Other" && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Enter Custom Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-gray-500">₹</span>
                  <input 
                    type="number" 
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-[#0A0A0A] border-2 border-orange-500/50 rounded-2xl py-5 pl-12 pr-6 text-2xl font-black text-white focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="5000"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Proceed Button */}
            <button className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-3 group">
              Initialize Transfer <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>

            {/* UPI / QR Option (Terminal Style) */}
            <div className="mt-10 p-6 bg-[#0A0A0A] border border-dashed border-white/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-orange-500/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-white/5 p-4 rounded-xl text-gray-400 group-hover:text-orange-500 transition-colors">
                  <QrCode size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-widest text-sm mb-1">Direct UPI / QR</h4>
                  <p className="text-gray-500 text-xs font-mono uppercase">System awaiting payment gateway integration.</p>
                </div>
              </div>
              <button className="px-6 py-3 border border-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors shrink-0">
                Show QR
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SPONSORSHIP CAUSES (BENTO GRID) ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10 mt-12">
        <div className="text-center mb-16">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 block">/ Targeted Impact</span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
            SPONSOR A <span className="text-white/20">CAUSE.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sponsor Card 1 */}
          <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-colors group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Heart size={28} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Sponsor a Pet</p>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Forever Home</h3>
            <p className="text-gray-400 font-medium leading-relaxed mb-10 flex-grow">
              Provide comprehensive food, shelter, and medical care for an animal until they are successfully matched with their forever family.
            </p>
            <button className="w-full py-4 border border-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors flex justify-between items-center px-6">
              Sponsor <ChevronRight size={16} />
            </button>
          </div>

          {/* Sponsor Card 2 */}
          <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-colors group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Coffee size={28} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Sponsor a Meal</p>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Combat Hunger</h3>
            <p className="text-gray-400 font-medium leading-relaxed mb-10 flex-grow">
              Directly fund our daily feeding drives. Help provide highly nutritious, consistent meals to keep street animals healthy.
            </p>
            <button className="w-full py-4 border border-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors flex justify-between items-center px-6">
              Sponsor <ChevronRight size={16} />
            </button>
          </div>

          {/* Sponsor Card 3 */}
          <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-colors group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Home size={28} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Sponsor a Shelter</p>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Safe Haven</h3>
            <p className="text-gray-400 font-medium leading-relaxed mb-10 flex-grow">
              Help us maintain, clean, and upgrade our sanctuary facilities to ensure every rescued animal has a safe place to heal.
            </p>
            <button className="w-full py-4 border border-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors flex justify-between items-center px-6">
              Sponsor <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* Global CSS for Stroke */}
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