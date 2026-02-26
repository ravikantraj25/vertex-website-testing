"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  name: string;
  usn: string;
  phone: string;
}

interface FormState {
  fullName: string;
  usn: string;
  email: string;
  phone: string;
  eventSlug: string;       // single event
  teamName: string;
  teamMembers: TeamMember[];
}

interface MemberError {
  name: string;
  usn: string;
  phone: string;
}

interface FormErrors {
  fullName: string;
  usn: string;
  email: string;
  phone: string;
}

type EmailVerificationStatus =
  | "idle"
  | "sending"
  | "otp_sent"
  | "verifying"
  | "verified"
  | "error";

interface EmailVerificationState {
  status: EmailVerificationStatus;
  message: string;
  resendCooldown: number;
}

type PaymentFlowStatus =
  | "idle"
  | "creating_registration"
  | "awaiting_screenshot"
  | "success"
  | "error";

interface EventItem {
  slug: string;
  label: string;
  icon: string;
  category: string;
  feeType: "free" | "per_person" | "per_team";
  fee: number;       // rupees
  min?: number;
  max?: number;
  exact?: number;
  note?: string;     // extra rule shown in UI
}

interface RegisterApiResponse {
  registrationId: string;
  amount: number;
  eventName: string;
}

// ─── Event Catalogue ──────────────────────────────────────────────────────────

const EVENTS: EventItem[] = [
  // Technical / Fun
  {
    slug: "ideathon", label: "Ideathon", icon: "🎯",
    category: "Technical / Fun",
    feeType: "free", fee: 0,
    min: 2, max: 3,
    note: "2–3 members · Free",
  },
  {
    slug: "bgmi", label: "BGMI", icon: "🎮",
    category: "Technical / Fun",
    feeType: "per_person", fee: 50,
    min: 1, max: 4,
    note: "₹50 per participant · Max 4 members",
  },
  {
    slug: "igp", label: "IGP", icon: "🎯",
    category: "Technical / Fun",
    feeType: "free", fee: 0,
    min: 1, max: 2,
    note: "1–2 members · Free",
  },
  
  {
    slug: "reel", label: "Reel", icon: "🎬",
    category: "Technical / Fun",
    feeType: "free", fee: 0,
    min: 1, max: 4,
    note: "Max 4 members · Free",
  },

  // Sports
  {
    slug: "cricket", label: "Cricket (Boys)", icon: "🏏",
    category: "Sports",
    feeType: "per_team", fee: 150,
    min: 8, max: 11,
    note: "8–11 members · ₹150 per team",
  },
  {
    slug: "volleyball", label: "Volleyball (Girls)", icon: "🏐",
    category: "Sports",
    feeType: "per_team", fee: 100,
    min: 6, max: 9,
    note: "6–9 members · ₹100 per team",
  },

  // 90's Playground
  {
    slug: "lagori", label: "Lagori", icon: "🪨",
    category: "90's Playground Classics",
    feeType: "free", fee: 0,
    exact: 6,
    note: "Exactly 6 members (3 boys + 3 girls) · Free",
  },
  {
    slug: "dodgeball", label: "Dodgeball", icon: "🔴",
    category: "90's Playground Classics",
    feeType: "free", fee: 0,
    exact: 6,
    note: "Exactly 6 members (3 boys + 3 girls) · Free",
  },

  // Fun Activity
  {
    slug: "cooking", label: "Cooking Without Fire", icon: "🍳",
    category: "Fun Activity",
    feeType: "per_team", fee: 50,
    exact: 2,
    note: "Exactly 2 members · ₹50 per team",
  },
];

const CATEGORIES = [...new Set(EVENTS.map((e) => e.category))];

// ─── Constants ────────────────────────────────────────────────────────────────

const USN_REGEX    = /^1ds\d{2}[a-z]{2}\d{3}$/i;
const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY  = "lumos_reg_form_v2";
const OTP_LENGTH   = 6;
const RESEND_SECS  = 30;
const MAX_SS_MB    = 5;

const defaultMember = (): TeamMember => ({ name: "", usn: "", phone: "" });

const defaultForm: FormState = {
  fullName:    "",
  usn:         "",
  email:       "",
  phone:       "",
  eventSlug:   "",
  teamName:    "",
  teamMembers: [],
};

// ─── Fee Calculation ──────────────────────────────────────────────────────────

function calcAmount(ev: EventItem | undefined, totalMembers: number): number {
  if (!ev || ev.feeType === "free") return 0;
  const paise = ev.fee * 100;
  return ev.feeType === "per_person" ? paise * totalMembers : paise;
}

function formatINR(paise: number): string {
  if (paise === 0) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// ─── Team size validation (mirrors backend) ───────────────────────────────────

function teamSizeError(ev: EventItem | undefined, totalMembers: number): string {
  if (!ev) return "";
  if (totalMembers === 0) return ""; // nothing to validate until event chosen

  if (ev.exact !== undefined) {
    if (totalMembers !== ev.exact)
      return `Exactly ${ev.exact} members required (including you). Currently: ${totalMembers}.`;
    return "";
  }
  const min = ev.min ?? 1;
  const max = ev.max ?? Infinity;
  if (totalMembers < min)
    return `At least ${min} member(s) required (including you). Currently: ${totalMembers}.`;
  if (totalMembers > max)
    return `At most ${max} members allowed (including you). Currently: ${totalMembers}.`;
  return "";
}

// How many teammates are needed at minimum (for UI guidance)
function minTeammates(ev: EventItem | undefined): number {
  if (!ev) return 0;
  if (ev.exact !== undefined) return ev.exact - 1;
  return Math.max(0, (ev.min ?? 1) - 1);
}

function maxTeammates(ev: EventItem | undefined): number {
  if (!ev) return 0;
  if (ev.exact !== undefined) return ev.exact - 1;
  return (ev.max ?? 1) - 1;
}

function needsTeam(ev: EventItem | undefined): boolean {
  if (!ev) return false;
  return maxTeammates(ev) > 0;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const validateUSN   = (v: string) => !v ? "USN is required" : !/^1ds/i.test(v) ? "Must start with '1DS'" : !USN_REGEX.test(v) ? "e.g. 1DS23ET045" : "";
const validateName  = (v: string) => !v.trim() ? "Required" : "";
const validateEmail = (v: string) => !v ? "Required" : !EMAIL_REGEX.test(v) ? "Invalid email" : "";
const validatePhone = (v: string) => !v?.trim() ? "Required" : v.replace(/\D/g,"").length !== 10 ? "10 digits required" : "";

// ─── API ──────────────────────────────────────────────────────────────────────

async function apiSendOtp(email: string) {
  const res = await fetch("/api/send-otp", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.message ?? "Failed to send OTP"); }
}

async function apiVerifyOtp(email: string, otp: string) {
  const res = await fetch("/api/verify-otp", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.message ?? "Invalid OTP"); }
}

async function apiRegister(form: FormState): Promise<RegisterApiResponse> {
  const body: Record<string, unknown> = {
    fullName:  form.fullName,
    usn:       form.usn,
    email:     form.email,
    phone:     form.phone,
    eventSlug: form.eventSlug,
  };

  if (form.teamMembers.length > 0 && form.teamName.trim()) {
    body.team = {
      name:    form.teamName.trim(),
      members: form.teamMembers.map((m) => ({ name: m.name, usn: m.usn, phone: m.phone })),
    };
  }

  const res = await fetch("/api/lumous-register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.message ?? "Registration failed"); }
  return res.json();
}

async function apiUploadScreenshot(registrationId: string, file: File) {
  const fd = new FormData();
  fd.append("registrationId", registrationId);
  fd.append("screenshot", file);
  const res = await fetch("/api/upload-payment-ss", { method: "POST", body: fd });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.message ?? "Upload failed"); }
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <svg className={`${s} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

function Field({
  label, id, error, required, hint, children,
}: {
  label: string; id: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-bold tracking-[0.12em] text-amber-400/70 uppercase flex items-center gap-1">
        {label}{required && <span className="text-amber-400">*</span>}
        {hint && <span className="text-zinc-500 normal-case tracking-normal font-normal ml-1">— {hint}</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            key="e" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            ✗ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
function Input({ className = "", ...p }: InputProps) {
  return (
    <input
      className={`w-full bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...p}
    />
  );
}

function Block({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-zinc-300">{title}</h2>
        <div className="flex-1 h-px bg-zinc-800"/>
      </div>
      {children}
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const commit = (d: string[]) => onChange(d.join(""));

  const onCh = (i: number, raw: string) => {
    const s = raw.replace(/\D/g,"").slice(-1);
    const d = [...digits]; d[i] = s; commit(d);
    if (s && i < OTP_LENGTH - 1) refs.current[i+1]?.focus();
  };
  const onKd = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const d = [...digits];
      if (d[i]) { d[i]=""; commit(d); } else if (i > 0) { d[i-1]=""; commit(d); refs.current[i-1]?.focus(); }
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i-1]?.focus();
    if (e.key === "ArrowRight" && i < OTP_LENGTH-1) refs.current[i+1]?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,OTP_LENGTH);
    commit(Array.from({ length: OTP_LENGTH }, (_, i) => p[i] ?? ""));
    refs.current[Math.min(p.length, OTP_LENGTH-1)]?.focus();
  };

  return (
    <div className="flex gap-2">
      {digits.map((d, i) => (
        <input
          key={i} ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={d} disabled={disabled}
          onChange={e => onCh(i, e.target.value)} onKeyDown={e => onKd(i, e)} onPaste={onPaste}
          className={`w-11 h-12 text-center text-lg font-bold rounded-lg border bg-zinc-900 text-white caret-transparent transition-all focus:outline-none disabled:opacity-40 ${d ? "border-amber-500 ring-1 ring-amber-500/30" : "border-zinc-700 focus:border-amber-500"}`}
        />
      ))}
    </div>
  );
}

// ─── QR Payment Screen ────────────────────────────────────────────────────────

function QrScreen({
  amount, registrationId, eventName, email, onSuccess, onReset,
}: {
  amount: number; registrationId: string; eventName: string; email: string;
  onSuccess: () => void; onReset: () => void;
}) {
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState("");
  const ref                   = useRef<HTMLInputElement>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!f.type.startsWith("image/")) { setErr("Image files only."); return; }
    if (f.size > MAX_SS_MB * 1024 * 1024) { setErr(`Max ${MAX_SS_MB}MB.`); return; }
    setErr(""); setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true); setErr("");
    try { await apiUploadScreenshot(registrationId, file); onSuccess(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
      {/* Amount banner */}
      <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Amount Due</p>
          <p className="text-4xl font-black text-white font-display">{formatINR(amount)}</p>
          <p className="text-xs text-zinc-500 mt-1">{eventName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-600 mb-1">Registration ID</p>
          <p className="font-mono text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">{registrationId.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* QR */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Scan & Pay via UPI</p>
        <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-black/60">
          <img src="/qr.jpeg" alt="UPI QR" className="w-52 h-52 object-contain"/>
        </div>
        <p className="text-xs text-zinc-500 text-center max-w-xs leading-relaxed">
          GPay · PhonePe · Paytm. After paying, upload your screenshot below.
        </p>
        <p className="text-xs text-amber-400 font-semibold">⚠ Do not close this page</p>
      </div>

      <div className="h-px bg-zinc-800"/>

      {/* Upload */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Upload Screenshot</p>
        <div
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${file ? "border-amber-500/50 bg-amber-950/10" : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/40"}`}
        >
          {preview
            ? <><img src={preview} className="max-h-40 rounded-lg object-contain"/><p className="text-xs text-amber-400">{file?.name}</p></>
            : <><div className="text-3xl">📎</div><p className="text-sm text-zinc-400">Click to select</p><p className="text-xs text-zinc-600">JPG · PNG · WebP · Max {MAX_SS_MB}MB</p></>
          }
        </div>
        <input ref={ref} type="file" accept="image/*" className="sr-only" onChange={onFile}/>

        {err && <p className="text-xs text-red-400">✗ {err}</p>}

        <div className="flex gap-3">
          <button
            onClick={submit} disabled={!file || busy}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${file && !busy ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}
          >
            {busy ? <><Spinner size="sm"/> Uploading…</> : "Submit for Verification"}
          </button>
          <button onClick={onReset} disabled={busy} className="px-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Cancel</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ email, eventName, onReset }: { email: string; eventName: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="flex flex-col items-center text-center gap-6 py-8"
    >
      <motion.div
        animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-7xl"
      >🎉</motion.div>

      <div>
        <h2 className="text-2xl font-black text-white font-display mb-2">You're In!</h2>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed mx-auto">
          Registration for <span className="text-amber-400 font-semibold">{eventName}</span> submitted.
          Confirmation will be sent to <span className="text-amber-400 font-semibold">{email}</span> within 24 hours.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left w-full max-w-xs flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">What's Next</p>
        {["Our team reviews your payment", "Confirmation email within 24hrs", "Your spot is reserved"].map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i+1}</span>
            <p className="text-xs text-zinc-400 leading-relaxed">{s}</p>
          </div>
        ))}
      </div>

      {/* Ideathon notice */}
      <div className="bg-yellow-950/40 border border-yellow-700/30 rounded-xl px-4 py-3 w-full max-w-xs">
        <p className="text-yellow-300 text-xs">
          Registered for <strong>Ideathon</strong>? Upload your PPT{" "}
          <a href="https://forms.gle/dummy" target="_blank" rel="noreferrer" className="underline font-semibold">here</a>.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <p className="text-xs text-zinc-600 text-center">Want to join another event?</p>
        <button
          onClick={onReset}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Register for Another Event
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LumousRegistrationPage() {
  const [form, setForm]     = useState<FormState>(defaultForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [ev, setEv] = useState<EmailVerificationState>({ status: "idle", message: "", resendCooldown: 0 });
  const [otp, setOtp]       = useState("");
  const [otpErr, setOtpErr] = useState("");

  const [flow, setFlow]               = useState<PaymentFlowStatus>("idle");
  const [flowErr, setFlowErr]         = useState("");
  const [regId, setRegId]             = useState<string | null>(null);
  const [regAmount, setRegAmount]     = useState(0);
  const [regEventName, setRegEventName] = useState("");

  const cooldown = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Restore ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setForm(p => ({ ...p, ...JSON.parse(s) })); } catch (_) {}
  }, []);

  useEffect(() => {
    if (flow !== "success") try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch (_) {}
  }, [form, flow]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedEv     = EVENTS.find(e => e.slug === form.eventSlug);
  const totalMembers   = 1 + form.teamMembers.length;
  const totalPaise     = calcAmount(selectedEv, totalMembers);
  const sizeErr        = selectedEv ? teamSizeError(selectedEv, totalMembers) : "";
  const minTm          = minTeammates(selectedEv);
  const maxTm          = maxTeammates(selectedEv);
  const needsTeamInput = needsTeam(selectedEv);

  const errors: FormErrors = {
    fullName: validateName(form.fullName),
    usn:      validateUSN(form.usn),
    email:    validateEmail(form.email),
    phone:    validatePhone(form.phone),
  };

  const memberErrors: MemberError[] = form.teamMembers.map(m => ({
    name:  validateName(m.name),
    usn:   validateUSN(m.usn),
    phone: validatePhone(m.phone),
  }));

  const teamNameErr = needsTeamInput && !form.teamName.trim() ? "Team name required" : "";

  const isFormValid =
    !errors.fullName && !errors.usn && !errors.email && !errors.phone &&
    ev.status === "verified" &&
    !!form.eventSlug &&
    !sizeErr &&
    (!needsTeamInput || !teamNameErr) &&
    memberErrors.every(e => !e.name && !e.usn && !e.phone);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const patch  = useCallback((p: Partial<FormState>) => setForm(f => ({ ...f, ...p })), []);
  const touch  = (f: string) => setTouched(p => ({ ...p, [f]: true }));

  // Auto-sync member count when event changes
  const handleEventChange = (slug: string) => {
    const next = EVENTS.find(e => e.slug === slug);
    const min  = minTeammates(next);
    const max  = maxTeammates(next);
    // Pre-fill with the minimum required teammates
    const members = Array.from({ length: min }, defaultMember);
    // Clamp existing members to max
    patch({
      eventSlug:   slug,
      teamName:    "",
      teamMembers: members,
    });
  };

  // ── OTP handlers ─────────────────────────────────────────────────────────
  const resetEmailFlow = () => {
    setEv({ status: "idle", message: "", resendCooldown: 0 });
    setOtp(""); setOtpErr("");
    if (cooldown.current) clearInterval(cooldown.current);
  };

  const startCooldown = useCallback(() => {
    setEv(p => ({ ...p, resendCooldown: RESEND_SECS }));
    if (cooldown.current) clearInterval(cooldown.current);
    cooldown.current = setInterval(() => {
      setEv(p => {
        if (p.resendCooldown <= 1) { clearInterval(cooldown.current!); return { ...p, resendCooldown: 0 }; }
        return { ...p, resendCooldown: p.resendCooldown - 1 };
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldown.current) clearInterval(cooldown.current); }, []);

  const sendOtp = async () => {
    touch("email"); if (errors.email) return;
    setEv({ status: "sending", message: "", resendCooldown: 0 }); setOtp(""); setOtpErr("");
    try { await apiSendOtp(form.email); setEv({ status: "otp_sent", message: "", resendCooldown: 0 }); startCooldown(); }
    catch (e: unknown) { setEv({ status: "error", message: e instanceof Error ? e.message : "Failed", resendCooldown: 0 }); }
  };

  const resendOtp = async () => {
    if (ev.resendCooldown > 0) return;
    setEv(p => ({ ...p, status: "sending", message: "" })); setOtp(""); setOtpErr("");
    try { await apiSendOtp(form.email); setEv({ status: "otp_sent", message: "OTP resent!", resendCooldown: 0 }); startCooldown(); }
    catch (e: unknown) { setEv(p => ({ ...p, status: "otp_sent", message: e instanceof Error ? e.message : "Failed" })); }
  };

  const verifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) { setOtpErr(`Enter all ${OTP_LENGTH} digits`); return; }
    setOtpErr(""); setEv(p => ({ ...p, status: "verifying", message: "" }));
    try { await apiVerifyOtp(form.email, otp); clearInterval(cooldown.current!); setEv({ status: "verified", message: "", resendCooldown: 0 }); }
    catch (e: unknown) { setOtpErr(e instanceof Error ? e.message : "Wrong OTP"); setEv(p => ({ ...p, status: "otp_sent" })); }
  };

  // ── Team helpers ──────────────────────────────────────────────────────────
  const addMember = () => {
    if (form.teamMembers.length >= maxTm) return;
    patch({ teamMembers: [...form.teamMembers, defaultMember()] });
  };
  const removeMember = (i: number) => {
    if (form.teamMembers.length <= minTm) return;
    patch({ teamMembers: form.teamMembers.filter((_,idx) => idx !== i) });
  };
  const updateMember = (i: number, f: keyof TeamMember, v: string) => {
    patch({ teamMembers: form.teamMembers.map((m,idx) => idx === i ? { ...m, [f]: v } : m) });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!isFormValid) return;
    setFlow("creating_registration"); setFlowErr("");
    try {
      const data = await apiRegister(form);
      setRegId(data.registrationId); setRegAmount(data.amount); setRegEventName(data.eventName);
      if (data.amount === 0) { localStorage.removeItem(STORAGE_KEY); setFlow("success"); }
      else setFlow("awaiting_screenshot");
    } catch (e: unknown) {
      setFlowErr(e instanceof Error ? e.message : "Registration failed");
      setFlow("error");
    }
  };

  const reset = () => {
    setForm(defaultForm); setTouched({});
    setEv({ status: "idle", message: "", resendCooldown: 0 }); setOtp(""); setOtpErr("");
    setFlow("idle"); setFlowErr(""); setRegId(null); setRegAmount(0); setRegEventName("");
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── Grouped events for display ────────────────────────────────────────────
  const grouped = CATEGORIES.map(cat => ({ cat, events: EVENTS.filter(e => e.category === cat) }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-14"
      style={{ backgroundImage: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(251,191,36,0.06), transparent 70%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="w-full max-w-xl">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
            Registrations Open
          </div>
          <h1 className="font-display text-6xl sm:text-7xl text-white mb-2 leading-none">
            LUMOS <span className="text-amber-400">2026</span>
          </h1>
          <p className="text-zinc-500 text-sm">Event Registration · Dayananda Sagar College</p>
        </motion.div>

        {/* ── Notice: one event per registration ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6 bg-amber-950/30 border border-amber-700/30 rounded-xl px-4 py-4"
        >
          <p className="text-amber-300 text-xs font-semibold mb-2 uppercase tracking-widest">ℹ Important</p>
          <ul className="text-amber-200/80 text-xs space-y-1.5 list-none">
            <li>→ <strong>One registration = one event.</strong> If you want to register for multiple events, please register separately for each event.</li>
            <li>→ Read all rules before registering. Team size limits are strictly enforced.</li>
            <li>→ Ideathon participants must upload PPT separately after registration.</li>
            <li>→ <strong>Make sure your name is visible in payment screenshot</strong></li>
          </ul>
          <div className="mt-3 pt-3 border-t border-amber-800/30 text-amber-400/60 text-xs">
            Queries: 📞 Naman Singh — 8334072002 &nbsp;|&nbsp; Shefali — 8867429955
          </div>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
        >
          <div className="h-0.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"/>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">

              {/* Loading */}
              {flow === "creating_registration" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-20">
                  <Spinner/><p className="text-zinc-500 text-sm">Setting up your registration…</p>
                </motion.div>
              )}

              {/* QR */}
              {flow === "awaiting_screenshot" && regId && regAmount > 0 && (
                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <QrScreen
                    amount={regAmount} registrationId={regId} eventName={regEventName} email={form.email}
                    onSuccess={() => { localStorage.removeItem(STORAGE_KEY); setFlow("success"); }}
                    onReset={reset}
                  />
                </motion.div>
              )}

              {/* Success */}
              {flow === "success" && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SuccessScreen email={form.email} eventName={regEventName} onReset={reset}/>
                </motion.div>
              )}

              {/* Error */}
              {flow === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 py-14 text-center">
                  <div className="text-6xl">❌</div>
                  <div>
                    <h2 className="text-xl font-black text-white font-display mb-2">Registration Failed</h2>
                    <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">{flowErr}</p>
                  </div>
                  <button onClick={() => setFlow("idle")} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-xl transition-colors">
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* ── Main Form ── */}
              {flow === "idle" && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">

                  {/* 1. Personal Details */}
                  <Block title="Personal Details" icon="👤">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Name" id="fullName" required error={touched.fullName ? errors.fullName : ""}>
                        <Input id="fullName" type="text" placeholder="Your full name" value={form.fullName}
                          onChange={e => patch({ fullName: e.target.value })} onBlur={() => touch("fullName")}/>
                      </Field>
                      <Field label="USN" id="usn" required error={touched.usn ? errors.usn : ""}>
                        <Input id="usn" type="text" placeholder="1DS23ET045" value={form.usn}
                          onChange={e => patch({ usn: e.target.value })} onBlur={() => touch("usn")} maxLength={10}/>
                      </Field>
                    </div>
                    <Field label="Phone" id="phone" required error={touched.phone ? errors.phone : ""}>
                      <Input id="phone" type="tel" placeholder="10-digit number" value={form.phone}
                        onChange={e => patch({ phone: e.target.value })} onBlur={() => touch("phone")}/>
                    </Field>
                  </Block>

                  {/* 2. Email Verification */}
                  <Block title="Email Verification" icon="📧">
                    <Field label="Email" id="email" required error={touched.email && ev.status === "idle" ? errors.email : undefined}>
                      <div className="flex gap-2">
                        <Input id="email" type="email" placeholder="you@example.com" value={form.email}
                          onChange={e => { patch({ email: e.target.value }); if (ev.status !== "idle") resetEmailFlow(); }}
                          onBlur={() => touch("email")}
                          disabled={["otp_sent","verifying","verified","sending"].includes(ev.status)}
                          className="flex-1"/>
                        {!["verified","otp_sent","verifying"].includes(ev.status) && (
                          <button onClick={sendOtp} disabled={ev.status === "sending" || !!errors.email}
                            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2">
                            {ev.status === "sending" ? <><Spinner size="sm"/> …</> : "Send OTP"}
                          </button>
                        )}
                      </div>
                    </Field>

                    <AnimatePresence>
                      {(ev.status === "otp_sent" || ev.status === "verifying") && (
                        <motion.div key="otp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">
                            <p className="text-xs text-zinc-400">OTP sent to <span className="text-amber-400 font-semibold">{form.email}</span></p>
                            <OtpInput value={otp} onChange={v => { setOtp(v); if (otpErr) setOtpErr(""); }} disabled={ev.status === "verifying"}/>
                            {otpErr && <p className="text-xs text-red-400">✗ {otpErr}</p>}
                            <div className="flex flex-wrap gap-3 items-center">
                              <button onClick={verifyOtp} disabled={ev.status === "verifying" || otp.length !== OTP_LENGTH}
                                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                                {ev.status === "verifying" ? <><Spinner size="sm"/> Verifying…</> : "Verify"}
                              </button>
                              <button onClick={resendOtp} disabled={ev.resendCooldown > 0 || ev.status === "verifying"}
                                className="text-xs text-zinc-500 hover:text-amber-400 disabled:opacity-40 transition-colors">
                                {ev.resendCooldown > 0 ? `Resend in ${ev.resendCooldown}s` : "Resend"}
                              </button>
                              <button onClick={resetEmailFlow} className="text-xs text-zinc-600 hover:text-zinc-400 ml-auto transition-colors">← Change email</button>
                            </div>
                            {ev.message && <p className={`text-xs ${ev.message.includes("resent") || ev.message.includes("sent") ? "text-emerald-400" : "text-red-400"}`}>{ev.message}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {ev.status === "verified" && (
                        <motion.div key="verified" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center justify-between bg-emerald-950/40 border border-emerald-700/40 rounded-xl px-4 py-3">
                          <span className="text-emerald-400 text-sm font-bold">✅ Email Verified</span>
                          <button onClick={resetEmailFlow} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Change</button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {ev.status === "error" && (
                      <p className="text-xs text-red-400">✗ {ev.message}</p>
                    )}
                  </Block>

                  {/* 3. Event Selection — single event, grouped */}
                  <Block title="Select Event" icon="🎯">
                    <p className="text-xs text-zinc-600 -mt-2">Choose one event to register for.</p>

                    <div className="flex flex-col gap-5">
                      {grouped.map(({ cat, events }) => (
                        <div key={cat}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600 mb-2">{cat}</p>
                          <div className="flex flex-col gap-1.5">
                            {events.map(ev => {
                              const sel = form.eventSlug === ev.slug;
                              return (
                                <motion.label
                                  key={ev.slug} whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
                                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${sel ? "bg-amber-500/10 border-amber-500/50 text-amber-300" : "bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"}`}
                                >
                                  <input type="radio" name="event" className="sr-only" checked={sel} onChange={() => handleEventChange(ev.slug)}/>
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? "border-amber-400 bg-amber-400" : "border-zinc-600"}`}>
                                    {sel && <div className="w-1.5 h-1.5 rounded-full bg-black"/>}
                                  </div>
                                  <span className="text-lg">{ev.icon}</span>
                                  <span className="text-sm font-medium flex-1">{ev.label}</span>
                                  <span className="text-xs font-mono-dm text-zinc-500">{ev.note}</span>
                                </motion.label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fee preview */}
                    <AnimatePresence>
                      {selectedEv && (
                        <motion.div
                          key="fee" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs text-zinc-500 mb-0.5">Selected</p>
                            <p className="text-sm font-semibold text-white">{selectedEv.icon} {selectedEv.label}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 mb-0.5">Total</p>
                            <p className="text-xl font-black text-amber-400 font-display">{formatINR(totalPaise)}</p>
                            {selectedEv.feeType === "per_person" && (
                              <p className="text-xs text-zinc-600">₹{selectedEv.fee} × {totalMembers} members</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Block>

                  {/* 4. Team Details (shown only if event needs members) */}
                  <AnimatePresence>
                    {needsTeamInput && (
                      <motion.div
                        key="team"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Block title="Team Details" icon="👥">
                          <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl px-4 py-3 text-xs text-zinc-400 flex items-center justify-between">
                            <span>{selectedEv?.note}</span>
                            <span className={`font-bold ${sizeErr ? "text-red-400" : "text-emerald-400"}`}>
                              {totalMembers}/{selectedEv?.exact ?? `${selectedEv?.min}–${selectedEv?.max}`}
                            </span>
                          </div>

                          {sizeErr && (
                            <p className="text-xs text-red-400">✗ {sizeErr}</p>
                          )}

                          <Field label="Team Name" id="teamName" required error={touched.teamName ? teamNameErr : undefined}>
                            <Input id="teamName" type="text" placeholder="Your team name" value={form.teamName}
                              onChange={e => patch({ teamName: e.target.value })} onBlur={() => touch("teamName")}/>
                          </Field>

                          {/* Members */}
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                                Teammates <span className="text-amber-400 normal-case tracking-normal">({form.teamMembers.length} of {maxTm})</span>
                              </p>
                              <div className="flex gap-2">
                                {form.teamMembers.length < maxTm && (
                                  <button onClick={addMember} className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">+ Add</button>
                                )}
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {form.teamMembers.map((m, i) => (
                                <motion.div
                                  key={i} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                                  className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-4 flex flex-col gap-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Member {i+1}</span>
                                    {form.teamMembers.length > minTm && (
                                      <button onClick={() => removeMember(i)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Remove</button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Field label="Name" id={`mn-${i}`} required error={touched[`m${i}`] ? memberErrors[i]?.name : undefined}>
                                      <Input id={`mn-${i}`} type="text" placeholder="Full name" value={m.name}
                                        onChange={e => updateMember(i, "name", e.target.value)}
                                        onBlur={() => setTouched(p => ({ ...p, [`m${i}`]: true }))}/>
                                    </Field>
                                    <Field label="USN" id={`mu-${i}`} required error={touched[`m${i}`] ? memberErrors[i]?.usn : undefined}>
                                      <Input id={`mu-${i}`} type="text" placeholder="1DS23ET045" value={m.usn}
                                        onChange={e => updateMember(i, "usn", e.target.value)}
                                        onBlur={() => setTouched(p => ({ ...p, [`m${i}`]: true }))} maxLength={10}/>
                                    </Field>
                                    <Field label="Phone" id={`mp-${i}`} required error={touched[`m${i}`] ? memberErrors[i]?.phone : undefined}>
                                      <Input id={`mp-${i}`} type="tel" placeholder="10-digit" value={m.phone}
                                        onChange={e => updateMember(i, "phone", e.target.value)}
                                        onBlur={() => setTouched(p => ({ ...p, [`m${i}`]: true }))}/>
                                    </Field>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </Block>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 5. Submit */}
                  <div className="flex flex-col gap-3 pt-1">
                    {/* Readiness indicators */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {[
                        [!errors.fullName && form.fullName, "Full name"],
                        [!errors.usn && form.usn, "USN"],
                        [ev.status === "verified", "Email verified"],
                        [!!form.eventSlug, "Event selected"],
                        ...(needsTeamInput ? [
                          [!teamNameErr && form.teamName, "Team name"],
                          [!sizeErr && form.teamMembers.length >= minTm, "Team size valid"],
                        ] : []),
                      ].map(([ok, label], i) => (
                        <div key={i} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? "text-emerald-400" : "text-zinc-700"}`}>
                          <span>{ok ? "✓" : "○"}</span><span>{label as string}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={isFormValid ? { scale: 1.015 } : {}}
                      whileTap={isFormValid ? { scale: 0.985 } : {}}
                      onClick={submit} disabled={!isFormValid}
                      className={`w-full py-4 rounded-xl text-base font-black font-display tracking-wider transition-all flex items-center justify-center gap-2 ${
                        isFormValid
                          ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                          : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      {isFormValid
                        ? <>{totalPaise === 0 ? "REGISTER FREE" : `PROCEED TO PAY ${formatINR(totalPaise)}`}</>
                        : "COMPLETE ALL FIELDS"}
                    </motion.button>

                    <p className="text-center text-xs text-zinc-700">
                      UPI payment · Manual verification within 24 hours
                    </p>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-zinc-700 text-xs mt-6">Lumos 2026 · Vertex · Dayananda Sagar College</p>
      </div>
    </div>
  );
}