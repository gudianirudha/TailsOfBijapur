import React from "react";
import { Syringe, ShieldAlert, ShieldCheck, HeartPulse, Utensils, MapPin, Droplets, Clock, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Awareness() {
  const nav = useNavigate();

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-24 overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="pt-40 pb-20 px-4 md:px-12 max-w-[1400px] mx-auto text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 block flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping" /> Public Health & Harmony
          </span>
          <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-8">
            SAFER STREETS. <br />
            <span className="text-transparent stroke-text italic">BETTER LIVES.</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto">
            Through vaccination, responsible feeding, and public awareness, we can protect both animals and people while creating harmony within our neighborhoods in Bijapur.
          </p>
        </div>
      </section>

      {/* ================= VACCINATION SCIENCE ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
              THE MEDICAL <br /> <span className="text-orange-600">SHIELD.</span>
            </h2>
            <div className="h-1 w-24 bg-orange-600 mb-8" />
            <p className="text-2xl font-bold text-gray-500 italic leading-snug">
              "Vaccination is not just animal welfare; it is the ultimate public safety measure."
            </p>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            <div className="bg-[#151515] p-10 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full" />
              <ShieldAlert className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">Anti-Rabies</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Rabies is 100% preventable through vaccination. Immunizing street and pet dogs protects the entire community and cuts the risk of fatal transmission to absolute zero.
              </p>
            </div>

            <div className="bg-[#151515] p-10 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full" />
              <Syringe className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">DHPPi (9-in-1)</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Protects dogs from highly contagious, life-threatening diseases like Distemper, Parvovirus, Hepatitis, and Leptospirosis. Prevents mass outbreaks.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= IMPACT & HISTORY ================= */}
      <section className="py-24 px-4 md:px-12 bg-white text-black rounded-[3rem] md:rounded-[5rem] mx-4 md:mx-8 mb-24">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-16 mb-16">
            <div>
              <span className="text-orange-600 font-bold uppercase tracking-[0.3em] text-sm mb-4 block">/ Ground Zero</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                THE VIJAYAPURA <br /> INITIATIVE.
              </h2>
            </div>
            
            <div className="space-y-6 text-lg font-medium text-gray-700 leading-relaxed border-l-4 border-orange-600 pl-6 md:pl-10">
              <p>
                For the first time in Vijayapura, Tails of Bijapur initiated organized mass vaccination drives for community dogs. 
              </p>
              <p>
                Many street dogs remain unvaccinated simply due to a lack of awareness and access—not neglect. We wanted to change that narrative completely.
              </p>
              <p>
                Through coordinated efforts, veterinary collaboration, and massive volunteer participation, we have successfully protected over <strong className="text-orange-600 text-xl font-black">100+ community dogs</strong> with both Anti-Rabies and DHPPi vaccines across two massive drives.
              </p>
              <p className="italic text-gray-500">
                These drives are not just medical campaigns; they are monumental steps toward long-term public safety and compassionate coexistence.
              </p>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200">
                 {/* Placeholder for actual drive photos - using a solid color/gradient fallback for now */}
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black mix-blend-multiply opacity-50 group-hover:opacity-0 transition-opacity duration-500 z-10" />
                 <img 
                   src={`/images/awareness/drive-${i}.jpg`} 
                   alt={`Vaccination Drive ${i}`}
                   className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                   onError={(e) => {
                     e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='bold' fill='%23ea580c'%3EDRIVE ARCHIVE 0" + i + "%3C/text%3E%3C/svg%3E";
                   }}
                 />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= RESPONSIBLE FEEDING PROTOCOL ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
            FEEDING <span className="text-orange-600">PROTOCOL.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Feeding street dogs must be structured and hygienic to maintain peace within the community while ensuring animals receive proper care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <MapPin />, text: "Choose fixed feeding locations away from heavy traffic." },
            { icon: <ShieldCheck />, text: "Maintain absolute cleanliness after feeding is complete." },
            { icon: <Droplets />, text: "Provide fresh, clean water daily in designated bowls." },
            { icon: <Utensils />, text: "Avoid blocking entrances, gates, or public pathways." },
            { icon: <Users />, text: "Coordinate respectfully with local residents and neighbors." },
            { icon: <Clock />, text: "Keep feeding timings consistent to establish a routine." },
          ].map((item, index) => (
            <div key={index} className="bg-[#111] p-8 rounded-3xl border-t-2 border-transparent hover:border-orange-600 transition-colors group flex gap-6 items-start">
              <div className="bg-white/5 p-4 rounded-xl text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                {item.icon}
              </div>
              <p className="text-gray-300 font-medium leading-relaxed pt-2">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CLOSING CTA ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="bg-orange-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
          <HeartPulse className="absolute -top-10 -left-10 w-64 h-64 text-black/10 pointer-events-none" />
          <HeartPulse className="absolute -bottom-10 -right-10 w-64 h-64 text-black/10 pointer-events-none" />
          
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-6 relative z-10">
            A Safe Environment For All
          </h2>
          
          <p className="text-xl md:text-2xl text-black/80 font-bold max-w-4xl mx-auto leading-relaxed mb-12 relative z-10">
            Vaccinated, sterilized, and properly fed dogs are healthier, calmer, and less aggressive. Awareness and humane treatment radically reduce conflicts, prevent disease, and build profound trust between humans and animals.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full sm:w-auto">
            <button onClick={() => nav("/donate")} className="px-10 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all flex items-center justify-center gap-3 group w-full sm:w-auto">
              Fund a Vaccine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => nav("/volunteer")} className="px-10 py-5 border-4 border-black text-black rounded-full font-black uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all w-full sm:w-auto">
              Volunteer for Drives
            </button>
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