import React from "react";
import { useNavigate } from "react-router-dom";
import { MoveRight, Phone, Heart, Zap, Shield, Share2 } from "lucide-react";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* ================= DYNAMIC HERO ================= */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden px-4">
        {/* Background Video with subtle zoom effect */}
        <div className="absolute inset-0 z-0 scale-110 animate-pulse-slow">
          <video
            src="/videos/homehero.mp4"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/60 to-[#0A0A0A]" />
        </div>



        <div className="relative z-10 text-center max-w-6xl">
          <h1 className="text-[12vw] md:text-[9vw] font-black leading-[0.85] tracking-tighter uppercase mb-8">
            RESCUE. <br />
            <span className="text-transparent stroke-text italic">REHAB.</span> <br />
            <span className="text-orange-600">REHOME.</span>
          </h1>
          
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
            <button 
              onClick={() => nav("/donate")}
              className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-tighter overflow-hidden rounded-full transition-all hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2 text-lg">
                Save a Life <MoveRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => nav("/adopt")}
              className="group px-12 py-5 border-2 border-white/20 rounded-full font-black uppercase tracking-tighter hover:bg-white/10 transition-all flex items-center gap-3 text-lg"
            >
                Bring a Soul Home <Heart size={20} className="group-hover:scale-110 transition-transform text-orange-500" />   
            </button>
          </div>
          </div>
          </section>

      

      {/* ================= THE MARQUEE (Social Proof) ================= */}
      <div className="bg-orange-600 py-4 border-y-2 border-black overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee font-black uppercase text-2xl tracking-tighter italic text-black">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-4">
              Tails of Bijapur <Zap fill="black" /> 50+ Rescued <Zap fill="black" /> Street Guardians <Zap fill="black" />
            </span>
          ))}
        </div>
      </div>

      {/* ================= BENTO GRID (The Work) ================= */}
      <section className="py-32 px-4 md:px-12 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Story Card */}
          <div className="md:col-span-8 bg-[#151515] rounded-[3rem] p-12 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-4 block">/ Mission Critical</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8 max-w-2xl">
                WE FIGHT FOR THE <span className="text-white/30">ABANDONED.</span>
              </h2>
              <p className="text-gray-400 text-xl max-w-xl leading-relaxed font-medium">
                It is better to fight for a life the world discarded than to live accepting the silence. Compassion without action is just observation. We choose the front lines.
              </p>
            </div>
            {/* Background Texture/Image */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/10 blur-[100px] rounded-full group-hover:bg-orange-600/20 transition-all" />
          </div>

          {/* Impact Stats */}
          <div className="md:col-span-4 grid grid-rows-2 gap-6">
            <div className="bg-orange-600 rounded-[3rem] p-10 flex flex-col justify-end group cursor-pointer overflow-hidden">
               <Share2 className="mb-auto text-black/50 group-hover:text-black transition-colors" size={32} />
               <h3 className="text-6xl font-black text-black tracking-tighter">30+</h3>
               <p className="text-black font-bold uppercase text-sm tracking-widest">Active Guardians</p>
            </div>
            <div className="bg-[#151515] border border-white/10 rounded-[3rem] p-10 flex flex-col justify-end">
               <Shield className="mb-auto text-orange-500" size={32} />
               <h3 className="text-6xl font-black text-white tracking-tighter">100%</h3>
               <p className="text-gray-500 font-bold uppercase text-sm tracking-widest">Transparency</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THE ACTION GRID (Broken Layout) ================= */}
      <section className="py-24 px-4 md:px-12 bg-white text-black rounded-t-[5rem]">
        <div className="flex flex-col md:flex-row justify-between items-start mb-20 gap-8">
          <h2 className="text-7xl md:text-[10vw] font-black leading-[0.8] tracking-tighter uppercase">
            The <br /> Ground <br /> <span className="text-orange-600">Reality.</span>
          </h2>
          <div className="max-w-md">
            <p className="text-2xl font-bold leading-tight mb-6 italic">
              "Action is the only antidote to the suffering we see every day on these streets."
            </p>
            <div className="h-2 w-24 bg-orange-600" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <ActionCard 
            step="01" 
            title="Crisis Call" 
            text="Our network connects with Veterinarians to understand the situation." 
          />
          <ActionCard 
            step="02" 
            title="Surgical Intervention" 
            text="Immediate specialized treatment for fractures, tumors, and viral cases." 
          />
          <ActionCard 
            step="03" 
            title="Life Beyond" 
            text="Fostering in local homes until we find a permanent family across India." 
          />
        </div>
      </section>

      {/* ================= FOOTER / FINAL CALL ================= */}
      <footer className="bg-white text-black py-20 px-4 md:px-12 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="text-center md:text-left">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Ready to Help?</p>
          <h4 
            onClick={() => nav("/volunteer")}
            className="text-4xl md:text-6xl font-black tracking-tighter underline decoration-orange-600 underline-offset-8 transition-all hover:text-orange-600 cursor-pointer"
          >
            JOIN THE PACK
          </h4>
        </div>


          <div className="flex gap-4">
             {["Instagram", "Twitter", "Facebook"].map(link => (
               <button key={link} className="px-6 py-2 border-2 border-black font-bold uppercase text-xs rounded-full hover:bg-black hover:text-white transition-all">
                 {link}
               </button>
             ))}
          </div>
        </div>
      </footer>

      {/* CSS for custom animations and stroke text */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text {
          -webkit-text-stroke: 2px white;
          color: transparent;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce 4s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-10%) rotate(-12deg); }
          50% { transform: translateY(0) rotate(-12deg); }
        }
      `}} />
    </div>
  );
}

function ActionCard({ step, title, text }) {
  return (
    <div className="group border-t-2 border-black pt-8 hover:border-orange-600 transition-colors">
      <span className="text-orange-600 font-black text-xl mb-4 block group-hover:translate-x-4 transition-transform">{step}</span>
      <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">{title}</h3>
      <p className="text-gray-600 font-medium leading-relaxed">{text}</p>
    </div>
  );
}