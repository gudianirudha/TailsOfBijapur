import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, AlertCircle, X, Phone, MessageCircle, MapPin, Info, PawPrint, ArrowRight } from "lucide-react";

// ================= MASONRY GRID COMPONENT =================
function MasonryPuppyGrid({ puppies, onSelect }) {
  const containerRef = useRef(null);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(3);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Failsafe: Ensure puppies is always an array to prevent .forEach crashes
  const safePuppies = Array.isArray(puppies) ? puppies : [];
  const colArrays = Array.from({ length: columns }, () => []);
  
  safePuppies.forEach((puppy, i) => {
    colArrays[i % columns].push(puppy);
  });

  return (
    <div ref={containerRef} className="flex gap-6 items-start w-full">
      {colArrays.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-6 w-full flex-1">
          {col.map((puppy) => (
            <div
              key={puppy._id}
              onClick={() => onSelect(puppy)}
              className="group cursor-pointer relative rounded-[2rem] overflow-hidden bg-[#151515] border border-white/5 hover:border-orange-500/50 transition-colors"
            >
              {puppy.imageUrl ? (
                <img
                  src={puppy.imageUrl}
                  alt={puppy.name}
                  className="w-full h-auto object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700 ease-out"
                  onError={(e) => { e.target.style.display='none' }}
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-white/10"><Camera size={48}/></div>
              )}
              
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white leading-none mb-2">
                      {puppy.name || "Unknown"}
                    </h3>
                    <p className="text-orange-500 font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                      <MapPin size={12} /> {puppy.location}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white font-bold text-xs uppercase tracking-widest shrink-0">
                    {puppy.age || "N/A"}
                  </div>
                </div>

                <div className="overflow-hidden h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500">
                  <p className="text-gray-400 text-sm font-medium leading-relaxed pt-4 border-t border-white/10 line-clamp-3">
                    {puppy.description || "A resilient soul waiting for a forever home. Click to view full medical and rescue details."}
                  </p>
                  <span className="inline-block mt-4 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    Review Intel <AlertCircle size={14} className="text-orange-500"/>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ================= MAIN COMPONENT =================
export default function Adopt() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '', age: '', gender: 'Female', vaccinated: 'Unknown', location: '', reportername: '', phone: '', description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  const [approvedPuppies, setApprovedPuppies] = useState([]);
  const [selectedPuppy, setSelectedPuppy] = useState(null);
  const fileInputRef = useRef(null);

  // ================= LOGIC =================
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return setError('Please upload an image file.');
      if (file.size > 5 * 1024 * 1024) return setError('Image must be smaller than 5MB.');
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  }

  // Failsafe: Added null check
  function normalizePhone(num) {
    if (!num) return "";
    return num.replace(/\D/g, '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!imageFile) return setError('Please upload a picture of the puppy.');
    if (!form.location.trim()) return setError('Please provide a location.');
    if (!form.phone.trim()) return setError('Please provide a contact number.');
    if (!consent) return setError('Please confirm you agree to be contacted for verification.');

    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(form).forEach(key => payload.append(key, key === 'phone' ? normalizePhone(form[key]) : form[key]));
      payload.append('image', imageFile);

      // PROD UPDATE: Removed http://localhost:4000
      const res = await fetch('/api/adopt-submissions', {
        method: 'POST',
        body: payload,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Submission failed due to network error.");
      }

      setSuccess('Mission accomplished. Submission received and pending review.');
      setForm({ name: '', age: '', gender: 'Female', vaccinated: 'Unknown', location: '', reportername: '', phone: '', description: '' });
      setImageFile(null);
      setPreview(null);
      setConsent(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Failsafe API Fetching
  useEffect(() => {
    // PROD UPDATE: Removed http://localhost:4000
    fetch("/api/approved-puppies")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setApprovedPuppies(data);
        } else {
          setApprovedPuppies([]); // Prevent map crash if server returns object
        }
      })
      .catch(err => {
        console.error("Failed to fetch puppies", err);
        setApprovedPuppies([]); // Fallback to empty state
      });
  }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setSelectedPuppy(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Failsafe: Ensure body scrolling is restored if component unmounts
  useEffect(() => {
    document.body.style.overflow = selectedPuppy ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedPuppy]);

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] selection:bg-orange-500 selection:text-white min-h-screen pb-24">
      
      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="max-w-4xl">
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-6 block">
              / Adopt & Rehome
            </span>
            <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-8">
              FIND A <br />
              <span className="text-transparent stroke-text italic">FOREVER.</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl">
              Be the reason a life is saved. Whether you are looking to adopt a companion or safely rehome a rescued puppy, our verified network makes it happen.
            </p>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
             <a href="#approved" className="flex-1 lg:flex-none text-center px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all">
               View Adoptions
             </a>
             <a href="#submit" className="flex-1 lg:flex-none text-center px-8 py-4 border-2 border-white/20 font-black uppercase tracking-widest text-xs rounded-full hover:border-white transition-all">
               List a Puppy
             </a>
          </div>
        </div>
      </section>

      {/* ================= INDIES PHILOSOPHY LINK ================= */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 mb-20">
        <button 
          onClick={() => nav("/indies")}
          className="w-full bg-[#111] border border-white/10 hover:border-orange-500/50 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-3xl rounded-full group-hover:bg-orange-600/10 transition-colors" />

          <div className="flex items-center gap-8 relative z-10">
            <div className="bg-orange-600/20 p-5 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
              <PawPrint size={40} /> 
            </div>
            <div className="text-left">
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                Why Choose an <span className="text-orange-500 text-transparent stroke-text-small">Indie?</span>
              </h3>
              <p className="text-gray-500 font-medium text-base md:text-lg mt-1">
                Discover the resilience and unwavering loyalty of India's native masterpiece.
              </p>
            </div>
          </div>

          <div className="mt-8 md:mt-0 flex items-center gap-3 bg-white/5 group-hover:bg-orange-600 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all relative z-10">
            Read Philosophy <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* SPLIT SECTION: GUIDELINES & FORM */}
      <section className="py-12 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Protocol & <br /><span className="text-orange-600">Verification.</span></h2>
              <div className="h-1 w-20 bg-orange-600 mb-8" />
              <p className="text-gray-400 leading-relaxed text-lg">
                We prioritize safety above all else. To prevent illegal breeding or unsafe adoptions, every submission undergoes a strict vetting process.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { title: "Verification Call", text: "Our team will contact the reporter to verify the puppy's location and health status." },
                { title: "Clear Documentation", text: "A recent, clear photograph and accurate medical details (if known) are mandatory." },
                { title: "Privacy First", text: "Contact details are only displayed on the public board after our team approves the listing." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <CheckCircle2 className="text-orange-600 shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="aspect-video w-full rounded-[2rem] overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
               <img src="/images/adopt/banner.png" alt="Rescue dogs" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-orange-600/20 mix-blend-overlay" />
            </div>
          </div>

          <div id="submit" className="lg:col-span-7 bg-[#111] border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="mb-10">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Submit Listing</h3>
              <p className="text-gray-500 text-sm mt-2 font-mono tracking-widest uppercase">Enter accurate details for rapid verification.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="p-6 border border-dashed border-white/20 rounded-2xl bg-[#151515] hover:border-orange-500/50 transition-colors">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center py-6 text-gray-500">
                      <Camera size={40} className="mb-3 opacity-50" />
                      <span className="font-bold text-sm uppercase tracking-widest">Upload Intel (Photo)</span>
                      <span className="text-xs mt-2 font-mono">JPG/PNG, max 5MB</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" required />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Puppy Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium" placeholder="e.g. Max" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Age</label>
                  <input name="age" value={form.age} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium" placeholder="e.g. 2 Months" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none font-medium">
                    <option>Female</option>
                    <option>Male</option>
                    <option>Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Vaccination</label>
                  <select name="vaccinated" value={form.vaccinated} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none font-medium">
                    <option>Vaccinated</option>
                    <option>Not vaccinated</option>
                    <option>Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location <span className="text-orange-500">*</span></label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium" placeholder="Area or Landmark in Bijapur" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your Name</label>
                  <input name="reportername" value={form.reportername} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium" placeholder="First Last" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Contact Number <span className="text-orange-500">*</span></label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium" placeholder="+91" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Medical/Behavior Notes</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors font-medium" placeholder="Any injuries, temperament, etc." />
              </div>

              <div className="flex items-start gap-3 bg-orange-600/10 p-4 rounded-xl border border-orange-600/20">
                <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-5 h-5 accent-orange-600 cursor-pointer" />
                <label htmlFor="consent" className="text-sm text-orange-200 cursor-pointer font-medium leading-snug">I consent to being contacted by Tails of Bijapur volunteers to verify this information.</label>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-6 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50">
                {submitting ? 'Transmitting...' : 'Submit'}
              </button>

              <div aria-live="polite" className="text-center font-bold text-sm uppercase tracking-widest">
                {error && <p className="text-red-500 flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</p>}
                {success && <p className="text-green-500 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {success}</p>}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ================= APPROVED PUPPIES MASONRY GRID ================= */}
      <section id="approved" className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto border-t border-white/10 mt-12">
        <div className="mb-16">
          <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 block">/ Active Roster</span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
            READY FOR <span className="text-white/20">HOME.</span>
          </h2>
        </div>

        {approvedPuppies.length === 0 ? (
          <div className="bg-[#111] border border-white/5 rounded-3xl p-16 text-center">
             <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
             <p className="text-2xl font-bold text-gray-500 uppercase tracking-tighter">No Active Listings</p>
             <p className="text-gray-600 mt-2 font-medium">Check back soon or submit a rescue above.</p>
          </div>
        ) : (
          <MasonryPuppyGrid puppies={approvedPuppies} onSelect={setSelectedPuppy} />
        )}
      </section>

      {/* DETAILS MODAL */}
      {selectedPuppy && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[200] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPuppy(null); }}
        >
          <div className="bg-[#111] border border-white/10 rounded-[2rem] max-w-5xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <button onClick={() => setSelectedPuppy(null)} className="absolute top-6 right-6 z-10 text-white hover:text-orange-500 bg-white/10 backdrop-blur p-2 rounded-full transition-colors border border-white/20">
              <X size={24} />
            </button>

            <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-[#050505]">
              {selectedPuppy.imageUrl ? (
                <img src={selectedPuppy.imageUrl} alt={selectedPuppy.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600"><Camera size={48} /></div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto hide-scrollbar">
              <span className="inline-block px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest rounded-full w-fit mb-4 border border-green-500/20 flex items-center gap-2">
                <CheckCircle2 size={14} /> Verified Listing
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-8 leading-none">
                {selectedPuppy.name || "Unnamed"}
              </h2>

              <div className="space-y-4 mb-8">
                {[
                  { label: "Age", val: selectedPuppy.age },
                  { label: "Gender", val: selectedPuppy.gender },
                  { label: "Vaccinated", val: selectedPuppy.vaccinated },
                  { label: "Location", val: selectedPuppy.location },
                  { label: "Reporter", val: selectedPuppy.reportername }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">{item.label}</span>
                    <span className="text-white font-medium">{item.val || "N/A"}</span>
                  </div>
                ))}
              </div>

              {selectedPuppy.description && (
                <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={14}/> Medical / Rescue Notes</p>
                  <p className="text-gray-300 text-sm leading-relaxed font-medium">{selectedPuppy.description}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-white/5">
                <a href={`tel:${selectedPuppy.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black py-5 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                  <Phone size={18} /> Initiate Call
                </a>
                <a href={`https://wa.me/${selectedPuppy.phone}?text=Hi,%20I'm%20interested%20in%20adopting%20${selectedPuppy.name || "this puppy"}%20listed%20on%20Tails%20of%20Bijapur.`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-5 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                  <MessageCircle size={18} /> WhatsApp Comm
                </a>
              </div>
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
        .stroke-text-small {
          -webkit-text-stroke: 1px rgba(234, 88, 12, 0.5);
          color: transparent;
        }
        input[type="file"]::file-selector-button {
          margin-right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          border: none;
          background-color: #ea580c;
          color: white;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        input[type="file"]::file-selector-button:hover {
          background-color: #c2410c;
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