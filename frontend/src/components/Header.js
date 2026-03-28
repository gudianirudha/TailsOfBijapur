import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "The Mission", path: "/about" },
    { name: "Adopt", path: "/adopt" },
    { name: "Stories", path: "/stories" },
    { name: "Volunteer", path: "/volunteer" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        isScrolled ? "py-4 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10" : "py-8 bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group relative z-[101]">
          <div className="bg-orange-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-orange-600/20">
            <Heart size={20} fill="white" className="text-white" />
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter text-white flex flex-col leading-[0.8]">
            Tails of <span className="text-orange-500 italic font-serif lowercase text-xl">Bijapur</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-xs font-black uppercase tracking-[0.2em] text-gray-300 hover:text-orange-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-white/20 mx-2" />

          {/* EMERGENCY STATUS */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 cursor-help" title="Rescue Team is currently on ground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Rescue Active</span>
          </div>

          <button 
            onClick={() => nav("/donate")}
            className="px-8 py-3 bg-orange-600 hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            Donate
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-white relative z-[101]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-8 z-[100] transition-transform duration-500 md:hidden ${isOpen ? "translate-y-0" : "-translate-y-full"}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            onClick={() => setIsOpen(false)}
            className="text-4xl font-black uppercase tracking-tighter text-white hover:text-orange-500 transition-colors"
          >
            {link.name}
          </Link>
        ))}
        <button 
          onClick={() => { nav("/donate"); setIsOpen(false); }}
          className="mt-8 px-12 py-4 bg-orange-600 text-white font-black uppercase tracking-widest rounded-full"
        >
          Donate Now
        </button>
      </div>
    </nav>
  );
}