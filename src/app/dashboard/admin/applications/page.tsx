"use client";

import { useEffect, useState } from "react";

// Define the TypeScript interface based on your Prisma RecruitmentApplication model
interface Application {
  id: string;
  name: string;
  usn: string;
  emailId: string;
  phoneNo: string;
  team: string;
}

export default function ApplicationsListPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch all applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/applications");
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        
        const json = await response.json();
        // Assuming your API wraps the result in a 'data' property
        setApplications(json.data || []); 
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // 2. Handle the Delete Operation (Reject/Remove Application)
  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this application? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Instantly remove the deleted application from the UI state
        setApplications((prev) => prev.filter((app) => app.id !== id));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete application: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("A network error occurred while trying to delete the application.");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Recruitment Applications</h1>
        <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-1.5 rounded-full">
          Total: {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No pending applications found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden"
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

              {/* Card Header: Applicant Name & USN */}
              <div className="mb-5 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{app.name}</h2>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {app.usn}
                  </span>
                </div>
                
                {/* Applied Team Badge */}
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-100 mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Applying for: {app.team}
                </div>
              </div>

              {/* Card Body: Contact Information */}
              <div className="flex-grow space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-gray-50 p-1.5 rounded text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <a href={`mailto:${app.emailId}`} className="hover:text-emerald-600 transition-colors">
                    {app.emailId}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-gray-50 p-1.5 rounded text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <a href={`tel:${app.phoneNo}`} className="hover:text-emerald-600 transition-colors">
                    {app.phoneNo}
                  </a>
                </div>
              </div>

              {/* Card Footer: Delete Button */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleDelete(app.id)}
                  className="w-full flex justify-center items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-lg transition-colors border border-red-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete Application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}