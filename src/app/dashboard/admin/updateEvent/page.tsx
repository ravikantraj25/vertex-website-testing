"use client";

import { useEffect, useState } from "react";

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
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Scheduled Events</h1>
        <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-1.5 rounded-full">
          Total: {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No events scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              {/* Card Header: Venue */}
              <div className="mb-4 pb-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">Venue</span>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight">{event.venue}</h2>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg text-purple-500">
                  {/* Map Pin Icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              </div>

              {/* Card Body: Date and Time Details */}
              <div className="flex-grow space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  {/* Calendar Icon */}
                  <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Date</span>
                    <span className="font-semibold">{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  {/* Clock Icon */}
                  <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Time</span>
                    <span className="font-semibold">{event.time}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Delete Button */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="w-full flex justify-center items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-semibold py-2.5 px-4 rounded-lg transition-colors border border-red-200"
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
  );
}