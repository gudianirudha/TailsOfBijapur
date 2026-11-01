import React, { useState } from "react";

export default function Surrender() {
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const res = await fetch("/api/surrender", { method: "POST", body: form });
    if (res.ok) setMsg("Thank you. Your submission has been received.");
    else setMsg("Submission failed.");
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Rescue or Rehome
      </h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        If you've found an animal in need or can no longer care for your pet,
        please provide the following information to help us find them a new home.
      </p>

      {/* Steps Card */}
      <div className="bg-[#faf7f3] border border-[#f1e7da] rounded-xl p-6 mb-10">
        <h2 className="font-semibold mb-4 text-gray-800">Submission Steps</h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <div className="h-8 w-8 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-500">
              1
            </div>
            <div>
              <p className="font-medium text-gray-800">Fill out the form</p>
              <p className="text-gray-500 text-sm">
                Provide details about the animal and your contact information.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <div className="h-8 w-8 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-500">
              2
            </div>
            <div>
              <p className="font-medium text-gray-800">Upload photos</p>
              <p className="text-gray-500 text-sm">
                Include clear photos of the animal for better visibility.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start">
            <div className="h-8 w-8 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-500">
              3
            </div>
            <div>
              <p className="font-medium text-gray-800">Submit</p>
              <p className="text-gray-500 text-sm">
                Our team will review your submission and contact you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================== FORM ======================== */}
      <form onSubmit={submit} className="space-y-10">

        {/* Animal Info Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Animal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm font-medium text-gray-600">
                Animal Name (optional)
              </label>
              <input
                name="animalName"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
                placeholder="Enter the animal's name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Animal Type
              </label>
              <select
                name="type"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
              >
                <option>Select animal type</option>
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Breed</label>
              <input
                name="breed"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
                placeholder="Select breed"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <select
                name="gender"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
              >
                <option>Select gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Age</label>
              <input
                name="age"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
                placeholder="Select age"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Size</label>
              <select
                name="size"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
              >
                <option>Select size</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>
          </div>

          <label className="block mt-6 text-sm font-medium text-gray-600">
            Description
          </label>
          <textarea
            name="description"
            className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
            rows="4"
            placeholder="Describe the animal's personality, behavior, and any special needs"
          />
        </div>

        {/* Contact & Location Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm font-medium text-gray-600">
                Your Name
              </label>
              <input
                name="reporterName"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <input
                name="reporterPhone"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">
                Location Found
              </label>
              <input
                name="location"
                className="w-full mt-1 border border-gray-300 p-3 rounded-xl"
                placeholder="Enter location"
              />
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Photos</h3>

          <div className="border border-orange-200 bg-orange-50 rounded-xl p-8 text-center">
            <p className="font-semibold text-gray-800 mb-2">Upload Photos</p>
            <p className="text-sm text-gray-500 mb-4">
              Upload clear photos of the animal from different angles.
            </p>

            <input
              type="file"
              name="photos"
              multiple
              className="mt-2 text-sm text-gray-700"
            />
          </div>
        </div>

        {/* Confirmation */}
        <label className="flex items-center gap-2 text-gray-700">
          <input type="checkbox" required className="h-4 w-4" />
          I confirm that the information provided is accurate.
        </label>

        {/* Submit */}
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition">
          Submit Form
        </button>

        {msg && <p className="text-green-600 font-medium mt-3">{msg}</p>}
      </form>
    </div>
  );
}
