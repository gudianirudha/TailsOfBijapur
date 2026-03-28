import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] pt-32 pb-10 px-6 border-t border-white/10">
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
               {[Instagram, Twitter, Facebook].map((Icon, i) => (
                 <a key={i} href="/" className="p-5 border-2 border-white/20 rounded-full text-white hover:bg-white hover:text-black hover:border-white transition-all hover:scale-110">
                   <Icon size={24} />
                 </a>
               ))}
            </div>
          </div>

          {/* QUICK LINKS GRID */}
          <div className="md:col-span-5 grid grid-cols-2 gap-12 pt-4">
            <div className="space-y-8">
              <p className="text-orange-600 font-black uppercase text-sm tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full block"></span> Nav
              </p>
              <ul className="space-y-5 text-gray-400 font-bold uppercase text-lg tracking-tighter">
                <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Our Story</Link></li>
                <li><Link to="/adopt" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Adoptable</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Report Crisis</Link></li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <p className="text-orange-600 font-black uppercase text-sm tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full block"></span> Action
              </p>
              <ul className="space-y-5 text-gray-400 font-bold uppercase text-lg tracking-tighter">
                <li><Link to="/donate" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Financial Aid</Link></li>
                <li><Link to="/volunteer" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Volunteer Ground</Link></li>
                <li><Link to="/partners" className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Brand Sponsors</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM STRIP */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.4em]">
            &copy; {currentYear} TAILS OF BIJAPUR &bull; FOR THE VOICELESS
          </div>
          
          <div className="flex gap-8">
            <button className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-all">
              Privacy Protocol
            </button>
            <button className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-all">
              Terms of Care
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}