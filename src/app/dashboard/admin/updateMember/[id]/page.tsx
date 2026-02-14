"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Pre-defined options (Make sure these match your Create form)
const AVAILABLE_TEAMS = ["Web Dev", "Design", "App Dev", "Marketing", "Core"];
const AVAILABLE_ROLES = ["Lead", "Developer", "Designer", "Manager", "Member"];

export default function UpdateMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({
    usn: "",
    emailId: "",
    phoneNo: "",
    team: [] as string[],
    role: [] as string[],
  });

  // 1. Fetch existing member data to pre-fill the form
  useEffect(() => {
    if (!memberId) return;

    const fetchMemberData = async () => {
      try {
        // Assuming you have a GET endpoint for a single member: /api/members/:id
        // If you only have the 'get all' endpoint, you would fetch all and filter here.
        const response = await fetch(`/api/members/${memberId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch member details.");
        }

        const json = await response.json();
        const member = json.data;

        // Pre-fill the form state
        setFormData({
          usn: member.usn || "",
          emailId: member.emailId || "",
          phoneNo: member.phoneNo || "",
          team: member.team || [],
          role: member.role || [],
        });
      } catch (error: any) {
        setMessage({ text: error.message || "Error loading member data.", type: "error" });
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  // Handle standard text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle array inputs (Checkboxes)
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'team' | 'role') => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prev) => {
      const currentArray = prev[fieldName];
      if (isChecked) {
        return { ...prev, [fieldName]: [...currentArray, value] };
      } else {
        return { ...prev, [fieldName]: currentArray.filter((item) => item !== value) };
      }
    });
  };

  // 2. Handle Form Submission (PUT Request)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Member updated successfully! Redirecting...", type: "success" });
        // Redirect back to the members list after a short delay
        setTimeout(() => {
          router.push('/members'); 
          router.refresh(); // Forces Next.js to re-fetch the members list so it shows the new data
        }, 1500);
      } else {
        // Handle specific errors returned from your API (e.g., Prisma P2002 unique constraint)
        setMessage({ text: data.error || "Failed to update member.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "A network error occurred while submitting.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Show a loading spinner while fetching initial data
  if (loadingFetch) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-10 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Update Member</h2>
        <Link 
          href="/members" 
          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          &larr; Back to List
        </Link>
      </div>

      {/* Success/Error Message Display */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* USN Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">USN</label>
          <input
            type="text"
            name="usn"
            value={formData.usn}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
            <input
              type="email"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>
        </div>

        {/* Teams Checkbox Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teams (Select multiple)</label>
          <div className="flex flex-wrap gap-4">
            {AVAILABLE_TEAMS.map((teamOption) => (
              <label key={teamOption} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={teamOption}
                  checked={formData.team.includes(teamOption)}
                  onChange={(e) => handleArrayChange(e, "team")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">{teamOption}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Roles Checkbox Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Roles (Select multiple)</label>
          <div className="flex flex-wrap gap-4">
            {AVAILABLE_ROLES.map((roleOption) => (
              <label key={roleOption} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={roleOption}
                  checked={formData.role.includes(roleOption)}
                  onChange={(e) => handleArrayChange(e, "role")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">{roleOption}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <Link 
            href="/dashboard/admin"
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors border border-gray-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}