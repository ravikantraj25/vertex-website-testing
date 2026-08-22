"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActionButtons({ registrationId }: { registrationId: string }) {
  const [loadingAction, setLoadingAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const router = useRouter();

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    try {
      setLoadingAction(action);
      const res = await fetch("/api/admin/lumos-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Something went wrong.");
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Failed to perform action.");
      console.error(error);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => handleAction("APPROVE")}
        disabled={loadingAction !== null}
        className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all
          ${loadingAction === "APPROVE" ? "bg-emerald-100 text-emerald-400 border-emerald-200 cursor-not-allowed" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"}`}
        title="Approve registration"
      >
        {loadingAction === "APPROVE" ? "⏳" : "✅"} Approve
      </button>

      <button
        onClick={() => handleAction("REJECT")}
        disabled={loadingAction !== null}
        className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all
          ${loadingAction === "REJECT" ? "bg-red-100 text-red-400 border-red-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 disabled:opacity-50"}`}
        title="Reject registration"
      >
        {loadingAction === "REJECT" ? "⏳" : "❌"} Reject
      </button>
    </div>
  );
}
