import React, { useState, useEffect } from "react";
import { Camera, ShieldCheck, Crosshair, ArrowUpRight, Activity, X, Eye, CarFront } from "lucide-react";

// ==========================================
// 1. MOCK DATA
// ==========================================
const successStories = [
  {
    id: "CASE-001",
    name: "The Brave Soul",
    status: "Fostered & Healed",
    statusColor: "text-green-500",
    intel: "Met with a severe street accident. The rapid response team coordinated emergency transport, veterinary treatment, and comprehensive follow-up care.",
    outcome: "Fostered by Swati Vikram. Completely transformed from a scared, injured animal to one glowing with strength and happiness.",
    image: "https://res.cloudinary.com/ds53m10cl/image/upload/v1775739027/WhatsApp_Image_2026-04-09_at_6.20.12_PM_qhko4k.jpg?q=80&w=1000&auto=format&fit=crop", 
    colSpan: "md:col-span-2", 
  },
  {
    id: "CASE-002",
    name: "The Mother",
    status: "Recovered & Spayed",
    statusColor: "text-orange-500",
    intel: "Found pregnant and in severe medical distress. Emergency surgery was performed. Tragically, the puppies could not be saved.",
    outcome: "The mother fully recovered, was safely neutered, and is now living comfortably. A testament to why neutering is critical.",
    image: "https://res.cloudinary.com/ds53m10cl/image/upload/v1775289465/WhatsApp_Image_2026-04-04_at_1.27.15_PM_pkhvrn.jpg?q=80&w=1000&auto=format&fit=crop", 
    colSpan: "md:col-span-1",
  },
  {
    id: "CASE-003",
    name: "The Paralyzed Pair",
    status: "Specialized Transfer",
    statusColor: "text-blue-500", 
    intel: "A senior dog and a puppy were left paralyzed after a tragic accident. They were found surviving on the streets against all odds.",
    outcome: "Safely evacuated to the Bark Club NGO in Nagpur. They are now receiving specialized medical treatment and mobility care.",
    image: "https://res.cloudinary.com/ds53m10cl/image/upload/v1775289608/WhatsApp_Image_2026-04-04_at_1.29.46_PM_kvw2y2.jpg?q=80&w=1000&auto=format&fit=crop", 
    colSpan: "md:col-span-2", 
  }
];

const mediaCoverage = [
  { 
    source: "Vijayavani", 
    title: "Project Shield: Vijayapura's First Mass Vaccination Protocol", 
    date: "30th Aug 2025",
    image: "https://res.cloudinary.com/ds53m10cl/image/upload/v1775739621/WhatsApp_Image_2026-04-09_at_6.26.49_PM_1_i3613p.jpg?q=80&w=1000&auto=format&fit=crop" 
  },
  { 
    source: "Vijayavani", 
    title: "Operation Lifeline: School Kids Step Up for Drowning Rescue", 
    date: "25th Feb 2026",
    image: "https://res.cloudinary.com/ds53m10cl/image/upload/v1775739621/WhatsApp_Image_2026-04-09_at_6.26.49_PM_nqgaae.jpg?q=80&w=1000&auto=format&fit=crop"
  },
];

const vaccinationDrives = [
  { zone: "Bldea Engineering College", doses: 50, goal: 50, date: "12 OCT 2025", type: "Anti-Rabies + DHPPi" },
  { zone: "Ashram Road", doses: 60, goal: 100, date: "05 NOV 2025", type: "Anti-Rabies Only" },
  { zone: "Station Road", doses: 25, goal: 100, date: "ONGOING", type: "Comprehensive 9-in-1" }
];


// ==========================================
// 2. INTERACTIVE WIDGET: NIGHT SHIELD SIMULATOR (MODIFIED)
// ==========================================
const NightShieldInteractive = () => {
  const [isLit, setIsLit] = useState(false);

  return (
    <div 
      className="relative w-full h-[400px] rounded-[2rem] overflow-hidden cursor-pointer group border border-white/10 transition-all duration-700 bg-[#050505]"
      onClick={() => setIsLit(!isLit)}
      onMouseEnter={() => setIsLit(true)}
      onMouseLeave={() => setIsLit(false)}
    >
      {/* Increased Headlight Beam Intensity (via-white/25 vs via-white/10) */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 -left-full w-[200%] h-[150px] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-2xl rotate-12 transition-transform duration-1000 ease-out z-0 ${
          isLit ? 'translate-x-[50%]' : '-translate-x-full'
        }`} 
      />

      {/* The Photograph Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        
        <div className="relative w-56 h-56 md:w-64 md:h-64 -mt-8 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 bg-black">
          
          {/* THE REALISTIC NIGHT SHADOW OVERLAY */}
          <div 
            className={`absolute inset-0 bg-[#020617] pointer-events-none transition-opacity duration-700 ease-out z-10 ${
              isLit ? 'opacity-0' : 'opacity-70'
            }`} 
          />

          {/* SIGNIFICANTLY MORE ILLUMINATING: brightness, contrast, saturate amped up in lit state */}
          <img 
            src="https://res.cloudinary.com/ds53m10cl/image/upload/v1775969952/WhatsApp_Image_2026-04-05_at_2.19.59_PM_1_joh2fu.jpg?q=80&w=1000&auto=format&fit=crop" 
            alt="Street dog at night" 
            className={`w-full h-full object-cover transition-all duration-700 ease-out relative z-0 ${
              isLit 
                ? 'brightness-125 contrast-125 saturate-125' // THE UPDATE: More Illuminating
                : 'brightness-[0.35] contrast-125 saturate-[0.3]'
            }`}
          />
          
          {/* ❌ ORANGE BELT REMOVED HERE ❌ */}
        </div>

        {/* Status Text */}
        <div className="absolute bottom-6 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">
            {isLit ? 'High Visibility Active' : 'Stealth Mode'}
          </p>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 ${
            isLit ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}>
            {isLit ? <ShieldCheck size={16} /> : <CarFront size={16} />}
            <span className="text-xs font-black uppercase tracking-widest">
              {isLit ? 'Safe to Bypass' : 'Danger: Unseen'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Interaction Hint */}
      <div className={`absolute top-6 w-full text-center text-xs font-bold uppercase tracking-widest transition-opacity duration-300 z-20 ${isLit ? 'opacity-0' : 'opacity-100 text-gray-600'}`}>
        Hover or Click to Illuminate
      </div>
    </div>
  );
};


// ==========================================
// 3. MAIN COMPONENT (PAGE LAYOUT)
// ==========================================
export default function Impact() {
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setSelectedMedia(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Lock background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedMedia ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedMedia]);

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-24 overflow-x-hidden font-sans">
      
      {/* ================= HERO SECTION ================= */}
      <section className="pt-40 pb-16 px-4 md:px-12 max-w-[1400px] mx-auto border-b border-white/10">
        <div className="max-w-5xl">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 block flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> Verified Impact
          </span>
          <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-8">
            PROOF OF <br />
            <span className="text-transparent stroke-text italic">LIFE.</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl">
            We don't deal in promises; we deal in outcomes. Every record below represents a life pulled from the brink and successfully rehabilitated. This is the vanguard in action.
          </p>
        </div>
      </section>

      {/* ================= CASE FILES (SUCCESS STORIES) ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
               <Camera className="text-orange-600" size={36} /> DECLASSIFIED FILES
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3">Field Reports & Rescue Outcomes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, i) => (
            <div key={i} className={`group relative rounded-[2rem] overflow-hidden bg-[#111] h-[450px] md:h-[500px] ${story.colSpan} border border-white/5 hover:border-orange-500/30 transition-colors cursor-pointer flex flex-col`}>
              
              {/* Background Image & Overlay */}
              <img src={story.image} alt={story.name} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent opacity-100" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                {/* Header Labels */}
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-black bg-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">{story.id}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-[#050505]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${story.statusColor}`}>
                    <ShieldCheck size={14} /> {story.status}
                  </span>
                </div>

                {/* Content Block */}
                <div>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4 leading-none">{story.name}</h3>
                  
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm font-medium leading-relaxed">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1">The Incident</span>
                      {story.intel}
                    </p>
                    
                    {/* Rock-Solid Height Animation */}
                    <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-[200px] group-hover:opacity-100 group-hover:mt-4">
                      <p className="text-white text-sm font-medium leading-relaxed pt-4 border-t border-white/20">
                        <span className="text-orange-500 uppercase tracking-widest text-[10px] block mb-1">Outcome Intel</span>
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

      {/* ================= OPERATIONS DASHBOARD (VACCINATIONS) ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Intro */}
          <div className="lg:col-span-5">
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 block">/ Disease Control</span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-8">
              PREVENTION <br /> <span className="text-gray-600">PROTOCOL.</span>
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-8">
              Reactive rescue is not enough. To truly protect the street population, we deploy systematic vaccination drives across high-risk zones, establishing herd immunity against fatal viral outbreaks.
            </p>
            <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-orange-600/10 p-4 rounded-xl text-orange-500">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-white">Total Vaccinations</p>
                <p className="text-3xl font-black text-orange-500 tracking-tighter">200+ <span className="text-sm text-gray-500">Administered</span></p>
              </div>
            </div>
          </div>

          {/* Right Data Grid */}
          <div className="lg:col-span-7 space-y-4">
            {vaccinationDrives.map((drive, i) => {
              const progress = Math.min((drive.doses / drive.goal) * 100, 100);
              const isComplete = progress >= 100;

              return (
                <div key={i} className="bg-[#111] border border-white/5 p-8 rounded-[2rem] group hover:border-orange-500/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-[50px] rounded-full group-hover:bg-orange-600/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">{drive.zone}</h4>
                      <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">{drive.type}</p>
                    </div>
                    <span className="text-gray-500 font-mono text-xs uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{drive.date}</span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                      <span className={isComplete ? "text-green-500" : "text-white"}>
                        {isComplete ? "Objective Complete" : `${drive.doses} Doses Administered`}
                      </span>
                      <span className="text-gray-600">Target: {drive.goal}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-[#151515] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-green-500' : 'bg-orange-500'}`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= NIGHT VISIBILITY OPERATIONS (NEW COLLAR SECTION) ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10 relative overflow-hidden">
        {/* Subtle glowing background effect simulating reflection */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-16 items-start relative z-10">
            
          {/* Left Data/Visual Card */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6">
            
            {/* The New Interactive Simulator Component */}
            <NightShieldInteractive />

            <div className="bg-[#111] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-orange-500/30 transition-colors">
              {/* Simulated Reflective Strip */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 via-yellow-400 to-orange-600 opacity-80" />
              
              <div className="flex items-center gap-6 mb-8 mt-2">
                <div className="bg-orange-600/10 p-5 rounded-2xl text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                  <Eye size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Total Deployed</p>
                  <p className="text-5xl font-black text-white tracking-tighter">200<span className="text-orange-500">+</span></p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10 text-sm font-bold uppercase tracking-widest text-gray-300">
                  <span>Coverage Area</span>
                  <span className="text-orange-500 text-right">Across Bijapur</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10 text-sm font-bold uppercase tracking-widest text-gray-300">
                  <span>Primary Objective</span>
                  <span className="text-orange-500 text-right">Night Accident Evasion</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-300">
                  <span>Equipment Status</span>
                  <span className="text-green-500 flex items-center gap-2"><ShieldCheck size={14}/> Active on field</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Intro */}
          <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-32">
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 block">/ Road Safety Operations</span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-8">
              NIGHT SHIELD <br /> <span className="text-gray-600">DEPLOYMENT.</span>
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-6">
              Urban traffic is a silent killer for street animals after dusk. To combat this, we have initiated an ongoing deployment of high-visibility, anti-accident reflective collar belts.
            </p>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              By equipping the street population with these specialized reflective collars, we dramatically increase driver reaction times at night—turning a potential fatal impact into a safe bypass.
            </p>
          </div>

        </div>
      </section>

      {/* ================= PUBLIC INTEL (PRESS) ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
             MEDIA <span className="text-orange-600">INTEL.</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3">Verified Press Intercepts</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {mediaCoverage.map((item, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedMedia(item)}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-[#111] border border-white/5 rounded-3xl hover:border-orange-500/30 transition-all cursor-pointer"
            >
              <div className="mb-4 md:mb-0">
                <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-2">{item.date}</p>
                <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white group-hover:text-gray-300 transition-colors">
                  "{item.title}"
                </h4>
                <p className="text-gray-500 font-medium text-sm mt-2 flex items-center gap-2">
                  <Crosshair size={14} /> {item.source}
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-full text-white group-hover:bg-orange-600 group-hover:text-white transition-all shrink-0">
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MEDIA INTEL MODAL ================= */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedMedia(null); }}
        >
          <div className="bg-[#111] border border-white/10 rounded-[2rem] max-w-4xl w-full max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMedia(null)} 
              className="absolute top-6 right-6 z-10 text-white hover:text-orange-500 bg-black/50 backdrop-blur-md p-2 rounded-full transition-colors border border-white/20"
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div className="p-8 border-b border-white/10 flex-shrink-0">
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 inline-block mb-3">
                {selectedMedia.source} &bull; {selectedMedia.date}
              </span>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white leading-none pr-12">
                "{selectedMedia.title}"
              </h3>
            </div>

            {/* Document Viewer (Image) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505] flex justify-center items-start min-h-[50vh]">
              <img 
                src={selectedMedia.image} 
                alt={selectedMedia.title} 
                className="w-full max-w-2xl h-auto object-contain rounded-xl border border-white/5 shadow-2xl"
                onError={(e) => { e.target.style.display='none' }}
              />
            </div>

          </div>
        </div>
      )}

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