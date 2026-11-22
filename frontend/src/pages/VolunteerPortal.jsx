import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarDays, Camera, Check, LogOut, PawPrint, Plus, Trash2, Upload } from "lucide-react";

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
    <main className="min-h-screen bg-[#f1ece2] px-4 py-10 text-stone-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-800">Internal volunteer portal</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Puppy intake & adoption</h1>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold hover:border-orange-700 hover:text-orange-800">
            <LogOut size={16} /> Sign out
          </button>
        </header>

        {message.text && (
          <p className={`mb-6 rounded-xl border p-4 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`} role="status">{message.text}</p>
        )}

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-xl bg-orange-100 p-3 text-orange-800"><Camera size={21} /></span>
            <div>
              <h2 className="text-xl font-black">Register a puppy</h2>
              <p className="text-sm text-stone-600">A unique tag number is assigned automatically after registration.</p>
            </div>
          </div>
          <form onSubmit={submitPuppy} className="grid gap-5 md:grid-cols-2">
            <Field label="Puppy name (if known)">
              <input className={inputClass} maxLength={80} value={puppy.name} onChange={(event) => setPuppy({ ...puppy, name: event.target.value })} />
            </Field>
            <Field label="Age">
              <input className={inputClass} placeholder="e.g. 8 weeks" maxLength={40} required value={puppy.age} onChange={(event) => setPuppy({ ...puppy, age: event.target.value })} />
            </Field>
            <Field label="Gender">
              <select className={inputClass} required value={puppy.gender} onChange={(event) => setPuppy({ ...puppy, gender: event.target.value })}>
                <option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="unknown">Unknown</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-stone-700">Vaccination record</h3>
                <p className="mt-1 text-sm text-stone-500">Add a date for each vaccine dose already given. You can leave either vaccine blank.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { key: "dhppiVaccinations", title: "DHPPi", entryLabel: "Dose", addLabel: puppy.dhppiVaccinations.length ? "Add another DHPPi dose" : "Add DHPPi dose" },
                  { key: "antiRabiesVaccinations", title: "Anti-rabies", entryLabel: "Vaccination", addLabel: puppy.antiRabiesVaccinations.length ? "Add another anti-rabies entry" : "Add anti-rabies date" },
                ].map(({ key, title, entryLabel, addLabel }) => (
                  <div key={key} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <h4 className="font-bold text-stone-900">{title}</h4>
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
            </div>
            <Field label="Name of the foster">
              <input className={inputClass} maxLength={100} required value={puppy.fosterName} onChange={(event) => setPuppy({ ...puppy, fosterName: event.target.value })} />
            </Field>
            <Field label="Location">
              <input className={inputClass} maxLength={200} required value={puppy.location} onChange={(event) => setPuppy({ ...puppy, location: event.target.value })} />
            </Field>
            <Field label="Photo (1 max, JPG or PNG; max 5 MB)">
              <span className="flex items-center gap-3 rounded-xl border border-dashed border-stone-400 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                <Upload size={18} />
                <input className="min-w-0 flex-1 text-xs" type="file" accept="image/jpeg,image/png" required onChange={(event) => setPhotos(Array.from(event.target.files || []).slice(0, 1))} />
              </span>
              {photos.length > 0 && <span className="text-xs text-stone-500">1 photo selected</span>}
            </Field>
            <button type="submit" disabled={busy} className="md:col-span-2 rounded-xl bg-orange-800 px-5 py-3.5 font-bold text-white transition hover:bg-orange-900 disabled:opacity-60">
              {busy ? "Registering puppy…" : "Register puppy"}
            </button>
          </form>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Your puppy records</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-stone-600">{puppies.length} total</span>
          </div>
          {puppies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-400 bg-white/60 p-10 text-center text-stone-600">No puppies registered yet.</div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {puppies.map((item) => (
                <article key={item._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  {item.photos?.[0] && <img className="h-56 w-full object-cover" src={item.photos[0].url} alt={item.name || `Puppy ${item.tagNumber}`} />}
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="text-xs font-black uppercase tracking-widest text-orange-800">{item.tagNumber}</p><h3 className="mt-1 text-xl font-black">{item.name || "Unnamed puppy"}</h3></div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${item.status === "adopted" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{item.status}</span>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-stone-600">
                      <div><dt className="font-bold text-stone-800">Age</dt><dd>{item.age}</dd></div>
                      <div><dt className="font-bold text-stone-800">Gender</dt><dd>{item.gender}</dd></div>
                      <div className="col-span-2">
                        <dt className="font-bold text-stone-800">DHPPi doses</dt>
                        <dd>{item.dhppiVaccinations?.length
                          ? item.dhppiVaccinations.map(formatVaccinationDate).join(", ")
                          : item.dhppiDoseCount != null
                            ? `${item.dhppiDoseCount} dose(s) recorded; dates unavailable`
                            : "Not recorded"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="font-bold text-stone-800">Anti-rabies dates</dt>
                        <dd>{item.antiRabiesVaccinations?.length
                          ? item.antiRabiesVaccinations.map(formatVaccinationDate).join(", ")
                          : item.antiRabiesDate || "Not recorded"}</dd>
                      </div>
                      <div><dt className="font-bold text-stone-800">Foster</dt><dd>{item.fosterName || "Not recorded"}</dd></div>
                      <div><dt className="font-bold text-stone-800">Location</dt><dd>{item.location || item.rescueLocation || "Not recorded"}</dd></div>
                      {item.vaccination && <div className="col-span-2"><dt className="font-bold text-stone-800">Previous vaccination notes</dt><dd>{item.vaccination}</dd></div>}
                    </dl>
                    {item.status === "adopted" ? (
                      <div className="rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-950">
                        <p className="mb-1 flex items-center gap-2 font-bold"><Check size={16} /> Adopted by {item.adoption.name}</p>
                        <p>{item.adoption.phone}</p><p>{item.adoption.address}</p>
                        <p className="mt-1 text-xs text-green-800">{new Date(item.adoption.adoptedAt).toLocaleString()}</p>
                      </div>
                    ) : adoptingId === item._id ? (
                      <form onSubmit={(event) => submitAdoption(event, item._id)} className="space-y-3 rounded-xl bg-stone-50 p-4">
                        <p className="font-bold">Adopter details · {item.tagNumber}</p>
                        <input className={inputClass} placeholder="Adopter full name" maxLength={100} required value={adopter.name} onChange={(event) => setAdopter({ ...adopter, name: event.target.value })} />
                        <input className={inputClass} placeholder="Phone number" type="tel" inputMode="tel" maxLength={20} required value={adopter.phone} onChange={(event) => setAdopter({ ...adopter, phone: event.target.value })} />
                        <textarea className={inputClass} placeholder="Full address" rows={3} maxLength={500} required value={adopter.address} onChange={(event) => setAdopter({ ...adopter, address: event.target.value })} />
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
                          <button disabled={busy} className="flex-1 rounded-xl bg-green-800 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">Confirm adoption</button>
                          <button type="button" onClick={() => setAdoptingId("")} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => setAdoptingId(item._id)} className="w-full rounded-xl border border-green-800/20 bg-green-50 px-4 py-3 text-sm font-bold text-green-900 hover:bg-green-100">
                        Record adoption
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
