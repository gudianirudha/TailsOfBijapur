import React from "react";
import { Camera, ShieldCheck, Syringe, Crosshair, FileText, ArrowUpRight, HeartPulse } from "lucide-react";

// ================= MOCK & REAL DATA =================
const successStories = [
  {
    id: "CASE-001",
    name: "The Brave Soul",
    status: "Fostered & Healed",
    statusColor: "text-green-500",
    intel: "Met with a severe street accident. The rapid response team coordinated emergency transport, veterinary treatment, and comprehensive follow-up care.",
    outcome: "Fostered by @swati_vikram99. Completely transformed from a scared, injured animal to one glowing with strength and happiness.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop", // Fallback image
    colSpan: "md:col-span-2", 
  },
  {
    id: "CASE-002",
    name: "Golgumbaz Rescue",
    status: "End of Watch",
    statusColor: "text-red-500",
    intel: "Brutally attacked with heavy stones. Rushed to the government hospital for emergency trauma care and placed in foster care.",
    outcome: "He fought with all his strength but tragically succumbed to his injuries. A heartbreaking reminder that our street friends need protection, not cruelty. We demand justice.",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1000&auto=format&fit=crop", // Fallback image
    colSpan: "md:col-span-1",
  },
  {
    id: "CASE-003",
    name: "The Mother",
    status: "Recovered & Spayed",
    statusColor: "text-orange-500",
    intel: "Found pregnant and in severe medical distress. Emergency surgery was performed. Tragically, the puppies could not be saved.",
    outcome: "The mother fully recovered, was safely neutered, and is now living comfortably. A testament to why neutering is critical to preventing suffering and saving lives.",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1000&auto=format&fit=crop", // Fallback image
    colSpan: "md:col-span-3", // Takes full width for massive emphasis
  },
  {
    id: "CASE-004",
    name: "The Paralyzed Dogs",
    status: "Specialized Transfer",
    statusColor: "text-blue-500", // Blue badge for transfers/partnerships
    intel: "A senior dog and a puppy were left paralyzed after a tragic accident. They were found surviving on the streets against all odds, enduring immense pain and fear.",
    outcome: "Safely evacuated and transported to the Bark Club NGO in Nagpur. They are now receiving specialized medical treatment, mobility care, and a safe haven.",
    image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1000&auto=format&fit=crop", 
    colSpan: "md:col-span-2", // Double width
  }
];

const vaccinationDrives = [
  {
    zone: "Jala Nagar Sector",
    doses: 120,
    goal: 150,
    date: "12 OCT 2025",
    type: "Anti-Rabies + DHPPi",
  },
  {
    zone: "Ashram Road",
    doses: 85,
    goal: 100,
    date: "05 NOV 2025",
    type: "Anti-Rabies Only",
  },
  {
    zone: "Gol Gumbaz Perimeter",
    doses: 40,
    goal: 200,
    date: "ONGOING",
    type: "Comprehensive 9-in-1",
  }
];

// ================= COMPONENT =================
export default function Impact() {
  return (
    <div className="bg-[#050505] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-24 overflow-x-hidden font-sans">
      
      {/* ================= HERO: DATA DASHBOARD ================= */}
      <section className="pt-48 pb-12 px-4 md:px-12 max-w-[1400px] mx-auto border-b border-white/10">
        <div className="grid lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Verified Impact
            </span>
            <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85]">
              PROOF OF <br />
              <span className="text-transparent stroke-text italic">LIFE.</span>
            </h1>
          </div>
          <div className="bg-[#111] p-8 rounded-3xl border border-white/10 grid grid-cols-2 gap-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full pointer-events-none" />
             <div>
               <p className="text-5xl font-black text-orange-500 mb-1">100+</p>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lives Impacted</p>
             </div>
             <div>
               <p className="text-5xl font-black text-white mb-1">245</p>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vaccines Administered</p>
             </div>
          </div>
        </div>
      </section>

      {/* ================= 1. SUCCESS & MEMORIAL STORIES ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Camera className="text-orange-500" size={36} /> Case Files
          </h2>
          <p className="hidden md:block text-gray-500 text-sm font-mono uppercase tracking-widest">Field Reports</p>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, i) => (
            <div 
              key={i} 
              className={`group relative rounded-[2rem] overflow-hidden bg-[#111] h-[450px] md:h-[500px] ${story.colSpan} border border-white/5 hover:border-white/20 transition-colors cursor-pointer`}
            >
              {/* Background Image */}
              <img 
                src={story.image} 
                alt={story.name}
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-in-out"
              />
              
              {/* Cinematic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent opacity-100 transition-opacity duration-500" />
              
              {/* Card Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-black bg-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {story.id}
                  </span>
                  {/* Color-Coded Status Badge */}
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-[#050505]/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${story.statusColor}`}>
                    <ShieldCheck size={14} /> {story.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4 leading-none">
                    {story.name}
                  </h3>
                  
                  {/* The Intel & Outcome (Expands on hover) */}
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm font-medium leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1">The Incident</span>
                      {story.intel}
                    </p>
                    <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                      <p className="text-white text-sm font-medium leading-relaxed pt-2 border-t border-white/20 mt-2">
                        <span className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1">The Outcome</span>
                        {story.outcome}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 2. OPERATIONS DASHBOARD ================= */}
      <section className="py-24 px-4 md:px-12 bg-white text-black rounded-[3rem] md:rounded-[5rem] mx-4 md:mx-8 mb-24">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
                <Syringe className="text-orange-600" size={36} /> Deployment Logs
              </h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest mt-2 text-sm">Vaccination Operation Tracker</p>
            </div>
            <div className="bg-orange-50 px-6 py-4 rounded-2xl border border-orange-200">
              <p className="text-orange-800 font-bold text-sm flex items-center gap-2">
                <Crosshair size={18} /> Zone Defense Active
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {vaccinationDrives.map((drive, i) => {
              const progress = Math.min(Math.round((drive.doses / drive.goal) * 100), 100);
              
              return (
                <div key={i} className="bg-gray-50 border border-gray-200 p-8 rounded-[2rem] hover:shadow-xl hover:border-orange-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-2xl font-black uppercase tracking-tighter w-2/3 leading-none">{drive.zone}</h4>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono text-right">
                      {drive.date}
                    </span>
                  </div>

                  <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-orange-600 mb-4">
                      {drive.type}
                    </span>
                    
                    {/* Progress Bar UI */}
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-gray-900">{drive.doses} Doses</span>
                      <span className="text-gray-400">Target: {drive.goal}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-orange-600 h-3 rounded-full relative overflow-hidden transition-all duration-1000 ease-out group-hover:bg-black" 
                        style={{ width: `${progress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= 3. PRESS & MEDIA ================= */}
      <section className="py-12 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
            <FileText className="text-orange-500" size={36} /> Press Recon
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <a href="#" className="bg-[#111] p-8 md:p-12 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 hover:bg-[#151515] transition-all group flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-white uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full">News Article</span>
              <ArrowUpRight size={24} className="text-gray-600 group-hover:text-orange-500 transition-colors" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-4 group-hover:text-white text-gray-300 transition-colors">
                Youth-Led NGO Transforms Animal Welfare in Bijapur
              </h3>
              <p className="font-mono text-xs text-orange-500 font-bold uppercase tracking-widest">Deccan Herald • 15 Jan 2026</p>
            </div>
          </a>

          <a href="#" className="bg-[#111] p-8 md:p-12 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 hover:bg-[#151515] transition-all group flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-white uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full">Editorial</span>
              <ArrowUpRight size={24} className="text-gray-600 group-hover:text-orange-500 transition-colors" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-4 group-hover:text-white text-gray-300 transition-colors">
                The Zero-Cage Policy: A New Era for Rescue Operations
              </h3>
              <p className="font-mono text-xs text-orange-500 font-bold uppercase tracking-widest">Karnataka Today • 02 Dec 2025</p>
            </div>
          </a>

        </div>
      </section>

      {/* Global CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 2px rgba(255,255,255,0.8);
          color: transparent;
        }
        @media (max-width: 768px) {
          .stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.8); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}