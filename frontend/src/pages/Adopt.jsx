import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, AlertCircle, X, Phone, MessageCircle, MapPin, Info } from "lucide-react";

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

  // ================= LOGIC (Unchanged) =================
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

  function normalizePhone(num) {
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

      const res = await fetch('http://localhost:4000/api/adopt-submissions', {
        method: 'POST',
        body: payload,
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("SERVER RESPONSE:", text);
        throw new Error("Submission failed");
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

  useEffect(() => {
    fetch("http://localhost:4000/api/approved-puppies")
      .then(res => res.json())
      .then(data => setApprovedPuppies(data))
      .catch(err => console.error("Failed to fetch puppies", err));
  }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setSelectedPuppy(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedPuppy ? "hidden" : "auto";
  }, [selectedPuppy]);

  // ================= RENDER =================
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

      {/* SPLIT SECTION: GUIDELINES & FORM */}
      <section className="py-12 px-4 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEFT: Guidelines (Editorial Style) */}
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

            {/* Aesthetic Image box */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
               <img src="/images/adopt/banner.png" alt="Rescue dogs" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none' }} />
               <div className="absolute inset-0 bg-orange-600/20 mix-blend-overlay" />
            </div>
          </div>

          {/* RIGHT: The Form (Dark Mode Terminal Style) */}
          <div id="submit" className="lg:col-span-7 bg-[#111] border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="mb-10">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Submit Listing</h3>
              <p className="text-gray-500 text-sm mt-2">Enter accurate details for rapid verification.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              {/* Photo Upload */}
              <div className="p-6 border border-dashed border-white/20 rounded-2xl bg-[#151515] hover:border-orange-500/50 transition-colors">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center py-6 text-gray-500">
                      <Camera size={40} className="mb-3 opacity-50" />
                      <span className="font-bold text-sm uppercase tracking-widest">Upload Intel (Photo)</span>
                      <span className="text-xs mt-2">JPG/PNG, max 5MB</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" required />
                </label>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Puppy Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="e.g. Max" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Age</label>
                  <input name="age" value={form.age} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="e.g. 2 Months" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none">
                    <option>Female</option>
                    <option>Male</option>
                    <option>Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Vaccination</label>
                  <select name="vaccinated" value={form.vaccinated} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none">
                    <option>Vaccinated</option>
                    <option>Not vaccinated</option>
                    <option>Unknown</option>
                  </select>
                </div>
              </div>

              {/* Full Width Inputs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location <span className="text-red-500">*</span></label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="Area or Landmark in Bijapur" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your Name</label>
                  <input name="reportername" value={form.reportername} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="First Last" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Contact Number <span className="text-red-500">*</span></label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="+91" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Medical/Behavior Notes</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full bg-[#151515] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors" placeholder="Any injuries, temperament, etc." />
              </div>

              <div className="flex items-start gap-3 bg-orange-600/10 p-4 rounded-xl border border-orange-600/20">
                <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-5 h-5 accent-orange-600 cursor-pointer" />
                <label htmlFor="consent" className="text-sm text-orange-200 cursor-pointer">I consent to being contacted by Tails of Bijapur volunteers to verify this information.</label>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50">
                {submitting ? 'Transmitting...' : 'Submit to Database'}
              </button>

              {/* Status Messages */}
              <div aria-live="polite" className="text-center font-bold text-sm uppercase tracking-widest">
                {error && <p className="text-red-500 flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</p>}
                {success && <p className="text-green-500 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {success}</p>}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ================= APPROVED PUPPIES GRID ================= */}
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
             <p className="text-gray-600 mt-2">Check back soon or submit a rescue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {approvedPuppies.map((puppy) => (
              <div
                key={puppy._id}
                onClick={() => setSelectedPuppy(puppy)}
                className="group cursor-pointer relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-[#151515]"
              >
                {puppy.imageUrl && (
                  <img
                    src={puppy.imageUrl}
                    alt={puppy.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Card Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-1">{puppy.name || "Unknown"}</h3>
                     <p className="text-orange-500 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                       <MapPin size={14} /> {puppy.location}
                     </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white font-bold text-sm">
                     {puppy.age || "Age N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= DETAILS MODAL ================= */}
      {selectedPuppy && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[200] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPuppy(null); }}
        >
          <div className="bg-[#111] border border-white/10 rounded-[2rem] max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
            
            <button onClick={() => setSelectedPuppy(null)} className="absolute top-6 right-6 z-10 text-white/50 hover:text-white bg-black/50 p-2 rounded-full transition-colors">
              <X size={24} />
            </button>

            {/* Left: Image */}
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
              {selectedPuppy.imageUrl ? (
                <img src={selectedPuppy.imageUrl} alt={selectedPuppy.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#151515] flex items-center justify-center text-gray-600"><Camera size={48} /></div>
              )}
            </div>

            {/* Right: Data */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest rounded-full w-fit mb-4 border border-orange-500/20">
                Verified Listing
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-8">
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
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={14}/> Notes</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedPuppy.description}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <a href={`tel:${selectedPuppy.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                  <Phone size={16} /> Call
                </a>
                <a href={`https://wa.me/${selectedPuppy.phone}?text=Hi,%20I'm%20interested%20in%20adopting%20${selectedPuppy.name || "this puppy"}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                  <MessageCircle size={16} /> WhatsApp
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
      `}} />
    </div>
  );
}