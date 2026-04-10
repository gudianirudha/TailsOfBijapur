import React from "react";
import { Stethoscope, MapPin, PhoneCall, Map, AlertTriangle, ArrowRight, Navigation } from "lucide-react";

// ================= DATA =================
const doctors = [
  {
    name: "Dr Salman Mustafa",
    clinic: "Pet Health Partners Veterinary Clinic",
    phone: "08618592163",
    address: "Bedrekar Complex Near Mediplus Medical Shop Bagalkot Road, Vijayapura, Karnataka 586109",
    mapLink: "https://maps.app.goo.gl/V3z8fpCUiQ63CFjw7",
  },
  {
    name: "Dr Sohail Bademgol",
    clinic: "Bijapur Pets Mart",
    phone: "9901598754",
    address: "Ainapur Cross, Main Road, Siddasiri Downstairs, Jala Nagar, Vijayapura, Karnataka 586101",
    mapLink: "https://maps.app.goo.gl/XXpGFWq2UP1T2gms8",
  },
  {
    name: "Dr Ashok Walikar",
    clinic: "Arshit's Pet Clinic",
    phone: "08217055847",
    address: "Ashram Rd, Opposite Blossom Photo Studio Neela Nagar, Vijayapura, Karnataka 586103",
    mapLink: "https://maps.app.goo.gl/dypfh6nwRJ4ye1JG7",
  },
  {
    name: "Dr Mallikarjun Hiremath",
    clinic: "Hiremath's Pet Clinic & Veterinary Diagnostic Centre",
    phone: "09060477134",
    address: "Vivek Nagar W, Jala Nagar, Vijayapura, Karnataka 586109",
    mapLink: "https://maps.app.goo.gl/XHLCfCugtqrdwpjG9",
  },
  {
    name: "Dr Prashant Bellundagi",
    clinic: "Dreamline Pet Clinic-DPC",
    phone: "08095516189",
    address: "Banjara Road, Near Dr.Ukkali Children Hospital Road Banjara Nagar Vijayapura Karnataka 586103",
    mapLink: "https://maps.app.goo.gl/LjKUCJD3CMUc3d766",
  },

];

const ALL_VETS_MAP = "https://www.google.com/maps/search/?api=1&query=Veterinary+clinic+in+Vijayapura";

// ================= COMPONENT =================
export default function Doctors() {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-20 overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="pt-40 pb-16 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 border-b border-white/10 pb-16">
          
          <div className="max-w-4xl">
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Network Active
            </span>
            <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-6">
              VETERINARY <br />
              <span className="text-transparent stroke-text italic">SUPPORT.</span>
            </h1>
          </div>

          <div className="max-w-sm w-full">
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-8">
              Verified veterinary professionals operating in Vijayapura. Time is critical—contact the nearest clinic immediately in an emergency.
            </p>
            <a
              href={ALL_VETS_MAP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-8 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all group"
            >
              <span className="flex items-center gap-3"><Map size={18} /> Open Master Map</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

        </div>
      </section>

      {/* ================= DOCTORS GRID ================= */}
      <section className="py-12 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doc, index) => (
            <div
              key={index}
              className="bg-[#111] border border-white/5 hover:border-orange-500/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col transition-colors group relative overflow-hidden"
            >
              {/* Background Glow on Hover */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Icon & Clinic Name */}
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="bg-white/5 p-4 rounded-2xl text-orange-500">
                  <Stethoscope size={28} />
                </div>
                <div className="text-right max-w-[60%]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Clinic</span>
                  <p className="text-sm font-bold text-orange-400 uppercase tracking-tight leading-tight">
                    {doc.clinic}
                  </p>
                </div>
              </div>

              {/* Doctor Name */}
              <div className="mb-6 relative z-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                  {doc.name}
                </h2>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 mb-10 relative z-10">
                <MapPin size={18} className="text-gray-500 shrink-0 mt-1" />
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  {doc.address}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto grid grid-cols-2 gap-4 relative z-10">
                <a
                  href={`tel:${doc.phone.replace(/\D/g, "")}`}
                  className="flex items-center justify-center gap-2 px-4 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <PhoneCall size={16} /> Call
                </a>
                <a
                  href={doc.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-4 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  <Navigation size={16} /> Route
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= DISCLAIMER ================= */}
      <section className="px-4 md:px-12 max-w-[1400px] mx-auto mt-12">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <AlertTriangle size={24} className="text-orange-500 shrink-0" />
          <p className="text-xs text-orange-200/80 font-bold uppercase tracking-[0.15em] leading-relaxed max-w-3xl">
            <strong>Disclaimer:</strong> Tails of Bijapur is strictly a volunteer network and is not legally affiliated with any of the clinics listed above. Details are provided as a public utility to help animals receive rapid medical care.
          </p>
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