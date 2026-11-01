import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./AdoptionDrive.css";

const DRIVE_DATE = new Date("2026-12-06T10:00:00+05:30");
const EASE = [0.22, 0.61, 0.36, 1];

function getTimeLeft() {
  const diff = Math.max(0, DRIVE_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    over: diff === 0,
  };
}

function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

function RollingNumber({ value }) {
  return (
    <span className="relative inline-flex h-[1.1em] overflow-hidden leading-[1.1em]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Countdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (time.over) {
    return <p className="font-semibold text-orange-300">The drive is happening now</p>;
  }

  const units = [
    ["days", time.days],
    ["hrs", time.hours],
    ["min", time.minutes],
    ["sec", time.seconds],
  ];

  return (
    <div className="drive-countdown" role="timer" aria-label="Countdown to adoption drive">
      {units.map(([label, value]) => (
        <div key={label} className="drive-countdown__unit">
          <span className="drive-countdown__value">
            <RollingNumber value={label === "days" ? String(value) : String(value).padStart(2, "0")} />
          </span>
          <span className="drive-countdown__label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function ScreenPuppy() {
  const reduce = useReducedMotion();
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  const animate = reduce
    ? { x: 0, y: 0 }
    : viewportWidth
      ? { x: [-112, viewportWidth * 0.34, viewportWidth * 0.68, viewportWidth + 112], y: [0, -12, 0, -8] }
      : { x: 0, y: 0 };

  return (
    <motion.a
      className="drive-screen-puppy"
      href="/adopt"
      aria-label="Meet the puppies looking for a home"
      initial={reduce ? false : { x: -112, y: 0 }}
      animate={animate}
      transition={reduce ? { duration: 0 } : { duration: 16, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
      whileHover={reduce ? undefined : { scale: 1.08 }}
      whileFocus={reduce ? undefined : { scale: 1.08 }}
    >
      <motion.span
        className="drive-screen-puppy__photo"
        animate={reduce ? undefined : { rotate: [0, 2, -2, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src="/images/adopt/ginger.jpg" alt="" />
      </motion.span>
      <span className="drive-screen-puppy__label">Meet me <ArrowUpRight size={13} /></span>
    </motion.a>
  );
}

const PROMISES = [
  {
    icon: Heart,
    title: "Adoption is free",
    description: "A loving home matters more than an adoption fee.",
  },
  {
    icon: ShieldCheck,
    title: "Care comes first",
    description: "Every pup is checked by a vet and cared for according to age.",
  },
  {
    icon: Sparkles,
    title: "Proudly Indie",
    description: "Meet wonderful native Indian dogs rescued right here in our community.",
  },
  {
    icon: HeartHandshake,
    title: "You’re not alone",
    description: "Our team will be there to help you and your new friend settle in.",
  },
];

const BEFORE_YOU_ADOPT = [
  "Give them time to settle in. Some need days; others need a few weeks.",
  "Build a gentle routine with rewards, patience and plenty of reassurance.",
  "Introduce new people, pets and places slowly and safely.",
  "Plan for vaccines, deworming, regular check-ups and everyday care.",
  "Make home secure, and use a leash and ID tag whenever you go out.",
];

function RsvpSection() {
  const [stats, setStats] = useState({ people: 0, groups: 0, recent: [] });
  const [statsError, setStatsError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", guests: 1 });
  const [status, setStatus] = useState({ type: null, msg: "" });
  const [busy, setBusy] = useState(false);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/drive/rsvps");
      if (!response.ok) throw new Error("Unable to load attendance right now.");
      setStats(await response.json());
      setStatsError("");
    } catch {
      setStatsError("Attendance totals are temporarily unavailable.");
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: null, msg: "" });

    try {
      const response = await fetch("/api/drive/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");

      setStatus({ type: "ok", msg: "You’re on the list. See you on 6 December!" });
      setForm({ name: "", phone: "", guests: 1 });
      loadStats();
    } catch (error) {
      setStatus({ type: "err", msg: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="rsvp" className="drive-rsvp scroll-mt-24">
      <div className="drive-rsvp__inner">
        <Reveal className="drive-rsvp__intro">
          <p className="drive-eyebrow drive-eyebrow--light">Make it a date</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Your next best friend
            <span className="drive-serif block font-normal text-orange-300">is waiting to meet you.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">
            Drop by, meet the pups and ask us anything. Let us know you’re coming so we can make room for you.
          </p>

          <div className="mt-10 border-t border-white/15 pt-6">
            {stats.people > 0 ? (
              <p className="text-sm text-white/60">
                <span className="mr-2 text-3xl font-semibold tracking-tight text-white">
                  <RollingNumber value={String(stats.people)} />
                </span>
                kind humans are coming
              </p>
            ) : (
              <p className="text-sm text-white/60">
                {statsError || "Be one of the first to save a spot."}
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="drive-rsvp__card">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="drive-label" htmlFor="drive-name">Your name</label>
              <input
                id="drive-name"
                className="drive-input"
                autoComplete="name"
                placeholder="e.g. Aditi Sharma"
                required
                maxLength={60}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div>
              <label className="drive-label" htmlFor="drive-phone">Phone number</label>
              <input
                id="drive-phone"
                className="drive-input"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+91"
                required
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>
            <div className="flex items-center justify-between gap-5">
              <label className="drive-label mb-0" htmlFor="drive-guests">How many are coming?</label>
              <input
                id="drive-guests"
                className="drive-input drive-input--number"
                type="number"
                min={1}
                max={10}
                value={form.guests}
                onChange={(event) => setForm({ ...form, guests: event.target.value })}
              />
            </div>
            <button type="submit" className="drive-submit" disabled={busy}>
              {busy ? "Saving your spot…" : "Count me in"}
              <ArrowUpRight size={18} />
            </button>
            {status.type && (
              <p className={`flex items-start gap-2 text-sm ${status.type === "ok" ? "text-emerald-700" : "text-red-700"}`} role="status">
                {status.type === "ok" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {status.msg}
              </p>
            )}
            <p className="text-center text-xs leading-5 text-stone-500">
              No pressure, no fees — just a lovely day with dogs.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function AdoptionInterestSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    homeType: "",
    hasPets: "",
    experience: "",
    puppyName: "",
    consent: false,
  });
  const [status, setStatus] = useState({ type: null, msg: "" });
  const [busy, setBusy] = useState(false);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: null, msg: "" });

    try {
      const response = await fetch("/api/drive/adoption-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "We couldn’t send your application. Please try again.");

      setStatus({ type: "ok", msg: "Thanks for raising your hand! Our team will be in touch soon." });
      setForm({
        name: "",
        email: "",
        phone: "",
        city: "",
        homeType: "",
        hasPets: "",
        experience: "",
        puppyName: "",
        consent: false,
      });
    } catch (error) {
      setStatus({ type: "err", msg: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="adoption-interest" className="drive-interest scroll-mt-24">
      <div className="drive-wrap drive-interest__grid">
        <Reveal className="drive-interest__intro">
          <p className="drive-eyebrow">Ready to make room for a best friend?</p>
          <h2>Tell us a little about the home you’ll share.</h2>
          <p>
            This isn’t a commitment to adopt. It helps our team get to know you and make a thoughtful match. We’ll reach out to chat through next steps.
          </p>
          <div className="drive-interest__note">
            <HeartHandshake size={20} />
            <span>Every application is read by a person. There’s no fee to apply or adopt.</span>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="drive-interest__card">
          <form onSubmit={submit} className="space-y-5">
            <div className="drive-form-grid">
              <div>
                <label className="drive-label" htmlFor="interest-name">Your name *</label>
                <input id="interest-name" name="name" className="drive-input" autoComplete="name" maxLength={80}
                  required value={form.name} onChange={updateField} />
              </div>
              <div>
                <label className="drive-label" htmlFor="interest-city">City / area *</label>
                <input id="interest-city" name="city" className="drive-input" autoComplete="address-level2" maxLength={100}
                  required value={form.city} onChange={updateField} />
              </div>
              <div>
                <label className="drive-label" htmlFor="interest-email">Email address *</label>
                <input id="interest-email" name="email" className="drive-input" autoComplete="email" type="email" maxLength={254}
                  required value={form.email} onChange={updateField} />
              </div>
              <div>
                <label className="drive-label" htmlFor="interest-phone">Phone number *</label>
                <input id="interest-phone" name="phone" className="drive-input" autoComplete="tel" inputMode="tel" type="tel" maxLength={20}
                  required value={form.phone} onChange={updateField} />
              </div>
              <div>
                <label className="drive-label" htmlFor="interest-home">Your home *</label>
                <select id="interest-home" name="homeType" className="drive-input drive-select" required value={form.homeType} onChange={updateField}>
                  <option value="">Choose one</option>
                  <option value="owned">Owned</option>
                  <option value="rented">Rented, pets are permitted</option>
                  <option value="other">Other / still figuring it out</option>
                </select>
              </div>
              <div>
                <label className="drive-label" htmlFor="interest-pets">Other pets at home? *</label>
                <select id="interest-pets" name="hasPets" className="drive-input drive-select" required value={form.hasPets} onChange={updateField}>
                  <option value="">Choose one</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
            <div>
              <label className="drive-label" htmlFor="interest-experience">Have you cared for a dog before? *</label>
              <textarea id="interest-experience" name="experience" className="drive-input drive-textarea" rows={3} maxLength={1200}
                placeholder="A little about your experience, routine, or the support you have at home…" required value={form.experience} onChange={updateField} />
            </div>
            <div>
              <label className="drive-label" htmlFor="interest-puppy">Is there a puppy you’ve already connected with?</label>
              <input id="interest-puppy" name="puppyName" className="drive-input" maxLength={80}
                placeholder="Optional — name or ‘no preference’" value={form.puppyName} onChange={updateField} />
            </div>
            <label className="drive-consent">
              <input name="consent" type="checkbox" required checked={form.consent} onChange={updateField} />
              <span>I agree that Tails of Bijapur may contact me about this adoption enquiry and use these details to help assess a suitable match.</span>
            </label>
            <button type="submit" className="drive-submit" disabled={busy}>
              {busy ? "Sending your enquiry…" : "Send adoption enquiry"}
              <ArrowUpRight size={18} />
            </button>
            {status.type && (
              <p className={`flex items-start gap-2 text-sm ${status.type === "ok" ? "text-emerald-700" : "text-red-700"}`} role="status" aria-live="polite">
                {status.type === "ok" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                {status.msg}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export default function AdoptionDrive() {
  const reduce = useReducedMotion();

  return (
    <div className="drive-page overflow-x-hidden">
      <section className="drive-hero relative overflow-hidden">
        <div className="drive-hero__glow" aria-hidden="true" />
        <div className="drive-wrap relative z-10">
          <div className="drive-hero__grid">
            <div className="drive-hero__copy">
              <Reveal>
                <p className="drive-pill">
                  <span className="drive-pill__dot" />
                  North Karnataka’s first adoption drive
                </p>
              </Reveal>

              <h1 className="drive-title">
                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.85, ease: EASE, delay: 0.1 }}
                  >
                    A little day.
                  </motion.span>
                </span>
                <span className="drive-title__accent drive-serif block overflow-hidden pb-[0.08em] font-normal italic">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.85, ease: EASE, delay: 0.22 }}
                  >
                    A lifetime of love.
                  </motion.span>
                </span>
              </h1>

              <Reveal delay={0.25}>
                <p className="max-w-xl text-base leading-7 text-white/65 md:text-lg md:leading-8">
                  Come meet the Indie dogs looking for their person. One hello could change both your lives.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a className="drive-button" href="#rsvp">
                    Save your spot <ArrowDown size={17} />
                  </a>
                  <a className="drive-text-link" href="#adoption-interest">
                    I’d like to adopt <Heart size={16} />
                  </a>
                  <Link className="drive-text-link" to="/adopt">
                    Meet dogs online <ArrowUpRight size={16} />
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="drive-hero__visual">
              <div className="drive-photo">
                <video
                  src="https://res.cloudinary.com/ds53m10cl/video/upload/v1793527474/Puppy_vqairh.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-hidden="true"
                />
                <div className="drive-photo__caption">
                  <span className="drive-photo__sparkle"><Sparkles size={16} /></span>
                  <span>Small paws. Huge love.</span>
                </div>
              </div>
              <div className="drive-photo__note">
                <Heart size={16} fill="currentColor" />
                <span>Come as you are.<br />Leave with a full heart.</span>
              </div>
              <span className="drive-photo__sun" aria-hidden="true" />
            </Reveal>
          </div>

          <Reveal delay={0.35} className="drive-eventbar">
            <div className="drive-eventbar__detail">
              <span className="drive-eventbar__icon"><CalendarDays size={18} /></span>
              <span className="drive-eventbar__copy"><strong>Sunday, 6 December 2026</strong><small>Save the date</small></span>
            </div>
            <div className="drive-eventbar__detail">
              <span className="drive-eventbar__icon"><Clock3 size={18} /></span>
              <span className="drive-eventbar__copy"><strong>10:00 AM onwards</strong><small>Come by anytime</small></span>
            </div>
            <div className="drive-eventbar__detail">
              <span className="drive-eventbar__icon"><MapPin size={18} /></span>
              <span className="drive-eventbar__copy"><strong>Bijapur, Karnataka</strong><small>Venue to be announced</small></span>
            </div>
            <div className="drive-eventbar__countdown">
              <span className="drive-countdown-label">The big day in</span>
              <Countdown />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="drive-promises">
        <div className="drive-wrap">
          <Reveal className="drive-section-heading">
            <p className="drive-eyebrow">Good things, guaranteed</p>
            <h2>Every new beginning deserves a little care.</h2>
          </Reveal>
          <div className="drive-promises__grid">
            {PROMISES.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 0.07} className="drive-promise">
                <span className="drive-promise__icon"><Icon size={20} strokeWidth={1.8} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="drive-ready">
        <div className="drive-wrap drive-ready__grid">
          <Reveal className="drive-ready__intro">
            <p className="drive-eyebrow">A thoughtful match lasts a lifetime</p>
            <h2>Love at first sight is lovely.<span className="drive-serif"> Love for life is the plan.</span></h2>
            <p>
              Adopting is a big, beautiful commitment. We’ll help you think through the everyday bits, so you and your new friend can start strong.
            </p>
            <a href="#rsvp" className="drive-ready__link">Talk it through with us <ArrowDown size={16} /></a>
          </Reveal>

          <ol className="drive-checklist">
            {BEFORE_YOU_ADOPT.map((item, index) => (
              <Reveal as="li" key={item} delay={index * 0.05} className="drive-checklist__item">
                <span className="drive-checklist__number">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <AdoptionInterestSection />
      <RsvpSection />

      <section className="drive-lastcall">
        <div className="drive-wrap drive-lastcall__inner">
          <div>
            <p className="drive-eyebrow">Can’t wait until December?</p>
            <h2>There are good dogs looking for you right now.</h2>
          </div>
          <Link to="/adopt" className="drive-lastcall__button">
            Meet them <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <ScreenPuppy />
    </div>
  );
}
