import React from "react";
import { useNavigate } from "react-router-dom";
import { Dna, ThermometerSun, BrainCircuit, Heart, ArrowRight } from "lucide-react";

export default function Indies() {
  const nav = useNavigate();

  return (
    <div className="bg-[#050505] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen overflow-x-hidden font-sans">
      
      {/* ================= 1. FULL-SCREEN CINEMATIC HERO ================= */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center text-center px-4">
        {/* Massive Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://plus.unsplash.com/premium_photo-1661892088256-0a17130b3d0d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2000&auto=format&fit=crop" 
            alt="Majestic Indian Dog"
            className="w-full h-full object-cover grayscale opacity-50"
          />
          {/* Gradients to blend into the black background below */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#050505]" />
        </div>

        {/* Hero Content */}
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

      {/* ================= 2. THE EDITORIAL CENTER-COLUMN ================= */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <Heart className="text-orange-600 mx-auto" size={48} strokeWidth={1.5} />
          
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
            NATURE'S <span className="text-orange-500">MASTERPIECE.</span>
          </h2>
          
          <p className="text-2xl md:text-3xl text-gray-400 font-medium italic leading-relaxed">
            "We believe every dog deserves a loving home, but there is something truly magical about rescuing a soul that belongs to the very streets we walk on."
          </p>
          
          <div className="w-24 h-1 bg-orange-600 mx-auto rounded-full" />
          
          <div className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed space-y-6 text-left">
            <p>
              For centuries, the Indian Pariah dog has thrived alongside human civilization. They haven't been shaped by artificial breeding for specific looks; they have been shaped by nature for pure survival, health, and companionship.
            </p>
            <p>
              While foreign breeds are wonderful pets, they often struggle with India's harsh climate and are prone to inherited genetic conditions. Indies hold the home-field advantage. They are genetically diverse, remarkably healthy, and deeply attuned to our environment.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 3. SCROLL-TELLING FEATURES ================= */}
      <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto space-y-32">
        
        {/* Feature 1: Image Left, Text Right */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative h-[500px] rounded-[3rem] overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1537267826152-8e218e860755?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1000&auto=format&fit=crop" alt="Indie Dog Running" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500 mb-8 border border-white/10">
              <Dna size={32} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Naturally Robust</h3>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Generations of natural selection have gifted them with incredible immune systems. Thanks to a wide gene pool, they generally enjoy longer, healthier lives with very few inherited medical conditions compared to purebreds.
            </p>
          </div>
        </div>

        {/* Feature 2: Text Left, Image Right */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500 mb-8 border border-white/10">
              <ThermometerSun size={32} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Climate Masters</h3>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              From sweltering 40°C summers to monsoon downpours, their short, highly efficient coats and natural thermoregulation make them perfectly suited for the Indian climate. They don't need 24/7 air conditioning to be comfortable.
            </p>
          </div>
          <div className="relative h-[500px] rounded-[3rem] overflow-hidden group order-1 md:order-2">
            <img src="https://images.unsplash.com/photo-1641900007951-802a4fa275dd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1000&auto=format&fit=crop" alt="Indie Dog Resting" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Feature 3: Image Left, Text Right */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="relative h-[500px] rounded-[3rem] overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1613205286476-9c2450122546?q=80&w=1284&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1000&auto=format&fit=crop"
            alt="Indie Dog Portrait" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500 mb-8 border border-white/10">
              <BrainCircuit size={32} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Fiercely Intelligent</h3>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Navigating the world requires serious smarts. Indies are incredibly quick learners, highly trainable, and instinctively form deep, protective bonds with their human families. They are low-maintenance, but offer boundless love.
            </p>
          </div>
        </div>

      </section>

      {/* ================= 4. MASSIVE CTA ================= */}
      <section className="py-32 px-4 text-center bg-orange-600 mt-12 relative overflow-hidden">
        {/* Decorative background element */}
        <Heart className="absolute -top-20 -left-20 w-96 h-96 text-black/10 pointer-events-none -rotate-12" />
        <Heart className="absolute -bottom-20 -right-20 w-96 h-96 text-black/10 pointer-events-none rotate-12" />

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9] text-black">
            READY TO MEET <br /> <span className="text-white">YOUR BEST FRIEND?</span>
          </h2>
          <p className="text-xl md:text-2xl text-black/80 font-bold leading-relaxed mb-12 max-w-2xl">
            The streets of Bijapur are full of perfectly healthy, beautiful, and loving Indies waiting for a family to call their own. Open your heart and home today.
          </p>
          
          <button 
            onClick={() => nav("/adopt")} 
            className="px-12 py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-lg hover:scale-105 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 group shadow-2xl"
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