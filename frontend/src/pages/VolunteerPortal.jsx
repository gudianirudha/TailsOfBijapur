import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarDays, Camera, Check, ClipboardList, Download, Heart, LogOut, MapPin, PawPrint, Plus, ShieldCheck, Trash2, Upload, Users, X } from "lucide-react";

const EMPTY_PUPPY = {
  name: "",
  age: "",
  gender: "",
  dhppiVaccinations: [],
  antiRabiesVaccinations: [],
  fosterName: "",
  location: "",
};

function Field({ label, children }) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-stone-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-600/15";

function formatVaccinationDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export default function VolunteerPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const setupToken = searchParams.get("setupToken") || "";
  const [mode, setMode] = useState(setupToken ? "setup" : "login");
  const [credentials, setCredentials] = useState({ email: "", password: "", confirmPassword: "" });
  const [puppy, setPuppy] = useState(EMPTY_PUPPY);
  const [photos, setPhotos] = useState([]);
  const [puppies, setPuppies] = useState([]);
  const [healthCardPuppy, setHealthCardPuppy] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem("volunteerToken") || "");
  const [busy, setBusy] = useState(false);
  const [adoptingId, setAdoptingId] = useState("");
  const [adopter, setAdopter] = useState({ name: "", phone: "", address: "", publicNameConsent: false });
  const [message, setMessage] = useState({ type: "", text: "" });

  function addVaccination(key) {
    setPuppy((current) => ({ ...current, [key]: [...current[key], ""] }));
  }

  function updateVaccination(key, index, date) {
    setPuppy((current) => ({
      ...current,
      [key]: current[key].map((currentDate, currentIndex) => currentIndex === index ? date : currentDate),
    }));
  }

  function removeVaccination(key, index) {
    setPuppy((current) => ({
      ...current,
      [key]: current[key].filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  const loadPuppies = useCallback(async (authToken) => {
    const response = await fetch("/api/volunteer-portal/puppies", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("volunteerToken");
      setToken("");
      throw new Error("Your portal session is no longer active. Please sign in again.");
    }
    if (!response.ok) throw new Error("Could not load puppy records.");
    setPuppies(await response.json());
  }, []);

  useEffect(() => {
    if (token) {
      loadPuppies(token).catch((error) => setMessage({ type: "error", text: error.message }));
    }
  }, [loadPuppies, token]);

  async function submitAccount(event) {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });
    try {
      if (mode === "setup" && credentials.password !== credentials.confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      const endpoint = {
        login: "/api/volunteer-portal/login",
        forgot: "/api/volunteer-portal/password-link",
        setup: "/api/volunteer-portal/set-password",
      }[mode];
      const body = mode === "setup"
        ? { token: setupToken, password: credentials.password }
        : mode === "forgot"
          ? { email: credentials.email }
          : { email: credentials.email, password: credentials.password };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not complete the request.");
      if (mode === "forgot") {
        setMessage({ type: "success", text: data.message });
      } else if (mode === "setup") {
        setSearchParams({});
        setMode("login");
        setCredentials((current) => ({ ...current, password: "", confirmPassword: "" }));
        setMessage({ type: "success", text: "Password set. You can now sign in." });
      } else {
        sessionStorage.setItem("volunteerToken", data.token);
        setToken(data.token);
        setMessage({ type: "success", text: `Welcome, ${data.name}.` });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function submitPuppy(event) {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });
    try {
      const formData = new FormData();
      Object.entries(puppy).forEach(([key, value]) => {
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      });
      photos.forEach((photo) => formData.append("photos", photo));
      const response = await fetch("/api/volunteer-portal/puppies", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not register this puppy.");
      setPuppies((current) => [data, ...current]);
      setPuppy(EMPTY_PUPPY);
      setPhotos([]);
      event.target.reset();
      setMessage({ type: "success", text: `Puppy registered with tag ${data.tagNumber}.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function submitAdoption(event, puppyId) {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await fetch(`/api/volunteer-portal/puppies/${puppyId}/adoption`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(adopter),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not record this adoption.");
      setPuppies((current) => current.map((item) => item._id === puppyId ? data : item));
      setAdoptingId("");
      setAdopter({ name: "", phone: "", address: "", publicNameConsent: false });
      setMessage({ type: "success", text: `Adoption recorded for ${data.tagNumber}.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("volunteerToken");
    setToken("");
    setPuppies([]);
    setMessage({ type: "", text: "" });
  }

  const adoptedCount = puppies.filter((item) => item.status === "adopted").length;
  const availableCount = puppies.length - adoptedCount;

  if (!token) {
    const settingPassword = mode === "setup";
    const requestingPasswordLink = mode === "forgot";
    const title = settingPassword
      ? "Set your password"
      : requestingPasswordLink
        ? "Password setup link"
        : "Volunteer portal";
    return (
      <main className="min-h-screen bg-[#f1ece2] px-4 py-16 text-stone-900">
        <div className="mx-auto max-w-lg rounded-3xl border border-stone-200 bg-white p-7 shadow-xl sm:p-10">
          <div className="mb-8 flex items-center gap-3 text-orange-700">
            <PawPrint size={27} />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Tails of Bijapur · Internal</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {settingPassword
              ? "Choose a new password for your volunteer account. This secure link expires after 24 hours."
              : requestingPasswordLink
                ? "Enter the email you registered with. If your account is approved, we’ll send a password reset link."
                : "Sign in to register puppies and keep their adoption records up to date. New volunteers should apply on the Volunteer page and create a password there. Admin approval activates portal access."}
          </p>
          <form onSubmit={submitAccount} className="mt-7 space-y-4">
            {mode !== "setup" && (
              <Field label="Email">
                <input className={inputClass} type="email" autoComplete="email" maxLength={254} required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} />
              </Field>
            )}
            {(mode === "login" || settingPassword) && (
              <Field label={settingPassword ? "New password (12+ characters)" : "Password"}>
                <input className={inputClass} type="password" autoComplete={settingPassword ? "new-password" : "current-password"} minLength={settingPassword ? 12 : undefined} maxLength={settingPassword ? 72 : 128} required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} />
              </Field>
            )}
            {settingPassword && (
              <Field label="Confirm new password">
                <input className={inputClass} type="password" autoComplete="new-password" minLength={12} maxLength={72} required value={credentials.confirmPassword} onChange={(event) => setCredentials({ ...credentials, confirmPassword: event.target.value })} />
              </Field>
            )}
            {message.text && (
              <p className={`rounded-xl p-3 text-sm ${message.type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`} role="status">{message.text}</p>
            )}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 font-bold text-white transition hover:bg-orange-700 disabled:opacity-60">
              {busy ? "Please wait…" : settingPassword ? "Set password" : requestingPasswordLink ? "Send reset link" : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>
          {!settingPassword && (
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              {mode !== "login" && (
                <button type="button" className="text-orange-800 underline underline-offset-4" onClick={() => { setMode("login"); setMessage({ type: "", text: "" }); }}>
                  Back to sign in
                </button>
              )}
              {mode === "login" && (
                <>
                  <button type="button" className="text-orange-800 underline underline-offset-4" onClick={() => { setMode("forgot"); setMessage({ type: "", text: "" }); }}>
                    Forgot your password?
                  </button>
                  <Link to="/volunteer" className="text-orange-800 underline underline-offset-4">
                    New volunteer? Apply here
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e9] px-4 py-6 text-stone-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="relative mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#4a251b] via-[#702f1a] to-[#a3471e] px-6 py-8 text-white shadow-xl shadow-orange-950/10 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.17em] text-orange-100">
                <PawPrint size={13} /> Volunteer workspace
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Puppy intake & adoption</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50/80 sm:text-base">Every record helps a rescued puppy find a safer, healthier next chapter.</p>
            </div>
            <button onClick={logout} className="relative inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20">
            <LogOut size={16} /> Sign out
            </button>
          </div>
          <div className="relative mt-7 grid max-w-lg grid-cols-3 gap-3">
            {[
              { label: "Puppies recorded", value: puppies.length, icon: PawPrint },
              { label: "Available", value: availableCount, icon: Heart },
              { label: "Adopted", value: adoptedCount, icon: Check },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm sm:px-4">
                <div className="flex items-center gap-2 text-orange-100/80"><Icon size={15} /><span className="text-[10px] font-bold uppercase tracking-wider sm:text-[11px]">{label}</span></div>
                <p className="mt-1 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </header>

        {message.text && (
          <p className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm shadow-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role="status">
            {message.type === "error" ? <X size={18} className="mt-0.5 shrink-0" /> : <Check size={18} className="mt-0.5 shrink-0" />}
            {message.text}
          </p>
        )}

        <section className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(70,43,22,0.3)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 bg-gradient-to-r from-white to-orange-50/60 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-orange-100 p-3 text-orange-900"><Camera size={21} /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-800">New record</p>
                <h2 className="mt-0.5 text-xl font-black sm:text-2xl">Register a puppy</h2>
                <p className="mt-1 text-sm text-stone-600">A unique tag number is assigned after registration.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-600 ring-1 ring-stone-200"><ShieldCheck size={15} className="text-emerald-700" /> Secure volunteer record</span>
          </div>
          <form onSubmit={submitPuppy} className="space-y-7 p-5 sm:p-8">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-900">1</span>
                <div><h3 className="font-black text-stone-900">About the puppy</h3><p className="text-xs text-stone-500">Basic identification details</p></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Puppy name (if known)">
                  <input className={inputClass} maxLength={80} placeholder="Leave blank if unknown" value={puppy.name} onChange={(event) => setPuppy({ ...puppy, name: event.target.value })} />
                </Field>
                <Field label="Age">
                  <input className={inputClass} placeholder="e.g. 8 weeks" maxLength={40} required value={puppy.age} onChange={(event) => setPuppy({ ...puppy, age: event.target.value })} />
                </Field>
                <Field label="Gender">
                  <select className={inputClass} required value={puppy.gender} onChange={(event) => setPuppy({ ...puppy, gender: event.target.value })}>
                    <option value="">Select gender</option><option value="female">Female</option><option value="male">Male</option><option value="unknown">Unknown</option>
                  </select>
                </Field>
              </div>
            </section>
            <section className="border-t border-stone-100 pt-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-900">2</span>
                <div><h3 className="font-black text-stone-900">Vaccination record</h3><p className="text-xs text-stone-500">Add a date for each dose already given; both vaccine sections are optional.</p></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { key: "dhppiVaccinations", title: "DHPPi", entryLabel: "Dose", addLabel: puppy.dhppiVaccinations.length ? "Add another DHPPi dose" : "Add DHPPi dose" },
                  { key: "antiRabiesVaccinations", title: "Anti-rabies", entryLabel: "Vaccination", addLabel: puppy.antiRabiesVaccinations.length ? "Add another anti-rabies entry" : "Add anti-rabies date" },
                ].map(({ key, title, entryLabel, addLabel }) => (
                  <div key={key} className="rounded-2xl border border-stone-200 bg-[#faf9f6] p-4 sm:p-5">
                    <h4 className="flex items-center gap-2 font-black text-stone-900"><span className="rounded-lg bg-white p-2 text-orange-800 shadow-sm"><ClipboardList size={16} /></span>{title}</h4>
                    <p className="mt-1 text-xs leading-5 text-stone-500">Select the date shown on the vaccination record.</p>
                    <div className="mt-4 space-y-3">
                      {puppy[key].map((date, index) => (
                        <div key={`${key}-${index}`} className="flex items-end gap-2">
                          <Field label={`${entryLabel} ${index + 1} date`}>
                            <span className="relative block">
                              <CalendarDays size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                              <input className={`${inputClass} pl-10`} type="date" required value={date} onChange={(event) => updateVaccination(key, index, event.target.value)} />
                            </span>
                          </Field>
                          <button
                            type="button"
                            onClick={() => removeVaccination(key, index)}
                            aria-label={`Remove ${title} ${entryLabel.toLowerCase()} ${index + 1}`}
                            className="mb-0.5 rounded-xl border border-stone-300 p-3 text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      {puppy[key].length === 0 && (
                        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-3 py-3 text-sm text-stone-500">No {title} doses recorded yet.</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => addVaccination(key)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-800/20 bg-white px-3 py-2.5 text-sm font-bold text-orange-900 transition hover:bg-orange-50"
                    >
                      <Plus size={17} /> {addLabel}
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className="border-t border-stone-100 pt-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-sky-900">3</span>
                <div><h3 className="font-black text-stone-900">Foster & photo</h3><p className="text-xs text-stone-500">Add a contact name, location and one clear photo.</p></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name of the foster">
                  <input className={inputClass} maxLength={100} required placeholder="Foster's full name" value={puppy.fosterName} onChange={(event) => setPuppy({ ...puppy, fosterName: event.target.value })} />
                </Field>
                <Field label="Location">
                  <span className="relative block"><MapPin size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input className={`${inputClass} pl-10`} maxLength={200} required placeholder="Area or neighbourhood" value={puppy.location} onChange={(event) => setPuppy({ ...puppy, location: event.target.value })} /></span>
                </Field>
                <Field label="Puppy photo · JPG or PNG, up to 5 MB">
                  <span className="flex items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-600 transition hover:border-orange-500 hover:bg-orange-50/40">
                    <Upload size={18} className="shrink-0 text-orange-800" />
                    <input className="min-w-0 flex-1 text-xs" type="file" accept="image/jpeg,image/png" required onChange={(event) => setPhotos(Array.from(event.target.files || []).slice(0, 1))} />
                  </span>
                  {photos.length > 0 && <span className="text-xs font-semibold text-emerald-800">Photo ready: {photos[0].name}</span>}
                </Field>
              </div>
            </section>
            <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-stone-500">Please check dates and details before saving.</p>
              <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-900 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-950/15 transition hover:-translate-y-0.5 hover:bg-orange-950 disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? "Registering puppy…" : <><PawPrint size={17} /> Register puppy</>}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-800">Intake & adoption</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Your puppy records</h2><p className="mt-1 text-sm text-stone-600">Track each rescue from intake through adoption.</p></div>
            <span className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-600 shadow-sm">{puppies.length} {puppies.length === 1 ? "record" : "records"}</span>
          </div>
          {puppies.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/75 px-6 py-12 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-900"><PawPrint size={26} /></span>
              <h3 className="mt-4 font-black text-stone-900">Your records will appear here</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-stone-600">Register a puppy above to keep its details, vaccination history and adoption status together.</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {puppies.map((item) => (
                <article key={item._id} className="group overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_12px_36px_-28px_rgba(70,43,22,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative h-52 overflow-hidden bg-stone-100 sm:h-60">
                    {item.photos?.[0] ? <img className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" src={item.photos[0].url} alt={item.name || `Puppy ${item.tagNumber}`} /> : <div className="flex h-full items-center justify-center text-stone-300"><PawPrint size={42} /></div>}
                    <span className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black capitalize shadow-sm backdrop-blur ${item.status === "adopted" ? "bg-emerald-50/95 text-emerald-900" : "bg-white/95 text-sky-900"}`}>
                      {item.status === "adopted" ? <Heart size={13} /> : <PawPrint size={13} />}{item.status}
                    </span>
                    <span className="absolute bottom-3 left-3 rounded-lg bg-stone-950/75 px-2.5 py-1.5 text-[11px] font-black tracking-wider text-white backdrop-blur">{item.tagNumber}</span>
                  </div>
                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><h3 className="text-2xl font-black tracking-tight text-stone-900">{item.name || "Unnamed puppy"}</h3><p className="mt-1 text-sm text-stone-500">{item.age} <span className="px-1 text-stone-300">·</span> <span className="capitalize">{item.gender}</span></p></div>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-stone-50 p-3"><dt className="font-bold text-stone-500">DHPPi</dt>
                        <dd>{item.dhppiVaccinations?.length
                          ? `${item.dhppiVaccinations.length} dose(s) · ${item.dhppiVaccinations.map(formatVaccinationDate).join(", ")}`
                          : item.dhppiDoseCount != null
                            ? `${item.dhppiDoseCount} dose(s) recorded; dates unavailable`
                            : "Not recorded"}</dd>
                      </div>
                      <div className="rounded-xl bg-stone-50 p-3"><dt className="font-bold text-stone-500">Anti-rabies</dt>
                        <dd>{item.antiRabiesVaccinations?.length
                          ? item.antiRabiesVaccinations.map(formatVaccinationDate).join(", ")
                          : item.antiRabiesDate || "Not recorded"}</dd>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-stone-600"><Users size={15} className="shrink-0 text-orange-800" /><span><strong className="text-stone-800">Foster:</strong> {item.fosterName || "Not recorded"}</span></div>
                      <div className="col-span-2 flex items-center gap-2 text-stone-600"><MapPin size={15} className="shrink-0 text-orange-800" /><span><strong className="text-stone-800">Location:</strong> {item.location || item.rescueLocation || "Not recorded"}</span></div>
                      {item.vaccination && <div className="col-span-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-stone-700"><dt className="font-bold text-amber-900">Previous vaccination notes</dt><dd className="mt-1">{item.vaccination}</dd></div>}
                    </dl>
                    {item.status === "adopted" ? (
                      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 text-sm leading-6 text-emerald-950">
                        <p className="flex items-center gap-2 font-black"><Heart size={16} className="text-emerald-700" /> Adoption complete</p>
                        <p className="mt-1">Adopted by <strong>{item.adoption.name}</strong></p>
                        <p className="text-stone-600">{item.adoption.phone}</p><p className="text-stone-600">{item.adoption.address}</p>
                        <p className="mt-1 text-xs text-emerald-800">{new Date(item.adoption.adoptedAt).toLocaleString()}</p>
                        <button
                          type="button"
                          onClick={() => setHealthCardPuppy(item)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-900"
                        >
                          <Download size={17} /> View & download health card
                        </button>
                      </div>
                    ) : adoptingId === item._id ? (
                      <form onSubmit={(event) => submitAdoption(event, item._id)} className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <p className="flex items-center gap-2 font-black text-stone-900"><Heart size={16} className="text-emerald-700" /> Record adoption</p>
                        <input className={inputClass} placeholder="Adopter full name" aria-label="Adopter full name" maxLength={100} required value={adopter.name} onChange={(event) => setAdopter({ ...adopter, name: event.target.value })} />
                        <input className={inputClass} placeholder="Phone number" aria-label="Phone number" type="tel" inputMode="tel" maxLength={20} required value={adopter.phone} onChange={(event) => setAdopter({ ...adopter, phone: event.target.value })} />
                        <textarea className={inputClass} placeholder="Full address" aria-label="Full address" rows={3} maxLength={500} required value={adopter.address} onChange={(event) => setAdopter({ ...adopter, address: event.target.value })} />
                        <label className="flex items-start gap-3 text-sm leading-5 text-stone-600">
                          <input
                            type="checkbox"
                            className="mt-1 accent-orange-800"
                            checked={adopter.publicNameConsent}
                            onChange={(event) => setAdopter({ ...adopter, publicNameConsent: event.target.checked })}
                          />
                          <span>The adopter agrees to show their first name on the public adoption drive dashboard.</span>
                        </label>
                        <div className="flex gap-3">
                          <button disabled={busy} className="flex-1 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:opacity-60">{busy ? "Saving…" : "Confirm adoption"}</button>
                          <button type="button" onClick={() => setAdoptingId("")} className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold transition hover:bg-stone-100">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => setAdoptingId(item._id)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-800/15 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 transition hover:border-emerald-800/30 hover:bg-emerald-100">
                        <Heart size={16} /> Record adoption
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      {healthCardPuppy && createPortal(
        <div className="health-card-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4">
          <section
            id="puppy-health-card-print"
            role="dialog"
            aria-modal="true"
            aria-labelledby="health-card-title"
            className="my-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8"
          >
            <div className="health-card-actions mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-stone-900">Puppy health card preview</h2>
              <button
                type="button"
                onClick={() => setHealthCardPuppy(null)}
                aria-label="Close health card preview"
                className="rounded-full border border-stone-300 p-2 text-stone-600 hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="health-card-content overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <header className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#4a251b] to-[#9a411e] px-5 py-5 text-white sm:px-7">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-100"><PawPrint size={13} /> Tails of Bijapur</p>
                  <h1 id="health-card-title" className="mt-1 text-2xl font-black sm:text-3xl">Puppy health card</h1>
                  <p className="mt-1 text-xs text-orange-50/80 sm:text-sm">Adoption & vaccination record</p>
                </div>
                {healthCardPuppy.photos?.[0] && (
                  <img
                    className="h-20 w-20 rounded-2xl border-2 border-white/50 object-cover shadow-md sm:h-24 sm:w-24"
                    src={healthCardPuppy.photos[0].url}
                    alt={healthCardPuppy.name || `Puppy ${healthCardPuppy.tagNumber}`}
                  />
                )}
              </header>
              <section className="border-b border-stone-100 px-5 py-4 sm:px-7">
                <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-900"><PawPrint size={14} /> Puppy details</h3>
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-stone-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Name</dt><dd className="mt-0.5 text-sm font-bold text-stone-900">{healthCardPuppy.name || "Unnamed puppy"}</dd></div>
                  <div className="rounded-xl bg-stone-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Tag number</dt><dd className="mt-0.5 text-sm font-bold text-stone-900">{healthCardPuppy.tagNumber}</dd></div>
                  <div className="rounded-xl bg-stone-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Age</dt><dd className="mt-0.5 text-sm font-bold text-stone-900">{healthCardPuppy.age || "Not recorded"}</dd></div>
                  <div className="rounded-xl bg-stone-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Gender</dt><dd className="mt-0.5 text-sm font-bold capitalize text-stone-900">{healthCardPuppy.gender || "Not recorded"}</dd></div>
                </dl>
              </section>
              <section className="border-b border-stone-100 px-5 py-4 sm:px-7">
                <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-900"><ClipboardList size={14} /> Vaccination history</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-stone-100 bg-[#faf9f6] p-3">
                    <h4 className="text-sm font-black text-stone-900">DHPPi</h4>
                    {healthCardPuppy.dhppiVaccinations?.length ? (
                      <ol className="mt-1.5 list-inside list-decimal space-y-0.5 text-sm text-stone-700">
                        {healthCardPuppy.dhppiVaccinations.map((date, index) => <li key={`${date}-${index}`}>Dose {index + 1} · {formatVaccinationDate(date)}</li>)}
                      </ol>
                    ) : healthCardPuppy.dhppiDoseCount != null ? (
                      <p className="mt-2 text-sm text-stone-700">{healthCardPuppy.dhppiDoseCount} dose(s) recorded; dates unavailable.</p>
                    ) : (
                      <p className="mt-2 text-sm text-stone-500">No doses recorded.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-stone-100 bg-[#faf9f6] p-3">
                    <h4 className="text-sm font-black text-stone-900">Anti-rabies</h4>
                    {healthCardPuppy.antiRabiesVaccinations?.length ? (
                      <ol className="mt-1.5 list-inside list-decimal space-y-0.5 text-sm text-stone-700">
                        {healthCardPuppy.antiRabiesVaccinations.map((date, index) => <li key={`${date}-${index}`}>{formatVaccinationDate(date)}</li>)}
                      </ol>
                    ) : (
                      <p className="mt-2 text-sm text-stone-500">{healthCardPuppy.antiRabiesDate || "No doses recorded."}</p>
                    )}
                  </div>
                </div>
                {healthCardPuppy.vaccination && <p className="mt-3 text-sm text-stone-600"><span className="font-bold">Previous vaccination notes:</span> {healthCardPuppy.vaccination}</p>}
              </section>
              <section className="px-5 py-4 sm:px-7">
                <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-900"><Users size={14} /> Foster details</h3>
                <dl className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-orange-50/70 px-3 py-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Foster name</dt><dd className="mt-0.5 text-sm font-bold text-stone-900">{healthCardPuppy.fosterName || "Not recorded"}</dd></div>
                  <div className="rounded-xl bg-orange-50/70 px-3 py-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Location</dt><dd className="mt-0.5 text-sm font-bold text-stone-900">{healthCardPuppy.location || healthCardPuppy.rescueLocation || "Not recorded"}</dd></div>
                </dl>
              </section>
              <p className="border-t border-stone-100 bg-stone-50 px-5 py-3 text-[10px] leading-4 text-stone-500 sm:px-7">
                This card reflects the vaccination information recorded at intake. Please consult a veterinarian to confirm the puppy’s ongoing vaccination and care schedule.
              </p>
            </div>
            <div className="health-card-actions mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setHealthCardPuppy(null)}
                className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-800 px-5 py-3 text-sm font-bold text-white hover:bg-orange-900"
              >
                <Download size={17} /> Download / print
              </button>
            </div>
          </section>
          <style>{`
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body > *:not(.health-card-overlay) { display: none !important; }
              .health-card-overlay,
              .health-card-overlay * { visibility: visible !important; }
              #puppy-health-card-print {
                position: static !important;
                display: block !important;
                width: 190mm !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              #puppy-health-card-print > div:nth-child(2) { border: 1px solid #d6d3d1 !important; }
              .health-card-content {
                font-size: 9pt !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              .health-card-content header { padding: 4mm 5mm !important; }
              .health-card-content section { padding: 3mm 5mm !important; }
              .health-card-content img { width: 23mm !important; height: 23mm !important; }
              .health-card-content p { line-height: 1.3 !important; }
              .health-card-content h1 { font-size: 20pt !important; }
              .health-card-content h3 { margin-bottom: 2mm !important; }
              .health-card-content ol { margin-top: 1mm !important; }
              .health-card-content li, .health-card-content dd { font-size: 9pt !important; }
              .health-card-overlay {
                position: static !important;
                display: block !important;
                width: 190mm !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
                background: white !important;
                padding: 0 !important;
              }
              .health-card-overlay > section { margin: 0 !important; }
              .health-card-actions { display: none !important; }
            }
          `}</style>
        </div>,
        document.body
      )}
    </main>
  );
}
