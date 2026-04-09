import React, { useState, useEffect } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
// 1. Removed brand icons from lucide-react
import { Menu, X, Heart, ArrowUpRight } from "lucide-react"; 
// 2. Added FaInstagram, FaTwitter, FaFacebook to react-icons
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa"; 
import ScrollToTopButton from "./ScrollToTopButton";

// ==========================================
// 1. THE HIGH-OCTANE HEADER (NAV)
// ==========================================
const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Adopt", path: "/adopt" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "Awareness", path: "/awareness" },
    { name: "Support", path: "/doctors" },
    { name: "Impact", path: "/impact" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        isScrolled ? "py-4 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10" : "py-8 bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        
{/* LOGO: ARCHITECTURAL MONOGRAM */}
        <Link to="/" className="group flex items-center gap-4 z-[101]">
          {/* Geometric Box */}
          <div className="relative w-12 h-12 flex items-center justify-center border border-white/20 bg-[#050505] overflow-hidden group-hover:border-orange-500 transition-colors duration-500">
            {/* Hover Fill Effect */}
            <div className="absolute inset-0 bg-orange-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="font-black text-2xl tracking-tighter text-white relative z-10 group-hover:text-orange-500 transition-colors">
              Tb<span className="text-orange-500 group-hover:text-white">.</span>
            </span>
            {/* Brutalist Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-orange-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500" />
          </div>
          
          {/* Typography */}
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-black uppercase tracking-tighter leading-none text-white mb-1">
              Tails of
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] leading-none text-gray-500 group-hover:text-orange-400 transition-colors">
              Bijapur
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-8">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path}
                className={({ isActive }) => `text-xs font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
              >
                {link.name}
              </NavLink>
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

        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-white relative z-[101]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-8 z-[100] transition-transform duration-500 md:hidden ${isOpen ? "translate-y-0" : "-translate-y-full"}`}>
        {navLinks.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path} 
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `text-4xl font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-orange-500' : 'text-white hover:text-orange-500'}`}
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};


// ==========================================
// 2. THE STREET POSTER FOOTER
// ==========================================
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] pt-32 pb-10 px-6 border-t border-white/10 mt-auto">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
          
          {/* BIG CALL TO ACTION */}
          <div className="md:col-span-7">
            <h2 className="text-6xl md:text-[6vw] font-black tracking-tighter leading-[0.85] text-white mb-10">
              JOIN THE <br /> <span className="text-orange-600 italic">REVOLUTION.</span>
            </h2>
            <p className="text-gray-400 text-2xl max-w-lg mb-12 italic leading-snug">
              &quot;We don&apos;t just feed dogs. We give them back the dignity the world took away.&quot;
            </p>
            <div className="flex gap-4">
               {/* 3. Switched mapped array to use React Icons */}
               {[FaInstagram, FaTwitter, FaFacebook].map((Icon, i) => (
                 <a key={i} href="https://www.instagram.com/tailsofbijapur" target="_blank" rel="noreferrer" className="p-5 border-2 border-white/20 rounded-full text-white hover:bg-white hover:text-black hover:border-white transition-all hover:scale-110">
                   <Icon size={24} />
                 </a>
               ))}
            </div>
          </div>

          {/* QUICK LINKS GRID */}
          <div className="md:col-span-5 grid grid-cols-2 gap-12 pt-4">
            
            {/* Column 1: Nav */}
            <div className="space-y-8">
              <p className="text-orange-600 font-black uppercase text-sm tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full block"></span> Nav
              </p>
              <ul className="space-y-5 text-gray-400 font-bold uppercase text-lg tracking-tighter">
                <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Our Story</Link></li>
                <li><Link to="/adopt" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Adoptable Rescues</Link></li>
                <li><Link to="/indies" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Indies Philosophy</Link></li>
              </ul>
            </div>
            
            {/* Column 2: Action */}
            <div className="space-y-8">
              <p className="text-orange-600 font-black uppercase text-sm tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full block"></span> Action
              </p>
              <ul className="space-y-5 text-gray-400 font-bold uppercase text-lg tracking-tighter">
                <li><Link to="/donate" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Financial Aid</Link></li>
                <li><Link to="/volunteer" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Volunteer Ground</Link></li>
                <li><Link to="/awareness" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Public Awareness</Link></li>
              </ul>
            </div>
            
          </div>
          </div>

        {/* BOTTOM STRIP */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex flex-col md:flex-row gap-2">
            <span>&copy; {currentYear} TAILS OF BIJAPUR &bull; FOR THE VOICELESS.</span>
            <span>DESIGNED BY <a href="https://www.linkedin.com/in/ananya-kulkarni-234459370" target="_blank" rel="noreferrer" className="text-orange-600 hover:text-white transition-colors">ANANYA KULKARNI</a></span>
          </div>
          
          <div className="flex gap-6 text-gray-500 text-xs">
             <div className="flex items-center gap-2"><FaMapMarkerAlt /> Bijapur, Karnataka</div>
             <div className="flex items-center gap-2"><FaPhoneAlt /> +91 81230 38270</div>
             <div className="flex items-center gap-2"><FaEnvelope /> tailsofbijapur@gmail.com</div>
          </div>
        </div>

      </div>
    </footer>
  );
};


// ==========================================
// 3. THE LAYOUT WRAPPER
// ==========================================
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#F5F5F5]">
      <Nav />
      {/* Removed container/p-6 margins to allow Home.js hero to go full screen */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}