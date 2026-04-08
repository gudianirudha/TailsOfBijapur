import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Check, X, PawPrint, Users, ShieldAlert, Phone, Mail } from "lucide-react";

export default function Admin() {
  const [adoptions, setAdoptions] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchAdoptions(token);
    fetchVolunteers(token);
  }, []);

  // ================= FETCH LOGIC =================
  async function fetchAdoptions(token) {
    try {
      const res = await fetch("http://localhost:4000/api/admin/pending", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      setAdoptions(data);
    } catch (err) {
      console.error("Failed to fetch adoptions:", err);
    }
  }

  async function fetchVolunteers(token) {
    try {
      // Pointing to the newly created secure admin route in server.js!
      const res = await fetch("http://localhost:4000/api/admin/volunteers", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      
      const pendingVolunteers = data.filter(v => v.status !== "approved" && v.status !== "rejected");
      setVolunteers(pendingVolunteers); 
    } catch (err) {
      console.error("Failed to fetch volunteers:", err);
    }
  }

  // ================= UPDATE LOGIC =================
  async function updateAdoption(id, status) {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:4000/api/admin/adoptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Failed to update adoption status");
        return;
      }
      setAdoptions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function updateVolunteer(id, status) {
    const token = localStorage.getItem("adminToken");
    try {
      // Pointing to the newly created secure admin route in server.js!
      const res = await fetch(`http://localhost:4000/api/admin/volunteers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) {
        alert("Failed to update volunteer status");
        return;
      }
      setVolunteers((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
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