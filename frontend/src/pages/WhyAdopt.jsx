const WhyAdopt = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900">
          Why Adopt a Pet
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
          Adoption is a responsible, compassionate choice that transforms lives 
          offering animals safety and giving humans lifelong companionship.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          { value: "30M+", label: "Stray animals in India" },
          { value: "70%", label: "Shelter animals never find homes" },
          { value: "100%", label: "Adopted pets show improved wellbeing" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center shadow-sm"
          >
            <p className="text-3xl font-bold text-orange-500">{stat.value}</p>
            <p className="text-gray-700 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Benefits for Humans */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How Adoption Changes Human Lives
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Living with a companion animal improves emotional well-being, reduces
            stress, and encourages healthy routines. Adopted pets provide
            unconditional companionship and foster empathy, patience, and emotional
            stability in their caregivers.
          </p>
        </div>
      </section>

      {/* Impact on Animals */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What Adoption Means for Animals
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Many animals awaiting adoption have faced abandonment, injury, or unsafe
            environments. Adoption offers them safety, medical care, nourishment, and
            the chance to experience love and dignity in a permanent home.
          </p>
        </div>
      </section>

      {/* Adopt Don't Shop */}
      <section className="mb-16">
        <div className="bg-orange-50 border-l-4 border-orange-400 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Adopt, Don’t Shop
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Commercial breeding often prioritizes profit over animal welfare and
            contributes to overpopulation. Adoption reduces the burden on shelters
            and supports ethical, compassionate treatment of animals.
          </p>
        </div>
      </section>

      {/* Responsibility */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            The Responsibility of a Pet Parent
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Adopting a pet is a long-term commitment. Responsible pet parents ensure
            regular meals, clean water, timely veterinary care, daily exercise,
            emotional attention, and a safe living environment throughout the
            animal’s life.
          </p>
        </div>
      </section>

      {/* Life After Adoption */}
      <section>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Life After Adoption
          </h2>

          <p className="text-gray-700 leading-relaxed">
            Every adopted animal needs time to adjust to a new environment and
            unfamiliar surroundings. A calm, patient approach helps them feel safe
            during this transition period.
          </p>

          <p className="text-gray-700 leading-relaxed mt-4">
            Maintaining consistent routines for feeding, walks, and rest creates a
            sense of stability. Positive reinforcement strengthens trust and builds
            confidence without fear or pressure.
          </p>

          <p className="text-gray-900 font-semibold text-lg mt-6">
            Adoption is not a single moment. It is a lifelong relationship built on
            trust, patience, and unconditional care.
          </p>
        </div>
      </section>

    </div>
  );
};

export default WhyAdopt;
