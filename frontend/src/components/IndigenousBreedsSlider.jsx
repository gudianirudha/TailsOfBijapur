import { useEffect, useState } from "react";

/* Arrow Components */
const ArrowLeft = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Previous"
    className="p-2 rounded-full border border-gray-300 bg-white/80 hover:bg-white transition"
  >
    <svg
      className="w-5 h-5 text-gray-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

const ArrowRight = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Next"
    className="p-2 rounded-full border border-gray-300 bg-white/80 hover:bg-white transition"
  >
    <svg
      className="w-5 h-5 text-gray-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

/* Breed Data */
const breeds = [
  {
    name: "Indian Pariah Dog (Indie)",
    traits: [
      "Naturally evolved over thousands of years",
      "Highly intelligent and observant",
      "Strong immunity and low maintenance",
      "Deeply loyal once trust is built",
    ],
    suitability: [
      "First-time dog guardians",
      "Families and individuals",
      "Low-maintenance households",
      "Those open to building trust gradually",
    ],
    placeholder: "Indian Pariah Dog image",
  },
  {
    name: "Rajapalayam",
    traits: [
      "Ancient sighthound from Tamil Nadu",
      "Strong guarding instinct",
      "Calm and dignified temperament",
      "Highly territorial and loyal",
    ],
    suitability: [
      "Experienced dog handlers",
      "Homes with secure space",
      "Single-family environments",
      "Not ideal for first-time owners",
    ],
    placeholder: "Rajapalayam image",
  },
  {
    name: "Chippiparai",
    image: "/images/Chippiparai.jpg",
    traits: [
      "Fast and agile sighthound",
      "Bred for endurance and speed",
      "Alert and intelligent",
      "Needs daily physical activity",
    ],
    suitability: [
      "Active individuals",
      "Homes with exercise routine",
      "Training consistency required",
      "Not suited for sedentary lifestyle",
    ],
    placeholder: "Chippiparai image",
  },
  {
    name: "Kombai",
    traits: [
      "Fearless and powerful working dog",
      "Historically used in guarding and warfare",
      "Highly protective temperament",
      "Strong leadership required",
    ],
    suitability: [
      "Very experienced handlers only",
      "Rural or farm environments",
      "Not apartment friendly",
      "Not suitable for novice adopters",
    ],
    placeholder: "Kombai image",
  },
  {
    name: "Mudhol Hound (Caravan Hound)",
    traits: [
      "Graceful and fast sighthound",
      "Excellent stamina and speed",
      "Reserved but loyal",
      "Low grooming needs",
    ],
    suitability: [
      "Active households",
      "Homes with open running space",
      "Calm and structured environments",
      "Not ideal for cramped spaces",
    ],
    placeholder: "Mudhol Hound image",
  },
];

const IndigenousBreedsSlider = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const current = breeds[index];

  /* Auto-scroll */
  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % breeds.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="fade-slide bg-[#FAF7F2] border border-[#E7E1D8] rounded-2xl p-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid md:grid-cols-2 gap-10 items-center">

        {/* IMAGE + ARROWS */}
        <div className="relative h-72 bg-white border border-[#E7E1D8] rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-3 z-10">
            <ArrowLeft
              onClick={() =>
                setIndex((index - 1 + breeds.length) % breeds.length)
              }
            />
            <ArrowRight
              onClick={() =>
                setIndex((index + 1) % breeds.length)
              }
            />
          </div>

          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500
            transition-all duration-500 grayscale hover:grayscale-0">
            <img
              src={current.image}
              alt={current.name}
              className="w-full h-full object-cover transition-all duration-500 grayscale hover:grayscale-0"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div>
          <h3 className="text-xl font-semibold text-[#1F2933] mb-4">
            {current.name}
          </h3>

          {/* Traits */}
          <ul className="space-y-2 text-[#4B5563] mb-6">
            {current.traits.map((trait, i) => (
              <li key={i}>• {trait}</li>
            ))}
          </ul>

          {/* Suitability */}
          <div className="bg-white border border-orange-100 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-orange-600 mb-3">
              Is this breed right for you?
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {current.suitability.map((item, i) => (
                <li key={i}>– {item}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IndigenousBreedsSlider;
