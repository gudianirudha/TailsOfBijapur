import React, { useRef, useState, useEffect } from "react";
import { Camera, ShieldCheck, Syringe, Crosshair, FileText, ArrowUpRight, HeartPulse } from "lucide-react";
import { useTextLayout } from "../hooks/useTextLayout"; // <-- IMPORT YOUR NEW HOOK

// ================= MOCK & REAL DATA =================
// (Keep all your existing successStories, vaccinationDrives, and mediaCoverage arrays exactly as they were here)
const successStories = [
  {
    id: "CASE-001",
    name: "The Brave Soul",
    status: "Fostered & Healed",
    statusColor: "text-green-500",
    intel: "Met with a severe street accident. The rapid response team coordinated emergency transport, veterinary treatment, and comprehensive follow-up care.",
    outcome: "Fostered by @swati_vikram99. Completely transformed from a scared, injured animal to one glowing with strength and happiness.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop", 
    colSpan: "md:col-span-2", 
  },
  {
    id: "CASE-003",
    name: "The Mother",
    status: "Recovered & Spayed",
    statusColor: "text-orange-500",
    intel: "Found pregnant and in severe medical distress. Emergency surgery was performed. Tragically, the puppies could not be saved.",
    outcome: "The mother fully recovered, was safely neutered, and is now living comfortably. A testament to why neutering is critical to preventing suffering.",
    image: "https://res.cloudinary.com/ds53m10cl/image/upload/v1775289465/WhatsApp_Image_2026-04-04_at_1.27.15_PM_pkhvrn.jpg?q=80&w=1000&auto=format&fit=crop", 
    colSpan: "md:col-span-1",
  },
  {
    id: "CASE-004",
    name: "The Paralyzed Pair",
    status: "Specialized Transfer",
    statusColor: "text-blue-500", 
    intel: "A senior dog and a puppy were left paralyzed after a tragic accident. They were found surviving on the streets against all odds, enduring immense pain and fear.",
    outcome: "Safely evacuated and transported to the Bark Club NGO in Nagpur. They are now receiving specialized medical treatment, mobility care, and a safe haven.",
    image: "https://res.cloudinary.com/ds53m10cl/image/upload/v1775289608/WhatsApp_Image_2026-04-04_at_1.29.46_PM_kvw2y2.jpg?q=80&w=1000&auto=format&fit=crop", 
    colSpan: "md:col-span-2", 
  }
];

const vaccinationDrives = [
  { zone: "Jala Nagar Sector", doses: 120, goal: 150, date: "12 OCT 2025", type: "Anti-Rabies + DHPPi" },
  { zone: "Ashram Road", doses: 85, goal: 100, date: "05 NOV 2025", type: "Anti-Rabies Only" },
  { zone: "Gol Gumbaz Perimeter", doses: 40, goal: 200, date: "ONGOING", type: "Comprehensive 9-in-1" }
];

// ================= NEW: SMART CARD COMPONENT =================
function CaseFileCard({ story }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  // 1. Track the exact pixel width of the text container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Pretext Magic: Mathematically calculate the exact height of the outcome text
  // Assuming text-sm (14px) and a standard line-height of 1.5 (21px)
  const { height: targetHeight } = useTextLayout(
    story.outcome, 
    "500 14px sans-serif", 
    width, 
    21 // Line height in pixels
  );

  return (
    <div className={`group relative rounded-[2rem] overflow-hidden bg-[#111] h-[450px] md:h-[500px] ${story.colSpan} border border-white/5 hover:border-white/20 transition-colors cursor-pointer flex flex-col`}>
      <img src={story.image} alt={story.name} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-in-out" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent opacity-100 transition-opacity duration-500" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="font-mono text-xs font-bold text-black bg-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">{story.id}</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-[#050505]/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${story.statusColor}`}>
            <ShieldCheck size={14} /> {story.status}
          </span>
        </div>

        <div>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4 leading-none">{story.name}</h3>
          
          <div className="space-y-3" ref={containerRef}>
            <p className="text-gray-300 text-sm font-medium leading-relaxed">
              <span className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1">The Incident</span>
              {story.intel}
            </p>
            
            {/* 3. The Smoothest Animation You've Ever Seen */}
            <div 
              className="overflow-hidden transition-[height,opacity] duration-500 ease-in-out opacity-0 group-hover:opacity-100"
              style={{ 
                height: 0, // Starts at 0
              }}
              // Tailwind doesn't support dynamic hover height easily, so we use a neat CSS trick:
              // When the group is hovered, we inject the exact calculated height.
              ref={(el) => {
                if (el) {
                  el.parentElement.parentElement.parentElement.addEventListener('mouseenter', () => el.style.height = `${targetHeight + 20}px`); // +20 for padding
                  el.parentElement.parentElement.parentElement.addEventListener('mouseleave', () => el.style.height = '0px');
                }
              }}
            >
              <p className="text-white text-sm font-medium leading-relaxed pt-2 border-t border-white/20 mt-2">
                <span className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1">The Outcome</span>
                {story.outcome}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= MAIN COMPONENT =================
export default function Impact() {
  return (
    <div className="bg-[#050505] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-24 overflow-x-hidden font-sans">
      
      {/* Hero Section (Keep exactly the same) */}
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
          {/* ... keeping the rest of the hero intact ... */}
        </div>
      </section>

      {/* 1. SUCCESS STORIES (Now using the Pretext component) */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Camera className="text-orange-500" size={36} /> Case Files
          </h2>
          <p className="hidden md:block text-gray-500 text-sm font-mono uppercase tracking-widest">Field Reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Map through data and render the new component */}
          {successStories.map((story, i) => (
            <CaseFileCard key={i} story={story} />
          ))}
        </div>
      </section>

      {/* KEEP REMAINDER OF PAGE (Operations Dashboard & Press) EXACTLY THE SAME */}
      {/* ... */}
      
    </div>
  );
}