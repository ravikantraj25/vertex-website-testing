"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // State for the native HTML inputs
  const [formData, setFormData] = useState({
    venue: "",
    date: "", // Will store as YYYY-MM-DD from the input
    time: "", // Will store as 24-hour HH:MM from the input
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // 1. Format the time to 12-hour AM/PM (e.g., "14:30" -> "2:30 PM")
      const [hourString, minute] = formData.time.split(':');
      let hour = parseInt(hourString, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11
      const formattedTime = `${hour}:${minute} ${ampm}`;

      // 2. Format the date to an ISO 8601 string combining date and time
      // This creates a valid Date object in the user's local timezone, then converts to UTC ISO
      const isoDateString = new Date(`${formData.date}T${formData.time}:00`).toISOString();

      // 3. Construct the payload matching your API requirements
      const payload = {
        venue: formData.venue,
        date: isoDateString,
        time: formattedTime,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage({ text: "Event created successfully! Redirecting...", type: "success" });
        
        // Clear form and redirect after a short delay
        setFormData({ venue: "", date: "", time: "" });
        setTimeout(() => {
          router.push('/dashboard'); // Change this to your events list route if you have one
          router.refresh();
        }, 1500);

      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.error || "Failed to create event.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred while submitting.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#12042a] to-[#02010a] flex items-center justify-center px-4 text-white">

  <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 relative">
  <div className="
absolute inset-0
rounded-2xl
bg-gradient-to-r
from-purple-500/10
to-cyan-500/10
blur-xl
opacity-40
group-hover:opacity-70
transition-all duration-500
pointer-events-none
"/>



      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
  Create New Event
</h2>

        <Link 
          href="/dashboard/admin" 
          className="text-sm font-medium text-purple-400 hover:text-purple-300 transition"

        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Success/Error Message Display */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-md border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        
        {/* Venue Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Venue</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="e.g. Main Auditorium"
            required
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition"

          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Event Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition appearance-none"

            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Event Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition appearance-none"

            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"

          >
            {loading ? "Scheduling Event..." : "Schedule Event"}
          </button>
        </div>

      </form>
    </div>
    </div>
  );
}