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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-10 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Event</h2>
        <Link 
          href="/dashboard/admin" 
          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Success/Error Message Display */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Venue Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="e.g. Main Auditorium"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? "Scheduling Event..." : "Schedule Event"}
          </button>
        </div>

      </form>
    </div>
  );
}