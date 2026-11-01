import React, { useState } from "react";

export default function Contact() {
  const [incident, setIncident] = useState({
    rescuerName: "",
    rescuerPhone: "",
    animalType: "",
    size: "",
    injury: "",
    location: "",
    files: null,
  });

  const [incidentMsg, setIncidentMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Question",
    message: "",
  });
  const [generalMsg, setGeneralMsg] = useState("");

  async function submitIncident(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = await fetch("/api/report", { method: "POST", body: fd });
    setIncidentMsg(res.ok ? "Incident submitted successfully." : "Failed to submit.");
  }

  async function submitGeneral(e) {
    e.preventDefault();
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setGeneralMsg(res.ok ? "Thank you! We will get back to you soon." : "Submission failed.");
  }

  return (
    <div className="w-full">
      {/* HERO IMAGE */}
      <div className="relative h-80 bg-[url('images/contact-hero.jpg')] bg-cover bg-center flex items-center">
        <div className="bg-black/30 absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-6 sm:px-4 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold">Connect With Us</h1>
          <p className="mt-2 text-lg sm:text-base opacity-90">
            We’re here to help — whether rescuing a stray or answering your questions.
          </p>
        </div>
      </div>

      {/* REPORT INCIDENT */}
      <div className="bg-[#f8f3eb] py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Report an Incident</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 max-w-xl">
            Notify us about an injured or distressed animal. Our rescue team responds as quickly as possible.
          </p>

          <form onSubmit={submitIncident} className="bg-white p-6 rounded-2xl shadow-md space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { label: "Your Name (Rescuer)", name: "rescuerName", type: "text" },
                { label: "Contact Number", name: "rescuerPhone", type: "text" },
                { label: "Location Details", name: "location", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <input
                    required
                    name={field.name}
                    type={field.type}
                    value={incident[field.name]}
                    onChange={(e) => setIncident({ ...incident, [field.name]: e.target.value })}
                    className="w-full border p-3 rounded-xl mt-1"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              {[
                { label: "Animal Type", name: "animalType", options: ["Dog", "Cat", "Bird", "Other"] },
                { label: "Size", name: "size", options: ["Small", "Medium", "Large"] },
                { label: "Injury Level", name: "injury", options: ["Minor", "Major"] },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <select
                    required
                    name={field.name}
                    value={incident[field.name]}
                    onChange={(e) => setIncident({ ...incident, [field.name]: e.target.value })}
                    className="w-full border p-3 rounded-xl mt-1"
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Photos / Videos</label>
              <input
                name="files"
                type="file"
                multiple
                onChange={(e) => setIncident({ ...incident, files: e.target.files })}
                className="mt-2 w-full"
              />
            </div>

            <button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full">
              Submit
            </button>

            {incidentMsg && <p className="text-green-600 font-medium">{incidentMsg}</p>}
          </form>
        </div>
      </div>

      {/* GENERAL INQUIRIES */}
      <div className="bg-white py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">General Inquiries</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 max-w-xl">
            Have questions about adoptions, volunteering, or donations? We're happy to help.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <form onSubmit={submitGeneral} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Full Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-1"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email Address</span>
                <input
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-1"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Subject</span>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-1"
                >
                  <option>General Question</option>
                  <option>Adoptions</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Your Message</span>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-1"
                  rows={4}
                />
              </label>

              <button className="w-full md:w-auto mt-2 px-6 py-2 bg-orange-500 text-white rounded-full">
                Submit
              </button>

              {generalMsg && <p className="mt-3 text-green-600 font-medium">{generalMsg}</p>}
            </form>

            <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
              <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
              <p className="mb-2 text-gray-700">📞 +91-XXXXXXXXXX</p>
              <p className="mb-2 text-gray-700">✉ rescue@tailsofbijapur.org</p>
              <p className="text-gray-700">📍 Bijapur, Karnataka, India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
