import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Check, X, PawPrint, Users, ShieldAlert, Phone, Mail } from "lucide-react";

export default function Admin() {
  const [adoptions, setAdoptions] = useState([]);
  const [adoptionInterests, setAdoptionInterests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchAdoptions(token);
    fetchAdoptionInterests(token);
    fetchVolunteers(token);
  }, [navigate]);

  // ================= FETCH LOGIC =================
  async function fetchAdoptions(token) {
    try {
      const res = await fetch("/api/admin/pending", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      setAdoptions(data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to fetch adoptions");
      }
    }
  }

  async function fetchAdoptionInterests(token) {
    try {
      const res = await fetch("/api/admin/adoption-interests", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch adoption enquiries");
      setAdoptionInterests(await res.json());
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to fetch adoption enquiries");
      }
    }
  }

  async function fetchVolunteers(token) {
    try {
      const res = await fetch("/api/admin/volunteers?status=pending", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      setVolunteers(data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to fetch volunteers");
      }
    }
  }

  // ================= UPDATE LOGIC =================
  async function updateAdoption(id, status) {
    const token = sessionStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/adoptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Failed to update adoption status");
        return;
      }
      setAdoptions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Update adoption error");
      }
    }
  }

  async function updateVolunteer(id, status) {
    const token = sessionStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Failed to update volunteer status");
        return;
      }
      setVolunteers((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Update volunteer error");
      }
    }
  }

  async function markAdoptionInterestContacted(id) {
    const token = sessionStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/adoption-interests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        credentials: "include",
        body: JSON.stringify({ status: "contacted" }),
      });
      if (!res.ok) {
        alert("Failed to update adoption enquiry");
        return;
      }
      setAdoptionInterests((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Update adoption enquiry error");
      }
    }
  }

  function logout() {
    sessionStorage.removeItem("adminToken");
    navigate("/admin-login");
  }

  // ================= RENDER =================
  return (
    <div className="bg-[#050505] text-[#F5F5F5] min-h-screen pb-24 font-sans selection:bg-orange-500 selection:text-white">
      
      <div className="max-w-[1600px] mx-auto px-6 pt-12 md:pt-20 space-y-20">

        {/* ================= DASHBOARD HEADER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-12">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-sm mb-4 flex items-center gap-3">
              <ShieldAlert size={16} /> Restricted Access
            </span>
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2">
              COMMAND <br /><span className="text-gray-600">CENTER.</span>
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 bg-white/5 hover:bg-red-500/10 text-white hover:text-red-500 border border-white/10 hover:border-red-500/20 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all group shrink-0"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            Terminate Session
          </button>
        </div>

        {/* ================= ADOPTIONS SECTION ================= */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-orange-600/20 p-3 rounded-xl text-orange-500">
              <PawPrint size={24} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Pending Rescues</h2>
          </div>

          {adoptions.length === 0 ? (
            <div className="bg-[#111] border border-dashed border-white/10 rounded-[3rem] p-16 md:p-24 text-center">
              <ShieldAlert className="mx-auto text-gray-700 mb-6" size={56} />
              <p className="text-3xl font-black text-gray-500 uppercase tracking-tighter">Queue Clear</p>
              <p className="text-gray-600 mt-2 font-medium text-lg">No pending adoption requests requiring authorization.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {adoptions.map((item) => (
                <div key={item._id} className="bg-[#111] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col group hover:border-white/20 transition-colors">
                  {/* Image Header */}
                  {item.imageUrl ? (
                    <div className="w-full h-64 bg-[#151515] relative overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{item.name || "Unnamed"}</h3>
                        <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {item.age || "N/A"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-orange-600/20 to-transparent p-6 flex items-end">
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{item.name || "Unnamed"}</h3>
                    </div>
                  )}

                  {/* Data Body */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6">
                      <div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Gender</p>
                        <p className="text-white font-medium text-sm">{item.gender || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Vaccinated</p>
                        <p className="text-white font-medium text-sm">{item.vaccinated || "Unknown"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Location</p>
                        <p className="text-white font-medium text-sm">{item.location || "N/A"}</p>
                      </div>
                    </div>

                    <div className="bg-[#151515] border border-white/5 rounded-xl p-4 mb-6">
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Reporter Details</p>
                      <p className="text-white font-medium text-sm flex items-center gap-2 mb-2"><Users size={14} className="text-orange-500"/> {item.reportername || "Anonymous"}</p>
                      <p className="text-white font-medium text-sm flex items-center gap-2"><Phone size={14} className="text-orange-500"/> {item.phone || "N/A"}</p>
                    </div>

                    {item.description && (
                      <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1 italic border-l-2 border-white/10 pl-4">
                        "{item.description}"
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <button onClick={() => updateAdoption(item._id, "approved")} className="flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 px-4 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                        <Check size={16} /> Approve
                      </button>
                      <button onClick={() => updateAdoption(item._id, "rejected")} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= ADOPTION INTEREST SECTION ================= */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-orange-600/20 p-3 rounded-xl text-orange-500">
              <PawPrint size={24} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Potential Adopters</h2>
          </div>

          {adoptionInterests.length === 0 ? (
            <div className="bg-[#111] border border-dashed border-white/10 rounded-[3rem] p-12 text-center">
              <p className="text-xl font-bold text-gray-500">No new adoption enquiries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {adoptionInterests.map((item) => (
                <article key={item._id} className="bg-[#111] border border-white/10 rounded-[2rem] p-7 md:p-8 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                        Interested in {item.puppyName || "a puppy"}
                      </p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{item.name}</h3>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
                    <a className="flex items-center gap-2 hover:text-orange-400" href={`mailto:${item.email}`}>
                      <Mail size={15} /> {item.email}
                    </a>
                    <a className="flex items-center gap-2 hover:text-orange-400" href={`tel:${item.phone}`}>
                      <Phone size={15} /> {item.phone}
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <p className="rounded-xl bg-white/5 p-3 text-gray-400">Area <span className="mt-1 block font-semibold text-white">{item.city}</span></p>
                    <p className="rounded-xl bg-white/5 p-3 text-gray-400">Home <span className="mt-1 block font-semibold capitalize text-white">{item.homeType}</span></p>
                    <p className="rounded-xl bg-white/5 p-3 text-gray-400">Other pets <span className="mt-1 block font-semibold text-white">{item.hasPets ? "Yes" : "No"}</span></p>
                    <p className="rounded-xl bg-white/5 p-3 text-gray-400">Dog experience <span className="mt-1 block font-semibold text-white">{item.experience}</span></p>
                  </div>

                  <button
                    onClick={() => markAdoptionInterestContacted(item._id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-orange-400 transition-colors hover:bg-orange-500 hover:text-white"
                  >
                    <Check size={16} /> Mark contacted
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ================= VOLUNTEERS SECTION ================= */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-orange-600/20 p-3 rounded-xl text-orange-500">
              <Users size={24} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Volunteer Recruits</h2>
          </div>

          {volunteers.length === 0 ? (
            <div className="bg-[#111] border border-dashed border-white/10 rounded-[3rem] p-16 md:p-24 text-center">
              <ShieldAlert className="mx-auto text-gray-700 mb-6" size={56} />
              <p className="text-3xl font-black text-gray-500 uppercase tracking-tighter">No Active Applications</p>
              <p className="text-gray-600 mt-2 font-medium text-lg">The volunteer queue is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {volunteers.map((item) => (
                <div key={item._id} className="bg-[#111] border border-white/10 rounded-[2rem] p-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between group hover:border-white/20 transition-all">
                  
                  <div className="space-y-4 flex-1">
                    <div>
                      <span className="bg-orange-500/20 text-orange-500 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                        Role: {item.role || "General"}
                      </span>
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{item.name || "Unknown Applicant"}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                        <Mail size={16} className="text-gray-600"/> {item.email || "No email provided"}
                      </p>
                      {item.phone && (
                        <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                          <Phone size={16} className="text-gray-600"/> {item.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0">
                    <button onClick={() => updateVolunteer(item._id, "approved")} className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                      <Check size={16} /> Authorize
                    </button>
                    <button onClick={() => updateVolunteer(item._id, "rejected")} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                      <X size={16} /> Deny
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}