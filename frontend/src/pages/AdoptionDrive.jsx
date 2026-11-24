import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  Award,
  Camera,
  CalendarDays,
  CheckCircle2,
  Heart,
  HeartHandshake,
  PawPrint,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./AdoptionDrive.css";

const DRIVE_EVENTS = [
  { startsAt: new Date("2026-12-05T15:00:00+05:30"), label: "Saturday, 5 December" },
  { startsAt: new Date("2026-12-06T12:00:00+05:30"), label: "Sunday, 6 December" },
];
const EASE = [0.22, 0.61, 0.36, 1];

async function readApiJson(response, endpointLabel) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `${endpointLabel} returned a webpage instead of JSON. The API deployment may be out of date or misrouted.`
    );
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `${endpointLabel} request failed.`);
  }
  return data;
}

function getTimeLeft() {
  const nextEvent = DRIVE_EVENTS.find(({ startsAt }) => startsAt.getTime() > Date.now());
  if (!nextEvent) return { over: true };

  const diff = nextEvent.startsAt.getTime() - Date.now();
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    label: `Next event · ${nextEvent.label}`,
    over: false,
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
    return <p className="font-semibold">The adoption drive has begun!</p>;
  }

  const units = [
    ["days", time.days],
    ["hrs", time.hours],
    ["min", time.minutes],
    ["sec", time.seconds],
  ];

  return (
    <div>
      <span className="drive-countdown-label">{time.label}</span>
      <div className="drive-countdown" role="timer" aria-label={`Countdown to ${time.label}`}>
        {units.map(([label, value]) => (
          <div key={label} className="drive-countdown__unit">
            <span className="drive-countdown__value">
              <RollingNumber value={label === "days" ? String(value) : String(value).padStart(2, "0")} />
            </span>
            <span className="drive-countdown__label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LivePuppyDashboard() {
  const [dashboard, setDashboard] = useState({ available: 0, adopted: 0, puppies: [] });
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/drive/puppies", { cache: "no-store" });
      const data = await readApiJson(response, "Live puppy dashboard");
      if (!Array.isArray(data.puppies) || !Number.isFinite(data.available) || !Number.isFinite(data.adopted)) {
        throw new Error("Live puppy dashboard data is unavailable.");
      }
      setDashboard(data);
      setError("");
      setLoaded(true);
      setUpdatedAt(new Date());
    } catch (loadError) {
      setError(loadError.message || "Live puppy dashboard is temporarily unavailable.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const refreshVisibleDashboard = () => {
      if (document.visibilityState === "visible") loadDashboard();
    };
    const timer = window.setInterval(refreshVisibleDashboard, 30_000);
    document.addEventListener("visibilitychange", refreshVisibleDashboard);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisibleDashboard);
    };
  }, [loadDashboard]);

  const puppies = filter === "all"
    ? dashboard.puppies
    : dashboard.puppies.filter((puppy) => puppy.status === filter);
  const totalPuppies = dashboard.available + dashboard.adopted;
  const adoptionProgress = totalPuppies ? Math.round((dashboard.adopted / totalPuppies) * 100) : 0;
  const filterCounts = {
    all: totalPuppies,
    available: dashboard.available,
    adopted: dashboard.adopted,
  };

  return (
    <section className="drive-live-dashboard" aria-labelledby="drive-live-dashboard-title">
      <div className="drive-wrap">
        <Reveal className="drive-live-dashboard__header">
          <div>
            <p className="drive-live-dashboard__eyebrow"><span aria-hidden="true" /> Live rescue updates</p>
            <h2 id="drive-live-dashboard-title">Puppy adoption dashboard</h2>
            <p className="drive-live-dashboard__intro">Meet the puppies coming to the drive and celebrate the ones who have found a home.</p>
            <Link className="drive-live-dashboard__cta" to="/adopt">Explore adoption <ArrowUpRight size={16} /></Link>
          </div>
          <div className="drive-live-dashboard__totals" aria-label="Puppy adoption totals">
            <div className="is-available">
              <span className="drive-live-dashboard__total-icon"><PawPrint size={17} /></span>
              <strong>{dashboard.available}</strong><span>Looking for homes</span>
            </div>
            <div className="is-adopted">
              <span className="drive-live-dashboard__total-icon"><Heart size={17} /></span>
              <strong>{dashboard.adopted}</strong><span>Found their people</span>
            </div>
          </div>
        </Reveal>

        <div className="drive-live-dashboard__toolbar">
          <div className="drive-live-dashboard__filters" role="group" aria-label="Filter puppies">
            {[
              ["all", "All puppies"],
              ["available", "Available"],
              ["adopted", "Adopted"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "is-active" : ""}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}<span>{filterCounts[value]}</span>
              </button>
            ))}
          </div>
          <div className="drive-live-dashboard__sync">
            <p className="drive-live-dashboard__updated" aria-live="polite">
              {error ? "Updates paused" : updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Loading live updates…"}
            </p>
            <button type="button" onClick={loadDashboard} disabled={refreshing} aria-label="Refresh puppy dashboard" title="Refresh dashboard">
              <RefreshCw size={15} className={refreshing ? "is-spinning" : ""} /> Refresh
            </button>
          </div>
        </div>

        {error && <p className="drive-live-dashboard__error" role="alert">{error}</p>}

        {puppies.length > 0 ? (
          <div className="drive-live-dashboard__grid">
            {puppies.map((puppy, index) => (
              <Reveal key={`${puppy.name}-${puppy.photo}-${index}`} delay={Math.min(index * 0.035, 0.2)} className="drive-live-puppy">
                {puppy.photo ? (
                  <img src={puppy.photo} alt={puppy.name || "Puppy in the adoption drive"} loading="lazy" />
                ) : (
                  <div className="drive-live-puppy__placeholder"><PawPrint size={30} /></div>
                )}
                <div className="drive-live-puppy__info">
                  <div>
                    <h3>{puppy.name || "A lovely Indie pup"}</h3>
                    <span className={`drive-live-puppy__status${puppy.status === "adopted" ? " is-adopted" : ""}`}>
                      {puppy.status === "adopted" ? "Adoption success" : "Ready to meet you"}
                    </span>
                  </div>
                  {puppy.status === "adopted" && (
                    <p className="drive-live-puppy__adopter">
                      {puppy.adopterFirstName ? `With ${puppy.adopterFirstName}` : "A new family found each other"}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="drive-live-dashboard__empty">
            <span className="drive-live-dashboard__empty-icon">{loaded ? <HeartHandshake size={25} /> : <PawPrint size={25} />}</span>
            <h3>{loaded ? (filter === "all" ? "Puppy profiles are on their way" : `No ${filter} puppies to show`) : "Finding the latest puppy updates…"}</h3>
            <p>{loaded
              ? filter === "all"
                ? "Volunteer-registered puppy profiles will appear here as they join the drive."
                : `Check back soon for ${filter === "available" ? "new puppies looking for homes" : "more adoption stories"}.`
              : "This usually only takes a moment."}</p>
          </div>
        )}
        <div className="drive-live-dashboard__footer">
          {totalPuppies > 0 && (
            <div className="drive-live-dashboard__progress" aria-label={`${adoptionProgress}% of recorded puppies have been adopted`}>
              <div><span>Adoption stories</span><strong>{adoptionProgress}%</strong></div>
              <span className="drive-live-dashboard__progress-track"><span style={{ width: `${adoptionProgress}%` }} /></span>
            </div>
          )}
          <p className="drive-live-dashboard__privacy"><ShieldCheck size={14} /> Adopter contact details and addresses are kept private.</p>
        </div>
      </div>
    </section>
  );
}

function ScreenPuppy() {
  const reduce = useReducedMotion();
  const [showShortcut, setShowShortcut] = useState(false);

  useEffect(() => {
    const occupiedSections = new Set();
    const sections = document.querySelectorAll(".drive-hero, #rsvp");
    if (!sections.length) {
      setShowShortcut(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) occupiedSections.add(entry.target);
        else occupiedSections.delete(entry.target);
      });
      setShowShortcut(occupiedSections.size === 0);
    });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  if (!showShortcut) return null;

  return (
    <motion.a
      className="drive-screen-puppy"
      href="/adopt"
      aria-label="Meet the puppies looking for a home"
      initial={false}
      animate={reduce ? undefined : { y: [0, -3, 0] }}
      transition={reduce ? undefined : { duration: 3.5, ease: "easeInOut", repeat: Infinity }}
      whileHover={reduce ? undefined : { scale: 1.08 }}
      whileFocus={reduce ? undefined : { scale: 1.08 }}
    >
      <span className="drive-screen-puppy__photo">
        <img src="/images/adopt/ginger.jpg" alt="" />
      </span>
      <span className="drive-screen-puppy__label">Meet a pup <ArrowUpRight size={13} /></span>
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
  const [stats, setStats] = useState({ people: 0, groups: 0 });
  const [statsError, setStatsError] = useState("");
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", guests: 1, eventDate: "" });
  const [status, setStatus] = useState({ type: null, msg: "" });
  const [busy, setBusy] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch("/api/drive/rsvps", { cache: "no-store" });
      const data = await readApiJson(response, "Live attendance");
      if (!Number.isFinite(data.people) || !Number.isFinite(data.groups)) {
        throw new Error("Attendance totals are unavailable.");
      }
      setStats({ people: data.people, groups: data.groups });
      setStatsError("");
      setStatsLoaded(true);
      setStatsUpdatedAt(new Date());
    } catch (error) {
      setStatsError(error.message || "Attendance totals are temporarily unavailable.");
    }
  }, []);

  useEffect(() => {
    loadStats();
    const refreshVisibleStats = () => {
      if (document.visibilityState === "visible") loadStats();
    };
    const timer = window.setInterval(refreshVisibleStats, 30_000);
    document.addEventListener("visibilitychange", refreshVisibleStats);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisibleStats);
    };
  }, [loadStats]);

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

      const eventMessage = {
        "2026-12-05": "See you on 5 December at 90’s Nest Cafe!",
        "2026-12-06": "See you on 6 December at Urban Brews!",
        both: "See you on 5 and 6 December!",
      }[form.eventDate];
      setStatus({ type: "ok", msg: `You’re on the list. ${eventMessage}` });
      setForm({ name: "", phone: "", guests: 1, eventDate: "" });
      await loadStats();
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
          <p className="mt-6 max-w-md text-base leading-7 text-[#2d2723]/70">
            Drop by, meet the pups and ask us anything. Let us know you’re coming so we can make room for you.
          </p>

          <div className="drive-attendance" aria-live="polite">
            <div className="drive-attendance__topline">
              <span className={`drive-live-badge${statsError ? " drive-live-badge--paused" : ""}`}>
                <span className="drive-live-badge__dot" />
                {statsError ? "Updates paused" : "Live attendance"}
              </span>
              {statsUpdatedAt && (
                <span className="drive-attendance__updated">
                  Updated {statsUpdatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </div>
            {statsLoaded ? (
              <div className="drive-attendance__totals">
                <p>
                  <strong><RollingNumber value={String(stats.people)} /></strong>
                  <span>people coming</span>
                </p>
                <span className="drive-attendance__groups">
                  <RollingNumber value={String(stats.groups)} /> RSVP groups
                </span>
              </div>
            ) : (
              <p className="drive-attendance__empty">
                {statsError || "Checking who’s coming…"}
              </p>
            )}
            {statsError && statsLoaded && (
              <p className="drive-attendance__error">{statsError} Showing the last available total.</p>
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
            <div>
              <label className="drive-label" htmlFor="drive-event-date">Which day are you joining us?</label>
              <select
                id="drive-event-date"
                className="drive-input drive-select"
                required
                value={form.eventDate}
                onChange={(event) => setForm({ ...form, eventDate: event.target.value })}
              >
                <option value="">Choose a day</option>
                <option value="2026-12-05">5 December · 90’s Nest Cafe</option>
                <option value="2026-12-06">6 December · Urban Brews</option>
                <option value="both">Both days</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-5">
              <label className="drive-label mb-0" htmlFor="drive-guests">How many are coming?</label>
              <input
                id="drive-guests"
                className="drive-input drive-input--number"
                type="number"
                min={1}
                max={10}
                required
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

function ProudIndieParentSection() {
  return (
    <section className="drive-proud">
      <div className="drive-wrap drive-proud__grid">
        <Reveal className="drive-proud__copy">
          <p className="drive-eyebrow">A little celebration of a big decision</p>
          <h2>
            Proud Indie
            <span className="drive-serif"> Parent!</span>
          </h2>
          <p className="drive-proud__lead">
            Every Indie deserves a loving home, and every adoption deserves to be celebrated.
          </p>
          <p className="drive-proud__description">
            Stop by our special photo booth at the adoption drive. Capture your first moments with your new family member and take home a memory to cherish. Every adopter will also receive a special Adoption Certificate.
          </p>
          <div className="drive-proud__features">
            <div className="drive-proud__feature">
              <span className="drive-proud__feature-icon"><Camera size={19} /></span>
              <span>
                <strong>Your first family photo deserves a frame.</strong>
                <small>Visit the photo booth and take home a special memory.</small>
              </span>
            </div>
            <div className="drive-proud__feature">
              <span className="drive-proud__feature-icon"><Award size={19} /></span>
              <span>
                <strong>A certificate for every adopter.</strong>
                <small>A little keepsake to celebrate your new family member.</small>
              </span>
            </div>
          </div>
          <p className="drive-proud__availability">Proud Indie Parent Photo Booth <span>·</span> Available at the adoption drive</p>
        </Reveal>

        <Reveal delay={0.12} className="drive-proud__visual">
          <div className="drive-proud__art">
            <img
              src="https://res.cloudinary.com/ds53m10cl/image/upload/v1793546155/PROUD_INDIE_PARENT_knnxhn.svg"
              alt="Proud Indie Parent"
              loading="lazy"
            />
          </div>
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
                  ADOPTION DRIVE — PLAY WITH PUPPIES
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
                    BERANG SI ZINDAGI MEIN RANG BHARDO
                  </motion.span>
                </span>
                <span className="drive-title__accent drive-serif block overflow-hidden pb-[0.08em] font-normal italic">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.85, ease: EASE, delay: 0.22 }}
                  >
                    PUPPIES KE SAANG
                  </motion.span>
                </span>
              </h1>

              <Reveal delay={0.25}>
                <p className="max-w-xl text-base leading-7 text-[#2d2723]/70 md:text-lg md:leading-8">
                  Come meet the Indie dogs looking for their person. One hello could change both your lives.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a className="drive-button" href="#rsvp">
                    Save your spot <ArrowDown size={17} />
                  </a>
                  <Link className="drive-text-link" to="/adopt">
                    I’d like to adopt <ArrowUpRight size={16} />
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
              <span className="drive-eventbar__copy">
                <strong>Saturday, 5 December</strong>
                <small>3 PM onwards · <a href="https://www.google.com/maps/search/?api=1&query=90%27s+Nest+Cafe%2C+Bijapur%2C+Karnataka" target="_blank" rel="noreferrer">90&apos;s Nest Cafe <ArrowUpRight size={11} /></a></small>
              </span>
            </div>
            <div className="drive-eventbar__detail">
              <span className="drive-eventbar__icon"><CalendarDays size={18} /></span>
              <span className="drive-eventbar__copy">
                <strong>Sunday, 6 December</strong>
                <small>12 PM onwards · <a href="https://www.google.com/maps/search/?api=1&query=Urban+Brews%2C+Bijapur%2C+Karnataka" target="_blank" rel="noreferrer">Urban Brews <ArrowUpRight size={11} /></a></small>
              </span>
            </div>
            <div className="drive-eventbar__countdown">
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

      <ProudIndieParentSection />
      <RsvpSection />
      <LivePuppyDashboard />

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
