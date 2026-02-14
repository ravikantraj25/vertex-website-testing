"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Header from "../header";
// Pre-defined options for checkboxes
const AVAILABLE_TEAMS = ["Web Dev", "Design", "App Dev", "Marketing", "Core"];
const AVAILABLE_ROLES = ["Lead", "Developer", "Designer", "Manager", "Member"];

interface FormDataType {
  usn: string;
  emailId: string;
  phoneNo: string;
  team: string[];
  role: string[];
}

export default function AddMemberForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Initialize state with empty arrays for team and role
  const [formData, setFormData] = useState<FormDataType>({
    usn: "",
    emailId: "",
    phoneNo: "",
    team: [],
    role: [],
  });

  // Handle standard text inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle array inputs (Checkboxes)
  const handleArrayChange = (e: ChangeEvent<HTMLInputElement>, fieldName: keyof FormDataType) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prev) => {
      const currentArray = prev[fieldName] as string[];
      // If checked, add to array. If unchecked, filter it out.
      if (isChecked) {
        return { ...prev, [fieldName]: [...currentArray, value] };
      } else {
        return { ...prev, [fieldName]: currentArray.filter((item) => item !== value) };
      }
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) // formData exactly matches your required payload
      });

      if (response.ok) {
        setMessage({ text: "Member added successfully!", type: "success" });
        // Reset form after success
        setFormData({ usn: "", emailId: "", phoneNo: "", team: [], role: [] });
      } else {
        setMessage({ text: "Failed to add member.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred while submitting.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-10">
        <Header/>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Member</h2>

      {/* Success/Error Message Display */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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
            placeholder="e.g. 1RV22CS001"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              placeholder="9876543210"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300"
        >
          {loading ? "Adding Member..." : "Add Member"}
        </button>

      </form>
    </div>
  );
}