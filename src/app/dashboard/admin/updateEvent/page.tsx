"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


// Define the TypeScript interface for your Event data
interface Event {
  id: string; // Assuming Prisma/MongoDB uses 'id'
  venue: string;
  date: string;
  time: string;
}

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        
        const json = await response.json();
        // Assuming your API wraps the array in a 'data' object, just like the members API
        setEvents(json.data || []); 
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 2. Handle the Delete Operation
  const handleDelete = async (id: string) => {
    // Add a confirmation dialog so admins don't accidentally delete an event
    const isConfirmed = window.confirm("Are you sure you want to cancel and delete this event?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Instantly remove the deleted event from the UI state
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete event: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("A network error occurred while trying to delete the event.");
    }
  };

  // Helper function to format the ISO date string into a readable format
  const formatDate = (isoString: string) => {
    const dateObj = new Date(isoString);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-10">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#12042a] to-[#02010a] text-white">
  <div className="max-w-7xl mx-auto px-6 py-10 font-sans">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
  Scheduled Events
</h1>

        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md
 text-sm font-semibold px-4 py-1.5 rounded-full">
          Total: {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="relative mt-10">

  {/* Glass Card */}
  <div className="
    relative
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    rounded-2xl
    py-16 px-6
    text-center
    overflow-hidden
  ">

    {/* Glow Effect */}
    <div className="
      absolute inset-0
      bg-gradient-to-r
      from-purple-500/10
      to-cyan-500/10
      blur-xl
      opacity-50
      pointer-events-none
    "/>

    {/* Content */}
    <div className="relative z-10">

      {/* Icon */}
      <div className="
        w-16 h-16
        mx-auto mb-4
        rounded-full
        bg-purple-500/20
        border border-purple-500/30
        flex items-center justify-center
        text-purple-400
      ">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>

      {/* Title */}
      <h3 className="
        text-xl font-semibold
        bg-gradient-to-r
        from-purple-400
        to-cyan-400
        bg-clip-text
        text-transparent
        mb-2
      ">
        No Events Scheduled
      </h3>

      {/* Subtitle */}
      <p className="text-gray-400 mb-6">
        Create your first event to get started
      </p>

      {/* Create Button */}
      <Link
  href="/dashboard/admin/createEvent"
  className="
    inline-block
    bg-gradient-to-r
    from-purple-500
    to-cyan-500
    hover:from-purple-600
    hover:to-cyan-600
    px-6 py-2.5
    rounded-lg
    font-semibold
    transition-all
    hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]
    hover:scale-[1.05]
    active:scale-[0.98]
  "
>
  Create Event
</Link>


    </div>
  </div>

</div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="
relative
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
transition-all duration-300
hover:scale-[1.02]
hover:border-purple-500/40
hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]
flex flex-col h-full
group
"


            >
              {/* Card Header: Venue */}
              <div className="mb-4 pb-4 border-b border-white/10 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">Venue</span>
                  <h2 className="text-xl font-bold text-white leading-tight">{event.venue}</h2>
                </div>
                <div className="bg-purple-500/2 border border-purple-500/30 p-2 rounded-lg text-purple-500">
                  {/* Map Pin Icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              </div>

              {/* Card Body: Date and Time Details */}
              <div className="flex-grow space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  {/* Calendar Icon */}
                  <div className="bg-white/5 border border-white/10 p-2 rounded-md border border-white/10">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Date</span>
                    <span className="font-semibold">{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  {/* Clock Icon */}
                  <div className="bg-white/5 border border-white/10 p-2 rounded-md border border-white/10">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Time</span>
                    <span className="font-semibold">{event.time}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Delete Button */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="
w-full flex justify-center items-center gap-2
bg-red-500/10
border border-red-500/30
text-red-400
font-semibold py-2.5 px-4
rounded-lg
transition-all duration-300
hover:bg-red-500/20
hover:border-red-500/50
hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]
hover:scale-[1.02]
active:scale-[0.98]
"


                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Cancel Event
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}