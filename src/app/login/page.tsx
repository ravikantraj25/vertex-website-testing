"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "ADMIN") {
      router.replace("/dashboard/admin");
    }
  }, [session, status, router]);

  const handleLogin = async (role: "USER" | "ADMIN") => {
    try {
      setLoading(true);
      setError(null);

      if (!window.grecaptcha) {
        throw new Error("reCAPTCHA not loaded. Please refresh the page.");
      }

      const token = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
        { action: "login" }
      );

      const verifyResponse = await fetch("/api/auth/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!verifyResponse.ok) {
        throw new Error("reCAPTCHA verification failed. Please try again.");
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.success) {
        throw new Error(verifyData.message || "reCAPTCHA verification failed");
      }

      document.cookie = `requestedRole=${role}; path=/; SameSite=Lax`;
      await signIn("google");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0120] via-[#14032e] to-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans flex items-center justify-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0b0120] via-[#14032e] to-[#020617]" />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/20 blur-[200px] rounded-full -z-10" />

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-xl w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue to Vertex</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleLogin("USER")}
            disabled={loading}
            className="w-full py-2.5 px-4 border border-white/10 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {loading ? "Verifying..." : "Login as User"}
          </button>

          <button
            onClick={() => handleLogin("ADMIN")}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <GoogleIcon />
            {loading ? "Verifying..." : "Login as Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4" />
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853" />
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
    </svg>
  );
}