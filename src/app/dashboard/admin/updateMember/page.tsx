"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Member {
  id: string; 
  usn: string;
  emailId: string;
  phoneNo: string;
  team: string[];
  role: string[];
  admin?: {
    usn: string;
    emailId: string;
  };
}

export default function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members");
        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }
        
        const json = await response.json();
        setMembers(json.data || []); 
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // --- NEW: Handle Delete Function ---
  const handleDelete = async (id: string) => {
    // Prevent accidental clicks
    const isConfirmed = window.confirm("Are you sure you want to delete this member? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted member from the UI instantly
        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("An error occurred while trying to delete the member.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full">
          Total: {members.length}
        </span>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id ?? (member as any)._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              {/* Card Header: USN & Contact */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{member.usn}</h2>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {member.emailId}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    {member.phoneNo}
                  </span>
                </div>
              </div>

              {/* Card Body: Teams & Roles Tags */}
              <div className="flex-grow space-y-4 mb-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Teams</span>
                  <div className="flex flex-wrap gap-2">
                    {member.team?.map((t, index) => (
                      <span key={index} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-medium border border-indigo-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Roles</span>
                  <div className="flex flex-wrap gap-2">
                    {member.role?.map((r, index) => (
                      <span key={index} className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-100">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Info Display */}
              {member.admin && (
                <div className="mb-4 text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 p-2 rounded-md">
                   <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <span>Managed by: <span className="font-medium">{member.admin.emailId}</span></span>
                </div>
              )}

              {/* --- UPDATED: Card Footer with Edit & Delete Buttons --- */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                  <Link 
                    href={`/dashboard/admin/updateMember/${member.id ?? (member as any)._id}`}
                  className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-semibold py-2 px-3 rounded-lg transition-colors border border-blue-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Edit
                </Link>
                
                <button 
                  onClick={() => handleDelete(member.id ?? (member as any)._id)}
                  className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-semibold py-2 px-3 rounded-lg transition-colors border border-red-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}