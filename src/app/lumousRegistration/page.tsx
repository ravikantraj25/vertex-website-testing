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
  selectedEvents: string[];
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

// Payment flow: no Razorpay — manual QR + screenshot
type PaymentFlowStatus =
  | "idle"                   // form visible
  | "creating_registration"  // POST /api/register running
  | "awaiting_screenshot"    // show QR + file upload
  | "uploading"              // POST /api/upload-screenshot running
  | "success"                // screenshot submitted, pending admin review
  | "error";                 // server/network error

interface EventItem {
  id: string;
  label: string;
  icon: string;
  type: "solo" | "team";
}

interface RegisterApiResponse {
  registrationId: string;
  amount: number; // in paise
}

interface SendOtpResponse {
  success: boolean;
  message?: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// each event now has its own price; keep this list in sync with prisma/seed.ts
interface EventItem {
  id: string;
  label: string;
  icon: string;
  type: "solo" | "team";
  price: number; // in paise
}

const SOLO_EVENTS: EventItem[] = [
  { id: "coding", label: "Coding Contest",     icon: "⌨️", type: "solo", price: 10000 },
  { id: "paper",  label: "Paper Presentation", icon: "📄", type: "solo", price: 10000 },
];

const TEAM_EVENTS: EventItem[] = [
  { id: "ideathon",  label: "Ideathon",       icon: "💡", type: "team", price: 10000 },
  { id: "cooking",   label: "Cooking without Fire", icon: "🍳", type: "team", price: 5000 },
];

const ALL_EVENTS = [...SOLO_EVENTS, ...TEAM_EVENTS];

const USN_REGEX = /^1ds\d{2}[a-z]{2}\d{3}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = "event_registration_form";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const MAX_SCREENSHOT_SIZE_MB = 5;

const defaultMember = (): TeamMember => ({ name: "", usn: "", phone: "" });

const defaultForm: FormState = {
  fullName: "",
  usn: "",
  email: "",
  phone: "",
  selectedEvents: [],
  teamName: "",
  teamMembers: [defaultMember(), defaultMember()],
};

// ─── Price Helpers ────────────────────────────────────────────────────────────

function calcTotal(selectedEvents: string[]): number {
  // sum the price of each selected event by looking it up in ALL_EVENTS
  return selectedEvents.reduce((acc, id) => {
    const ev = ALL_EVENTS.find((e) => e.id === id);
    return acc + (ev ? ev.price : 0);
  }, 0);
}

function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function apiSendOtp(email: string): Promise<SendOtpResponse> {
  const res = await fetch("/api/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? "Failed to send OTP");
  }
  return res.json();
}

async function apiVerifyOtp(
  email: string,
  otp: string
): Promise<VerifyOtpResponse> {
  const res = await fetch("/api/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? "Invalid OTP");
  }
  return res.json();
}

async function apiRegister(form: FormState): Promise<RegisterApiResponse> {
  const res = await fetch("/api/lumous-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: form.fullName,
      usn: form.usn,
      email: form.email,
        phone: form.phone,
      soloEvents: form.selectedEvents.filter((id) =>
        SOLO_EVENTS.some((e) => e.id === id)
      ),
      teamEvents: form.selectedEvents.filter((id) =>
        TEAM_EVENTS.some((e) => e.id === id)
      ),
      team: {
        name: form.teamName,
        members: form.teamMembers,
      },
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? "Registration failed");
  }
  return res.json();
}

async function apiUploadScreenshot(
  registrationId: string,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append("registrationId", registrationId);
  formData.append("screenshot", file);

  const res = await fetch("/api/upload-payment-ss", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? "Upload failed");
  }
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

const validateUSN = (v: string): string => {
  if (!v) return "USN is required";
  if (!/^1ds/i.test(v)) return "USN must start with '1DS'";
  if (!USN_REGEX.test(v)) return "Invalid format — e.g. 1DS23ET045";
  return "";
};

const validateName = (v: string): string =>
  !v.trim() ? "Full name is required" : "";

const validateEmail = (v: string): string => {
  if (!v) return "Email is required";
  if (!EMAIL_REGEX.test(v)) return "Enter a valid email address";
  return "";
};

const validatePhone = (v: string): string => {
  if (!v || !v.trim()) return "Phone is required";
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 10) return "Enter a valid 10-digit phone number";
  return "";
};

// For team members: phone now required on frontend
const validateMemberPhone = (v: string): string => {
  if (!v || !v.trim()) return "Phone is required";
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 10) return "Enter a valid 10-digit phone number";
  return "";
};

// ─── Shared UI Components ─────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function InputField({ label, id, error, required, children }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold tracking-widest text-slate-400 uppercase"
      >
        {label}
        {required && <span className="text-indigo-400 ml-1">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-rose-400 flex items-center gap-1 mt-0.5"
          >
            <span>⚠</span> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

type StyledInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

function StyledInput({ className = "", ...props }: StyledInputProps) {
  return (
    <input
      className={`w-full bg-slate-800/60 border border-slate-600/50 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <h2 className="text-base font-bold text-white font-display">{title}</h2>
        <div className="flex-1 h-px bg-slate-700/60" />
      </div>
      {children}
    </div>
  );
}

interface StatusHintProps {
  ok: boolean | string | number;
  label: string;
}

function StatusHint({ ok, label }: StatusHintProps) {
  return (
    <div
      className={`flex items-center gap-1.5 transition-colors duration-300 ${
        ok ? "text-emerald-400" : "text-slate-600"
      }`}
    >
      <span className="text-xs">{ok ? "✓" : "○"}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

interface SpinnerProps {
  size?: "sm" | "md";
}

function Spinner({ size = "md" }: SpinnerProps) {
  const cls = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <svg
      className={`${cls} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits: string[] = Array.from(
    { length: OTP_LENGTH },
    (_, i) => value[i] ?? ""
  );

  const commitChange = (nextDigits: string[]) => onChange(nextDigits.join(""));

  const handleChange = (index: number, raw: string) => {
    const sanitized = raw.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    commitChange(nextDigits);
    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = "";
        commitChange(nextDigits);
      } else if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        commitChange(nextDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const nextDigits = Array.from(
      { length: OTP_LENGTH },
      (_, i) => pasted[i] ?? ""
    );
    commitChange(nextDigits);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-start">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange(i, e.target.value)
          }
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-12 text-center text-lg font-bold rounded-xl border transition-all duration-200 focus:outline-none bg-slate-800 text-white caret-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
            digit
              ? "border-indigo-500 ring-1 ring-indigo-500/40"
              : "border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Event Checkbox ───────────────────────────────────────────────────────────

interface EventCheckboxProps {
  event: EventItem;
  checked: boolean;
  onChange: () => void;
}

function EventCheckbox({ event, checked, onChange }: EventCheckboxProps) {
  return (
    <motion.label
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
        checked
          ? "bg-indigo-600/20 border-indigo-500/70 text-indigo-300"
          : "bg-slate-800/40 border-slate-600/40 text-slate-400 hover:border-slate-500/60 hover:text-slate-300"
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          checked
            ? "bg-indigo-500 shadow-lg shadow-indigo-500/30"
            : "border border-slate-500"
        }`}
      >
        {checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </div>
      <span className="text-sm font-medium flex-1">
        {event.icon} {event.label}
      </span>
      <span className="text-xs font-semibold text-slate-500">
        {formatINR(event.price)}
      </span>
    </motion.label>
  );
}

// ─── Price Summary ────────────────────────────────────────────────────────────

function PriceSummary({ selectedEvents }: { selectedEvents: string[] }) {
  const soloSelected = selectedEvents.filter((id) =>
    SOLO_EVENTS.some((e) => e.id === id)
  );
  const teamSelected = selectedEvents.filter((id) =>
    TEAM_EVENTS.some((e) => e.id === id)
  );
  const total = calcTotal(selectedEvents);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4 flex flex-col gap-3"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Order Summary
      </p>
      <div className="flex flex-col gap-2">
        {soloSelected.map((id) => {
          const ev = SOLO_EVENTS.find((e) => e.id === id);
          return (
            <div key={id} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                {ev?.icon} {ev?.label}
              </span>
              <span className="text-sm text-slate-400">
                {ev ? formatINR(ev.price) : "-"}
              </span>
            </div>
          );
        })}
        {teamSelected.map((id) => {
          const ev = TEAM_EVENTS.find((e) => e.id === id);
          return (
            <div key={id} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                {ev?.icon} {ev?.label}
              </span>
              <span className="text-sm text-slate-400">
                {ev ? formatINR(ev.price) : "-"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-px bg-slate-700/60" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">Total</span>
        <span className="text-lg font-bold text-indigo-400">
          {formatINR(total)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── QR Payment Screen ────────────────────────────────────────────────────────

interface QrPaymentScreenProps {
  amount: number;
  registrationId: string;
  email: string;
  onSuccess: () => void;
  onReset: () => void;
}

function QrPaymentScreen({
  amount,
  registrationId,
  email,
  onSuccess,
  onReset,
}: QrPaymentScreenProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_SCREENSHOT_SIZE_MB * 1024 * 1024) {
      setUploadError(`File must be under ${MAX_SCREENSHOT_SIZE_MB}MB.`);
      return;
    }

    setUploadError("");
    setScreenshot(file);
    // Revoke previous preview URL to avoid memory leak
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!screenshot) return;
    setUploading(true);
    setUploadError("");
    try {
      await apiUploadScreenshot(registrationId, screenshot);
      onSuccess();
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Amount + Registration ID banner */}
      <div className="bg-indigo-950/40 border border-indigo-700/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-1">
            Amount to Pay
          </p>
          <p className="text-3xl font-bold text-white font-display">
            {formatINR(amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Registration ID</p>
          <p className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-1 rounded-lg">
            {registrationId.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Scan & Pay via UPI
        </p>
        <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/40">
          {/*
            Replace /qr-payment.png with your actual QR code image.
            Place the image in your /public folder.
          */}
          <img
            src="/qr.jpeg"
            alt="UPI Payment QR Code"
            className="w-52 h-52 object-contain"
          />
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Scan the QR code with any UPI app (GPay, PhonePe, Paytm).
            After payment, upload your screenshot below.
          </p>
          <p className="text-xs text-amber-400 mt-2 font-medium">
            ⚠ Do not close this page after paying
          </p>
        </div>
      </div>

      <div className="h-px bg-slate-700/50" />

      {/* Screenshot Upload */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Upload Payment Screenshot
        </p>

        {/* Drop zone */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
            screenshot
              ? "border-indigo-500/60 bg-indigo-950/20"
              : "border-slate-600/50 hover:border-slate-500/70 bg-slate-800/30 hover:bg-slate-800/50"
          }`}
        >
          {preview ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <img
                src={preview}
                alt="Payment screenshot preview"
                className="max-h-44 rounded-xl object-contain shadow-lg"
              />
              <p className="text-xs text-indigo-400 font-medium">
                {screenshot?.name}
              </p>
              <p className="text-xs text-slate-500">
                Click to choose a different image
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-slate-700/60 rounded-xl flex items-center justify-center text-2xl">
                📎
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-300 font-medium">
                  Click to select screenshot
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG, PNG, WebP · Max {MAX_SCREENSHOT_SIZE_MB}MB
                </p>
              </div>
            </>
          )}
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileSelect}
        />

        <AnimatePresence>
          {uploadError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-rose-400 flex items-center gap-1"
            >
              <span>⚠</span> {uploadError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit + Cancel */}
        <div className="flex gap-3">
          <motion.button
            whileHover={screenshot && !uploading ? { scale: 1.02 } : {}}
            whileTap={screenshot && !uploading ? { scale: 0.98 } : {}}
            onClick={handleUpload}
            disabled={!screenshot || uploading}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold font-display tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
              screenshot && !uploading
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {uploading ? (
              <><Spinner size="sm" /> Uploading…</>
            ) : (
              "Submit for Verification"
            )}
          </motion.button>

          <button
            onClick={onReset}
            disabled={uploading}
            className="px-4 text-xs text-slate-600 hover:text-slate-400 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-center text-xs text-slate-600">
          Your registration is reserved while payment is verified
        </p>
      </div>
    </motion.div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

interface SuccessScreenProps {
  email: string;
  onReset: () => void;
}

function SuccessScreen({ email, onReset }: SuccessScreenProps) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="flex flex-col items-center text-center gap-5 py-10"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-7xl"
      >
        📋
      </motion.div>
      <div>
        <h2 className="text-2xl font-bold text-white font-display mb-2">
          Submitted for Review!
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
          Your payment screenshot is under review. We'll confirm your
          registration and send a confirmation to{" "}
          <span className="text-indigo-400 font-semibold">{email}</span> within
          24 hours.
        </p>
      </div>

      {/* What happens next */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 text-left w-full max-w-xs flex flex-col gap-2.5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          What happens next
        </p>
        {[
          "Our team reviews your payment screenshot",
          "You'll receive a confirmation email within 24hrs",
          "Your spot is reserved during review",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
              {i + 1}
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-950/30 border border-amber-700/30 rounded-xl px-4 py-3 w-full max-w-xs">
        <p className="text-amber-400 text-xs text-center">
          ⏳ Pending review — check your email for confirmation
        </p>
      </div>

      {/* Ideathon upload link notice */}
      <div className="bg-yellow-900/40 border border-yellow-700/40 rounded-xl px-4 py-3 w-full max-w-xs mt-4">
        <p className="text-yellow-200 text-xs text-center">
          If you applied for <strong>Ideathon</strong>, upload your PPT and details{' '}
          <a
            href="https://forms.gle/dummy"
            target="_blank"
            rel="noreferrer"
            className="underline font-semibold"
          >
            here
          </a>
          .
        </p>
      </div>

      <button
        onClick={onReset}
        className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Register Another Person
      </button>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventRegistrationPage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [emailVerification, setEmailVerification] =
    useState<EmailVerificationState>({
      status: "idle",
      message: "",
      resendCooldown: 0,
    });
  const [otp, setOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");

  // Payment / registration flow
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlowStatus>("idle");
  const [paymentError, setPaymentError] = useState<string>("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registrationAmount, setRegistrationAmount] = useState<number>(0);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Restore from localStorage ────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Partial<FormState> = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch (_) {}
  }, []);

  // ── Persist form to localStorage ─────────────────────────────────────────
  useEffect(() => {
    if (paymentFlow !== "success") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch (_) {}
    }
  }, [form, paymentFlow]);

  // ── Resend cooldown ticker ────────────────────────────────────────────────
  const startCooldown = useCallback(() => {
    setEmailVerification((prev) => ({
      ...prev,
      resendCooldown: RESEND_COOLDOWN_SECONDS,
    }));
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setEmailVerification((prev) => {
        if (prev.resendCooldown <= 1) {
          clearInterval(cooldownRef.current!);
          return { ...prev, resendCooldown: 0 };
        }
        return { ...prev, resendCooldown: prev.resendCooldown - 1 };
      });
    }, 1000);
  }, []);

  useEffect(
    () => () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    },
    []
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateForm = useCallback(
    (patch: Partial<FormState>) =>
      setForm((prev) => ({ ...prev, ...patch })),
    []
  );

  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // ── Derived state ─────────────────────────────────────────────────────────
  const hasTeamEvent = form.selectedEvents.some((id) =>
    TEAM_EVENTS.some((e) => e.id === id)
  );

  const totalPaise = calcTotal(form.selectedEvents);

  const errors: FormErrors = {
    fullName: validateName(form.fullName),
    usn: validateUSN(form.usn),
    email: validateEmail(form.email),
    phone: validatePhone(form.phone),
  };

  const memberErrors: MemberError[] = form.teamMembers.map((m) => ({
    name: !m.name.trim() ? "Name is required" : "",
    usn: validateUSN(m.usn),
    phone: validateMemberPhone(m.phone),
  }));

  const isFormValid: boolean =
    !errors.fullName &&
    !errors.usn &&
    !errors.email &&
    !errors.phone &&
    emailVerification.status === "verified" &&
    form.selectedEvents.length > 0 &&
    (!hasTeamEvent ||
      (form.teamName.trim().length > 0 &&
        form.teamMembers.length >= 2 &&
        memberErrors.every((e) => !e.name && !e.usn && !e.phone)));

  // ── Email OTP handlers ────────────────────────────────────────────────────
  const handleEmailChange = (v: string) => {
    updateForm({ email: v });
    if (emailVerification.status !== "idle") {
      setEmailVerification({ status: "idle", message: "", resendCooldown: 0 });
      setOtp("");
      setOtpError("");
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    }
  };

  const handleSendOtp = async () => {
    touch("email");
    if (errors.email) return;
    setEmailVerification({ status: "sending", message: "", resendCooldown: 0 });
    setOtp("");
    setOtpError("");
    try {
      await apiSendOtp(form.email);
      setEmailVerification({
        status: "otp_sent",
        message: "",
        resendCooldown: 0,
      });
      startCooldown();
    } catch (err: unknown) {
      setEmailVerification({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to send OTP.",
        resendCooldown: 0,
      });
    }
  };

  const handleResendOtp = async () => {
    if (emailVerification.resendCooldown > 0) return;
    setEmailVerification((prev) => ({
      ...prev,
      status: "sending",
      message: "",
    }));
    setOtp("");
    setOtpError("");
    try {
      await apiSendOtp(form.email);
      setEmailVerification({
        status: "otp_sent",
        message: "OTP resent! Check your inbox.",
        resendCooldown: 0,
      });
      startCooldown();
    } catch (err: unknown) {
      setEmailVerification((prev) => ({
        ...prev,
        status: "otp_sent",
        message: err instanceof Error ? err.message : "Failed to resend.",
      }));
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setOtpError("");
    setEmailVerification((prev) => ({
      ...prev,
      status: "verifying",
      message: "",
    }));
    try {
      await apiVerifyOtp(form.email, otp);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      setEmailVerification({
        status: "verified",
        message: "",
        resendCooldown: 0,
      });
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Incorrect OTP.");
      setEmailVerification((prev) => ({ ...prev, status: "otp_sent" }));
    }
  };

  // ── Event selection ───────────────────────────────────────────────────────
  const toggleEvent = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(id)
        ? prev.selectedEvents.filter((e) => e !== id)
        : [...prev.selectedEvents, id],
    }));
  };

  // ── Team members ──────────────────────────────────────────────────────────
  const addMember = () => {
    if (form.teamMembers.length >= 4) return;
    updateForm({ teamMembers: [...form.teamMembers, defaultMember()] });
  };

  const removeMember = (i: number) => {
    if (form.teamMembers.length <= 2) return;
    updateForm({
      teamMembers: form.teamMembers.filter((_, idx) => idx !== i),
    });
  };

  const updateMember = (
    i: number,
    field: keyof TeamMember,
    value: string
  ) => {
    updateForm({
      teamMembers: form.teamMembers.map((m, idx) =>
        idx === i ? { ...m, [field]: value } : m
      ),
    });
  };

  // ── Submit: create registration, then show QR screen ─────────────────────
  const handleSubmit = async () => {
    if (!isFormValid) return;
    setPaymentFlow("creating_registration");
    setPaymentError("");

    try {
      const data = await apiRegister(form);
      setRegistrationId(data.registrationId);
      setRegistrationAmount(data.amount);
      if (data.amount === 0) {
        // free event(s) only – go straight to success
        localStorage.removeItem(STORAGE_KEY);
        setPaymentFlow("success");
      } else {
        setPaymentFlow("awaiting_screenshot");
      }
    } catch (err: unknown) {
      setPaymentError(
        err instanceof Error ? err.message : "Registration failed. Try again."
      );
      setPaymentFlow("error");
    }
  };

  // ── Full reset ────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(defaultForm);
    setEmailVerification({ status: "idle", message: "", resendCooldown: 0 });
    setOtp("");
    setOtpError("");
    setTouched({});
    setPaymentFlow("idle");
    setPaymentError("");
    setRegistrationId(null);
    setRegistrationAmount(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  const showForm = paymentFlow === "idle";
  const showCreating = paymentFlow === "creating_registration";
  const showQr =
    paymentFlow === "awaiting_screenshot" &&
    registrationId !== null &&
    registrationAmount > 0;
  const showSuccess = paymentFlow === "success";
  const showError = paymentFlow === "error";

  return (
    <div
      className="min-h-screen bg-slate-950 flex items-start justify-center p-4 py-12"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15), transparent)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        body { font-family: 'DM Sans', sans-serif; }
        * { box-sizing: border-box; }
      `}</style>

      <div className="w-full max-w-2xl">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-600/15 border border-indigo-500/25 text-indigo-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Registrations Open
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-display mb-3 leading-tight">
            Lumous 2026
            <br />
            <span className="text-indigo-400">Event Registration</span>
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Compete, collaborate, and create. Register for the events that
            ignite your passion.
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400" />

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ── Creating registration loader ── */}
              {showCreating && (
                <motion.div
                  key="creating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-20"
                >
                  <Spinner />
                  <p className="text-slate-400 text-sm">
                    Setting up your registration…
                  </p>
                </motion.div>
              )}

              {/* ── QR + Screenshot upload ── */}
              {showQr && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <QrPaymentScreen
                    amount={registrationAmount}
                    registrationId={registrationId!}
                    email={form.email}
                    onSuccess={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      setPaymentFlow("success");
                    }}
                    onReset={handleReset}
                  />
                </motion.div>
              )}

              {/* ── Success ── */}
              {showSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SuccessScreen email={form.email} onReset={handleReset} />
                </motion.div>
              )}

              {/* ── Error ── */}
              {showError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 py-12 text-center"
                >
                  <div className="text-6xl">❌</div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-display mb-2">
                      Something Went Wrong
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                      {paymentError || "An unexpected error occurred."}
                    </p>
                  </div>
                  <button
                    onClick={() => setPaymentFlow("idle")}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Go Back & Try Again
                  </button>
                </motion.div>
              )}

              {/* ── Main Form ── */}
              {showForm && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-8"
                >
                  {/* ── 1. Personal Details ── */}
                  <Section title="Personal Details" icon="👤">
                    <InputField
                      label="Full Name"
                      id="fullName"
                      required
                      error={touched.fullName ? errors.fullName : ""}
                    >
                      <StyledInput
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={(e) =>
                          updateForm({ fullName: e.target.value })
                        }
                        onBlur={() => touch("fullName")}
                      />
                    </InputField>

                    <InputField
                      label="USN"
                      id="usn"
                      required
                      error={touched.usn ? errors.usn : ""}
                    >
                      <StyledInput
                        id="usn"
                        type="text"
                        placeholder="e.g. 1DS23ET045"
                        value={form.usn}
                        onChange={(e) => updateForm({ usn: e.target.value })}
                        onBlur={() => touch("usn")}
                        maxLength={10}
                      />
                    </InputField>

                      <InputField label="Phone" id="phone" required error={touched.phone ? errors.phone : undefined}>
                        <StyledInput
                          id="phone"
                          type="tel"
                          placeholder="10-digit phone"
                          value={form.phone}
                          onChange={(e) => updateForm({ phone: e.target.value })}
                          onBlur={() => touch("phone")}
                        />
                      </InputField>
                  </Section>

                  {/* ── 2. Email OTP Verification ── */}
                  <Section title="Email Verification" icon="📧">
                    <InputField
                      label="Email Address"
                      id="email"
                      required
                      error={
                        touched.email &&
                        emailVerification.status === "idle"
                          ? errors.email
                          : undefined
                      }
                    >
                      <div className="flex gap-2">
                        <StyledInput
                          id="email"
                          type="email"
                          placeholder="you@college.edu"
                          value={form.email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          onBlur={() => touch("email")}
                          disabled={
                            emailVerification.status === "otp_sent" ||
                            emailVerification.status === "verifying" ||
                            emailVerification.status === "verified" ||
                            emailVerification.status === "sending"
                          }
                          className="flex-1"
                        />
                        {emailVerification.status !== "verified" &&
                          emailVerification.status !== "otp_sent" &&
                          emailVerification.status !== "verifying" && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleSendOtp}
                              disabled={
                                emailVerification.status === "sending" ||
                                !!errors.email
                              }
                              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2"
                            >
                              {emailVerification.status === "sending" ? (
                                <><Spinner size="sm" /> Sending…</>
                              ) : (
                                "Send OTP"
                              )}
                            </motion.button>
                          )}
                      </div>
                    </InputField>

                    {/* OTP entry panel */}
                    <AnimatePresence>
                      {(emailVerification.status === "otp_sent" ||
                        emailVerification.status === "verifying") && (
                        <motion.div
                          key="otp-panel"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="bg-slate-800/50 border border-slate-600/40 rounded-xl p-5 flex flex-col gap-4">
                            <div className="flex items-start gap-2.5 bg-indigo-950/40 border border-indigo-700/30 rounded-lg p-3">
                              <span className="text-lg leading-none flex-shrink-0">
                                📩
                              </span>
                              <p className="text-indigo-300 text-xs leading-relaxed">
                                A 6-digit OTP was sent to{" "}
                                <span className="font-semibold text-indigo-200">
                                  {form.email}
                                </span>
                                . Enter it below.
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                                Enter OTP
                              </label>
                              <OtpInput
                                value={otp}
                                onChange={(v) => {
                                  setOtp(v);
                                  if (otpError) setOtpError("");
                                }}
                                disabled={
                                  emailVerification.status === "verifying"
                                }
                              />
                              <AnimatePresence>
                                {otpError && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs text-rose-400 flex items-center gap-1"
                                  >
                                    <span>⚠</span> {otpError}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleVerifyOtp}
                                disabled={
                                  emailVerification.status === "verifying" ||
                                  otp.length !== OTP_LENGTH
                                }
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                              >
                                {emailVerification.status === "verifying" ? (
                                  <><Spinner size="sm" /> Verifying…</>
                                ) : (
                                  "Verify OTP"
                                )}
                              </motion.button>

                              <button
                                onClick={handleResendOtp}
                                disabled={
                                  emailVerification.resendCooldown > 0 ||
                                  emailVerification.status === "verifying"
                                }
                                className="text-xs text-slate-400 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                {emailVerification.resendCooldown > 0
                                  ? `Resend in ${emailVerification.resendCooldown}s`
                                  : "Resend OTP"}
                              </button>

                              <button
                                onClick={() => {
                                  setEmailVerification({
                                    status: "idle",
                                    message: "",
                                    resendCooldown: 0,
                                  });
                                  setOtp("");
                                  setOtpError("");
                                  if (cooldownRef.current)
                                    clearInterval(cooldownRef.current);
                                }}
                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto"
                              >
                                ← Change email
                              </button>
                            </div>

                            <AnimatePresence>
                              {emailVerification.message && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className={`text-xs ${
                                    emailVerification.message
                                      .toLowerCase()
                                      .includes("resent") ||
                                    emailVerification.message
                                      .toLowerCase()
                                      .includes("sent")
                                      ? "text-emerald-400"
                                      : "text-rose-400"
                                  }`}
                                >
                                  {emailVerification.message}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Verified badge */}
                    <AnimatePresence>
                      {emailVerification.status === "verified" && (
                        <motion.div
                          key="verified"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between bg-emerald-950/40 border border-emerald-600/40 rounded-xl px-4 py-3"
                        >
                          <span className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                            <span className="text-lg">✅</span> Email Verified
                          </span>
                          <button
                            onClick={() => {
                              setEmailVerification({
                                status: "idle",
                                message: "",
                                resendCooldown: 0,
                              });
                              setOtp("");
                              setOtpError("");
                            }}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            Change
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {emailVerification.status === "error" && (
                        <motion.p
                          key="send-error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-rose-400 flex items-center gap-1"
                        >
                          <span>⚠</span> {emailVerification.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </Section>

                  {/* ── 3. Events + Pricing ── */}
                  <Section title="Select Events" icon="🎯">
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                          <span className="w-4 h-px bg-slate-600" />
                          Solo Events (prices shown)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SOLO_EVENTS.map((ev) => (
                            <EventCheckbox
                              key={ev.id}
                              event={ev}
                              checked={form.selectedEvents.includes(ev.id)}
                              onChange={() => toggleEvent(ev.id)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-slate-700/50" />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                          <span className="w-4 h-px bg-slate-600" />
                          Team Events (prices shown)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {TEAM_EVENTS.map((ev) => (
                            <EventCheckbox
                              key={ev.id}
                              event={ev}
                              checked={form.selectedEvents.includes(ev.id)}
                              onChange={() => toggleEvent(ev.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live price summary */}
                    <AnimatePresence>
                      {form.selectedEvents.length > 0 && (
                        <PriceSummary selectedEvents={form.selectedEvents} />
                      )}
                    </AnimatePresence>
                  </Section>

                  {/* ── 4. Team Details (conditional) ── */}
                  <AnimatePresence>
                    {hasTeamEvent && (
                      <motion.div
                        key="team-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Section title="Team Details" icon="👥">
                          <p className="text-xs text-slate-500 -mt-2">
                            One team applies to all selected team events.
                          </p>

                          <InputField
                            label="Team Name"
                            id="teamName"
                            required
                            error={
                              touched.teamName && !form.teamName.trim()
                                ? "Team name is required"
                                : undefined
                            }
                          >
                            <StyledInput
                              id="teamName"
                              type="text"
                              placeholder="Enter your team name"
                              value={form.teamName}
                              onChange={(e) =>
                                updateForm({ teamName: e.target.value })
                              }
                              onBlur={() => touch("teamName")}
                            />
                          </InputField>

                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                Team Members{" "}
                                <span className="text-indigo-400 normal-case">
                                  ({form.teamMembers.length}/4)
                                </span>
                              </p>
                              <button
                                onClick={addMember}
                                disabled={form.teamMembers.length >= 4}
                                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <span className="text-base leading-none">＋</span>
                                Add Member
                              </button>
                            </div>

                            <AnimatePresence initial={false}>
                              {form.teamMembers.map((member, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="bg-slate-800/40 border border-slate-600/40 rounded-xl p-4 flex flex-col gap-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                      Member {i + 1}
                                    </span>
                                    <button
                                      onClick={() => removeMember(i)}
                                      disabled={form.teamMembers.length <= 2}
                                      className="text-xs text-rose-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <InputField
                                      label="Name"
                                      id={`member-name-${i}`}
                                      required
                                      error={
                                        touched[`member-${i}`]
                                          ? memberErrors[i]?.name
                                          : undefined
                                      }
                                    >
                                      <StyledInput
                                        id={`member-name-${i}`}
                                        type="text"
                                        placeholder="Full name"
                                        value={member.name}
                                        onChange={(e) =>
                                          updateMember(i, "name", e.target.value)
                                        }
                                        onBlur={() =>
                                          setTouched((p) => ({
                                            ...p,
                                            [`member-${i}`]: true,
                                          }))
                                        }
                                      />
                                    </InputField>
                                    <InputField
                                      label="USN"
                                      id={`member-usn-${i}`}
                                      required
                                      error={
                                        touched[`member-${i}`]
                                          ? memberErrors[i]?.usn
                                          : undefined
                                      }
                                    >
                                      <StyledInput
                                        id={`member-usn-${i}`}
                                        type="text"
                                        placeholder="1DS23ET045"
                                        value={member.usn}
                                        onChange={(e) =>
                                          updateMember(i, "usn", e.target.value)
                                        }
                                        onBlur={() =>
                                          setTouched((p) => ({
                                            ...p,
                                            [`member-${i}`]: true,
                                          }))
                                        }
                                        maxLength={10}
                                      />
                                    </InputField>
                                    <InputField label={`Phone`} id={`member-phone-${i}`} required error={touched[`member-${i}`] ? memberErrors[i]?.phone : undefined}>
                                      <StyledInput
                                        id={`member-phone-${i}`}
                                        type="tel"
                                        placeholder="10-digit phone"
                                        value={member.phone}
                                        onChange={(e) => updateMember(i, "phone", e.target.value)}
                                        onBlur={() => setTouched((p) => ({ ...p, [`member-${i}`]: true }))}
                                      />
                                    </InputField>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </Section>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── 5. Readiness checklist + Submit ── */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <StatusHint
                        ok={!errors.fullName && form.fullName}
                        label="Full name"
                      />
                      <StatusHint ok={!errors.usn && form.usn} label="USN" />
                      <StatusHint
                        ok={emailVerification.status === "verified"}
                        label="Email verified"
                      />
                      <StatusHint
                        ok={form.selectedEvents.length > 0}
                        label="Events selected"
                      />
                      {hasTeamEvent && (
                        <>
                          <StatusHint
                            ok={form.teamName.trim()}
                            label="Team name"
                          />
                          <StatusHint
                            ok={
                              form.teamMembers.length >= 2 &&
                              memberErrors.every((e) => !e.name && !e.usn)
                            }
                            label="Team members valid"
                          />
                        </>
                      )}
                    </div>

                    <motion.button
                      whileHover={isFormValid ? { scale: 1.02 } : {}}
                      whileTap={isFormValid ? { scale: 0.98 } : {}}
                      onClick={handleSubmit}
                      disabled={!isFormValid}
                      className={`w-full py-4 rounded-xl text-base font-bold font-display tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                        isFormValid
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {isFormValid ? (
                        <>
                          <span>📱</span>
                          Proceed to Pay {formatINR(totalPaise)}
                        </>
                      ) : (
                        "Complete all fields to continue"
                      )}
                    </motion.button>

                    <p className="text-center text-xs text-slate-600">
                      Pay via UPI · Manual verification within 24 hours
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-slate-600 text-xs mt-6">
          TechFest 2025 · Dayananda Sagar College
        </p>
      </div>
    </div>
  );
}