import React, { useRef, useState, useEffect } from "react";
import { HeartHandshake, Syringe, Megaphone, Globe, ArrowDownRight } from "lucide-react";
import volunteers from "../data/volunteers.json"; 
import { useTextLayout } from "../hooks/useTextLayout"; 

// ================= TRULY DYNAMIC SMART CARD =================
function ValueCard({ item }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 1. Observe the exact pixel width of the card continuously
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      // Every time the window resizes, update the width instantly
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Pretext Dynamic Layout
  // Because 'item.text' never changes, Pretext only runs the heavy "Prepare" phase once.
  // As 'width' changes during a window resize, it only runs the ultra-fast "Layout" phase.
  const { height: targetHeight } = useTextLayout(
    item.text, 
    "500 16px sans-serif", 
    width, 
    24 // Line height
  );

  return (
    <div 
      className="bg-[#F5F5F5] p-10 rounded-[2.5rem] border-2 border-transparent hover:border-black transition-all group relative overflow-hidden flex flex-col justify-start min-h-[220px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 transition-all shadow-xl shrink-0 relative z-10">
        {item.icon}
      </div>
      
      <h3 className="text-3xl font-black uppercase tracking-tight relative z-10">{item.title}</h3>
      
      <div ref={containerRef} className="relative z-10">
        {/* 3. The Dynamic Reflow Container */}
        <div 
          className="overflow-hidden transition-all duration-500 ease-out opacity-0 group-hover:opacity-100"
          style={{ 
            // If hovered, use the exact Pretext calculation. If not, snap to 0.
            // If the window is resized WHILE hovered, this value updates instantly 
            // and the box smoothly morphs to the new required height.
            height: isHovered ? `${targetHeight + 16}px` : '0px' 
          }}
        >
          <p className="text-gray-600 font-medium leading-relaxed pt-4">
            {item.text}
          </p>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none scale-150">
         {item.icon}
      </div>
    </div>
  );
}


// ================= MAIN COMPONENT =================
export default function About() {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white pb-24 overflow-x-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end pb-20 px-4 md:px-12 overflow-hidden pt-32">
        <div className="absolute inset-0 z-0">
          <video
            src="/videos/Abouthero.mp4"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 block">
              / The Genesis
            </span>
            <h1 className="text-6xl md:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase">
              HEARTFELT <br />
              <span className="text-transparent stroke-text italic">MISSION.</span>
            </h1>
          </div>
          
          <div className="max-w-sm mb-4">
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-6">
              We rescue, rehabilitate, and provide second chances for the forgotten animals of Bijapur.
            </p>
            <button
              onClick={() => document.getElementById("team-section")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-3 text-white uppercase font-black tracking-widest text-xs hover:text-orange-500 transition-colors group"
            >
              Meet the Squad <ArrowDownRight className="group-hover:translate-y-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= OUR STORY ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                HOW WE <br /> <span className="text-orange-600">BEGAN.</span>
              </h2>
              <div className="h-2 w-24 bg-orange-600 mb-8" />
              <p className="text-2xl font-bold text-gray-500 italic leading-snug">
                "What began as a personal effort soon revealed a massive, hidden crisis within the city."
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10 text-xl text-gray-300 leading-relaxed font-medium">
            <p className="first-letter:text-7xl first-letter:font-black first-letter:text-orange-500 first-letter:float-left first-letter:mr-4 first-letter:-mt-2">
              Tails of Bijapur was started by Anirudha Gudi on 20th June 2025 with a clear
              purpose: to ensure that injured, abandoned, and vulnerable animals in Bijapur
              receive timely care and a fair chance at life. 
            </p>
            <p>
              Many compassionate individuals were already fighting the good fight in the shadows rescuing, feeding, fostering, and arranging medical care independently out of their own pockets.
            </p>
            <div className="p-8 border-l-4 border-orange-600 bg-white/5 rounded-r-2xl my-12">
              <p className="text-white font-bold italic">
                Tails of Bijapur brought these isolated animal lovers together under one roof, creating a fresh wave of collective responsibility and highly coordinated action.
              </p>
            </div>
            <p>
              Today, we stand as a fiercely community-driven initiative that connects
              volunteers, veterinarians, and caregivers to respond faster, work smarter, and
              ensure every animal receives dignity, medical support, and the second chances they
              truly deserve.
            </p>
          </div>

        </div>
      </section>

      {/* ================= CORE VALUES (Powered by Pretext) ================= */}
      <section className="py-32 px-4 md:px-12 bg-white text-black rounded-t-[5rem] rounded-b-[5rem]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6">Core <span className="text-orange-600 italic">Values</span></h2>
            <p className="text-xl font-bold text-gray-500 uppercase tracking-[0.2em]">The pillars of our operation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <HeartHandshake size={32} />, title: "Adopt", text: "Every adoption gives a rescued animal a second chance at life and a loving home." },
              { icon: <Syringe size={32} />, title: "Vaccinate", text: "Preventive care protects both animals and communities from life-threatening diseases." },
              { icon: <Megaphone size={32} />, title: "Educate", text: "Spreading awareness builds responsible pet care and compassionate neighborhoods." },
              { icon: <Globe size={32} />, title: "Coexist", text: "Humans and animals can live safely together through profound understanding and respect." },
            ].map((item, i) => (
              // Using our new High-Performance Component here
              <ValueCard key={i} item={item} /> 
            ))}
          </div>
        </div>
      </section>

      {/* ================= MEET THE TEAM ================= */}
      <section id="team-section" className="py-32 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 block">/ The Vanguard</span>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              OUR <span className="text-white/20">SQUAD.</span>
            </h2>
          </div>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-sm text-right max-w-xs">
            The blood, sweat, and tears behind every single rescue mission.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory hide-scrollbar">
          {volunteers.map((vol, index) => (
            <div key={index} className="min-w-[280px] md:min-w-[320px] snap-center group">
              <div className="bg-[#151515] p-8 rounded-[3rem] border border-white/5 hover:border-orange-500/50 transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center h-full">
                
                <div className="relative w-40 h-40 mb-8 mt-4">
                  <div className="absolute inset-0 bg-orange-600 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                  <img
                    src={vol.photo}
                    alt={vol.name}
                    className="relative z-10 w-full h-full object-cover rounded-full border-4 border-[#222] group-hover:border-orange-500 transition-colors duration-500 grayscale group-hover:grayscale-0"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/150/111111/ea580c?text=TB" }}
                  />
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{vol.name}</h3>
                <p className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-4">{vol.role}</p>
                <div className="w-10 h-1 bg-white/10 group-hover:w-full transition-all duration-500 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= IMPACT STATS ================= */}
      <section className="py-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="border-t border-b border-white/10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 divide-x-0 md:divide-x divide-white/10">
          {[
            { num: "50+", label: "Successful Rescues" },
            { num: "30+", label: "Active Volunteers" },
            { num: "10+", label: "Happy Adoptions" },
            { num: "02+", label: "Vaccination Drives" },
          ].map((stat, index) => (
            <div key={index} className="text-center px-4">
              <div className="text-5xl md:text-7xl font-black text-transparent stroke-text italic tracking-tighter mb-4 hover:text-orange-500 hover:stroke-none transition-all duration-300 cursor-default">
                {stat.num}
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 2px rgba(255,255,255,0.8);
          color: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}