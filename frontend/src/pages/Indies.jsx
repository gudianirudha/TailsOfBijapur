import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dna, ThermometerSun, BrainCircuit, Heart, ArrowRight, 
  Home, ShieldAlert, HeartHandshake, CalendarHeart, ChevronDown 
} from "lucide-react";
import { useTextLayout } from "../hooks/useTextLayout"; 

// ================= SMART EXPANDING MANIFESTO =================
function SmartManifesto() {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const manifestoText = "While foreign breeds are wonderful pets, they often struggle with India's harsh climate and are prone to inherited genetic conditions. Indies hold the home-field advantage. They are genetically diverse, remarkably healthy, and deeply attuned to our environment.";

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { height: targetHeight } = useTextLayout(manifestoText, "500 20px sans-serif", width, 32.5);

  return (
    <div className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed space-y-6 text-left" ref={containerRef}>
      <p>
        For centuries, the Indian Pariah dog has thrived alongside human civilization. They haven't been shaped by artificial breeding for specific looks; they have been shaped by nature for pure survival, health, and companionship.
      </p>
      
      <div 
        className="overflow-hidden transition-[height,opacity] duration-700 ease-in-out"
        style={{ 
          height: isExpanded ? `${targetHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <p>{manifestoText}</p>
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-orange-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors pt-2"
      >
        {isExpanded ? "Close Manifesto" : "Read Full Manifesto"} 
        <ChevronDown className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} size={16} />
      </button>
    </div>
  );
}

// ================= MAIN PAGE COMPONENT =================
export default function Philosophy() {
  const nav = useNavigate();

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen overflow-x-hidden font-sans pb-24">
      
      {/* ================= 1. CINEMATIC HERO ================= */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://plus.unsplash.com/premium_photo-1661892088256-0a17130b3d0d?q=80&w=2000&auto=format&fit=crop" 
            alt="Majestic Indian Dog"
            className="w-full h-full object-cover grayscale opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/40 to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center mt-20">
          <span className="border border-orange-500/30 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
            The Native Companion
          </span>
          <h1 className="text-7xl md:text-[10vw] font-black uppercase tracking-tighter leading-[0.8] mb-8 drop-shadow-2xl">
            BORN FOR <br />
            <span className="text-transparent stroke-text italic">INDIA.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl leading-relaxed">
            A masterpiece of natural evolution. Discover the resilience, intelligence, and unwavering loyalty of the dogs built for our soil.
          </p>
        </div>
      </section>

      {/* ================= 2. THE EDITORIAL CENTER ================= */}
      <section className="py-24 px-4 border-b border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <Heart className="text-orange-600 mx-auto" size={48} strokeWidth={1.5} />
          
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
            NATURE'S <span className="text-orange-500">MASTERPIECE.</span>
          </h2>
          
          <p className="text-2xl md:text-3xl text-gray-400 font-medium italic leading-relaxed">
            "We believe every dog deserves a loving home, but there is something truly magical about rescuing a soul that belongs to the very streets we walk on."
          </p>
          
          <div className="w-24 h-1 bg-orange-600 mx-auto rounded-full" />
          
          <SmartManifesto />
        </div>
      </section>

      {/* ================= 3. SCROLL-TELLING FEATURES ================= */}
      <section className="py-32 px-4 md:px-12 max-w-[1400px] mx-auto space-y-32">
        
        {/* Feature 1 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative h-[450px] md:h-[500px] rounded-[3rem] overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1537267826152-8e218e860755?q=80&w=1000&auto=format&fit=crop" alt="Indie Dog Running" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="space-y-6 flex flex-col justify-center h-full">
            <div className="bg-[#151515] w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500 mb-4 border border-white/5">
              <Dna size={32} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Naturally Robust</h3>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Generations of natural selection have gifted them with incredible immune systems. Thanks to a wide gene pool, they generally enjoy longer, healthier lives with very few inherited medical conditions compared to purebreds.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-6 flex flex-col justify-center h-full order-2 md:order-1">
            <div className="bg-[#151515] w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500 mb-4 border border-white/5">
              <ThermometerSun size={32} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Climate Masters</h3>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              From sweltering 40°C summers to monsoon downpours, their short, highly efficient coats and natural thermoregulation make them perfectly suited for the Indian climate. They don't need 24/7 air conditioning to be comfortable.
            </p>
          </div>
          <div className="relative h-[450px] md:h-[500px] rounded-[3rem] overflow-hidden group order-1 md:order-2">
            <img src="https://images.unsplash.com/photo-1641900007951-802a4fa275dd?q=80&w=1000&auto=format&fit=crop" alt="Indie Dog Resting" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Feature 3 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative h-[450px] md:h-[500px] rounded-[3rem] overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1613205286476-9c2450122546?q=80&w=1000&auto=format&fit=crop" alt="Indie Dog Portrait" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="space-y-6 flex flex-col justify-center h-full">
            <div className="bg-[#151515] w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500 mb-4 border border-white/5">
              <BrainCircuit size={32} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Fiercely Intelligent</h3>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Navigating the world requires serious smarts. Indies are incredibly quick learners, highly trainable, and instinctively form deep, protective bonds with their human families. They are low-maintenance, but offer boundless love.
            </p>
          </div>
        </div>

      </section>

      {/* ================= 4. THE REALITY (STATS + PHILOSOPHY) ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/5 mt-12">
        <div className="text-center mb-20">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 block">/ The Reality</span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
            WHY <span className="text-orange-600">ADOPTION</span> MATTERS.
          </h2>
        </div>

        {/* 3-Column Uniform Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {[
            { 
              value: "30M", 
              title: "THE OVERLOOKED.",
              label: "Thirty million souls navigating the world alone."
            },
            { 
              value: "70%", 
              title: "THE SILENCE.",
              label: "The staggering number of rescues that never go home."
            },
            { 
              value: "100%", 
              title: "THE REWARD.",
              label: "Total, unwavering loyalty from a heart you saved."
            },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center h-full hover:border-orange-600/40 transition-all duration-500 group relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/10 blur-[80px] rounded-full group-hover:bg-orange-600/20 transition-colors" />
              
              {/* Stat Value */}
              <p className="text-7xl font-black text-white mb-2 group-hover:text-orange-500 transition-colors relative z-10 tracking-tighter">
                {stat.value}
              </p>

              {/* Primal Title */}
              <p className="text-orange-500 font-black text-xs tracking-[0.4em] mb-6 relative z-10 uppercase">
                {stat.title}
              </p>
              
              {/* Minimalist Label */}
              <p className="text-gray-500 font-bold text-lg leading-tight relative z-10 max-w-[200px] group-hover:text-gray-300 transition-colors">
                {stat.label}
              </p>

            </div>
          ))}
        </div>

        {/* 3-Column Uniform Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#151515] p-10 rounded-[2.5rem] border border-white/5 flex flex-col h-full hover:border-white/20 transition-all">
            <HeartHandshake className="text-orange-500 mb-6 shrink-0" size={40} />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">Impact on Humans</h3>
            <p className="text-gray-400 font-medium leading-relaxed mt-auto">
              Living with a companion animal improves emotional well-being, reduces stress, and encourages healthy routines. Adopted pets provide unconditional companionship and foster empathy, patience, and emotional stability.
            </p>
          </div>

          <div className="bg-[#151515] p-10 rounded-[2.5rem] border border-white/5 flex flex-col h-full hover:border-white/20 transition-all">
            <Home className="text-orange-500 mb-6 shrink-0" size={40} />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">Impact on Animals</h3>
            <p className="text-gray-400 font-medium leading-relaxed mt-auto">
              Many animals awaiting adoption have faced abandonment or unsafe environments. Adoption offers them immediate safety, medical care, nourishment, and the chance to experience love and dignity in a permanent home.
            </p>
          </div>

          <div className="bg-orange-600/10 p-10 rounded-[2.5rem] border border-orange-500/20 flex flex-col h-full hover:bg-orange-600/20 transition-all">
            <ShieldAlert className="text-orange-500 mb-6 shrink-0" size={40} />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-orange-500">Adopt, Don't Shop</h3>
            <p className="text-orange-100/80 font-medium leading-relaxed mt-auto">
              Commercial breeding often prioritizes profit over welfare, leading to genetic defects and overpopulation. Adoption directly reduces the burden on shelters and actively supports the ethical treatment of animals.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 5. THE COMMITMENT (Aligned "Ground Zero" Style) ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="bg-white text-black rounded-[3rem] md:rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
          
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 relative z-10">
            {/* Left Col */}
            <div className="flex flex-col justify-center">
              <span className="text-orange-600 font-bold uppercase tracking-[0.3em] text-sm mb-6 block">/ The Promise</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                THE LIFELONG <br /> COMMITMENT.
              </h2>
              <p className="text-2xl font-bold text-gray-600 leading-relaxed italic">
                "Adoption is not a single transaction. It is a lifelong relationship built on trust, patience, and unconditional care."
              </p>
            </div>
            
            {/* Right Col */}
            <div className="space-y-12 flex flex-col justify-center">
              <div className="border-l-4 border-orange-600 pl-8">
                <h4 className="text-black font-black uppercase tracking-widest text-xl mb-4 flex items-center gap-3">
                  <CalendarHeart className="text-orange-600" size={24} /> The Responsibility
                </h4>
                <p className="text-gray-700 text-lg font-medium leading-relaxed">
                  Adopting a pet is a long-term commitment. Responsible pet parents ensure regular meals, clean water, timely veterinary care, daily exercise, emotional attention, and a safe living environment throughout the animal’s entire life.
                </p>
              </div>
              
              <div className="border-l-4 border-black pl-8">
                <h4 className="text-black font-black uppercase tracking-widest text-xl mb-4 flex items-center gap-3">
                  <Home className="text-black" size={24} /> Life After Adoption
                </h4>
                <p className="text-gray-700 text-lg font-medium leading-relaxed">
                  Every adopted animal needs time to adjust to unfamiliar surroundings. Maintaining consistent routines for feeding, walks, and rest creates a sense of stability. Positive reinforcement strengthens trust and builds confidence without fear or pressure.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 6. MASSIVE CTA ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="bg-orange-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
          <Heart className="absolute -top-10 -left-10 w-64 h-64 text-black/10 pointer-events-none -rotate-12" />
          <Heart className="absolute -bottom-10 -right-10 w-64 h-64 text-black/10 pointer-events-none rotate-12" />
          
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-6 relative z-10 leading-[0.9]">
            READY TO MEET <br /> <span className="text-white">YOUR BEST FRIEND?</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-black/80 font-bold max-w-3xl mx-auto leading-relaxed mb-12 relative z-10">
            The streets of Bijapur are full of perfectly healthy, beautiful, and loving Indies waiting for a family to call their own. Open your heart and home today.
          </p>

          <button 
            onClick={() => nav("/adopt")} 
            className="px-12 py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-lg hover:scale-105 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 group shadow-2xl relative z-10"
          >
            View Adoptable Dogs <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
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
      `}} />
    </div>
  );
}