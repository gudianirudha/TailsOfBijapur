import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaVenusMars, FaClock, FaDog } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { MdHealthAndSafety, MdEmojiPeople } from "react-icons/md";

export default function AdoptDetails() {
  const { state } = useLocation();
  const nav = useNavigate();

  if (!state) return <div className="p-6 text-center">No pet details found.</div>;

  const pet = state;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">

      {/* Breadcrumb */}
      <button
        onClick={() => nav(-1)}
        className="flex items-center text-sm text-gray-500 hover:text-orange-500 mb-4"
      >
        <IoMdArrowBack className="mr-1" /> Adopt / {pet.name}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* IMAGE */}
        <div className="w-full rounded-2xl overflow-hidden shadow-md">
          <img src={pet.image} className="w-full h-80 object-cover" />
        </div>

        {/* DETAILS */}
        <div>
          <h1 className="text-4xl font-semibold">{pet.name}</h1>

          {/* icons row */}
          <div className="flex items-center gap-4 mt-3 text-orange-500 text-sm">
            <span className="flex items-center gap-1">
              <FaVenusMars /> {pet.gender}
            </span>
            <span className="flex items-center gap-1">
              <FaClock /> {pet.age}
            </span>
            <span className="flex items-center gap-1">
              <FaDog /> {pet.size || "Medium"}
            </span>
          </div>

          {/* About Section */}
          <h2 className="text-xl font-semibold mt-6">About {pet.name}</h2>
          <p className="text-gray-700 leading-relaxed mt-2">
            {pet.desc ||
              `${pet.name} is a friendly and loving pet looking for a caring home.`}
          </p>

          {/* Good to Know */}
          <h2 className="text-xl font-semibold mt-6">Good to Know</h2>

          <div className="space-y-4 mt-3">
            {/* Card 1 */}
            <div className="bg-orange-50 p-4 rounded-2xl shadow flex gap-4">
              <MdHealthAndSafety className="text-orange-500 text-3xl mt-1" />
              <div>
                <h3 className="font-semibold">Health & Vaccination</h3>
                <p className="text-sm text-gray-600">
                  Fully vaccinated, dewormed, and health check completed.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-orange-50 p-4 rounded-2xl shadow flex gap-4">
              <MdEmojiPeople className="text-orange-500 text-3xl mt-1" />
              <div>
                <h3 className="font-semibold">Temperament</h3>
                <p className="text-sm text-gray-600">
                  Friendly, good with kids and other dogs.
                </p>


              </div>
            </div>
          </div>

          {/* Adopt Button 
          <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition">
            Adopt {pet.name}
          </button>*/}
        </div>
      </div>
    </div>
  );
}
