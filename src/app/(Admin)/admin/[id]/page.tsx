"use client";

import { useEffect, useState } from "react";

// --- REUSABLE COMPONENTS ---

// 1. Action Card Component
const ActionCard = ({ title, description, actionType }: { title: string, description: string, actionType: 'create' | 'update' | 'delete' | 'view' }) => {
  // Map colors based on the type of operation
  const colorMap = {
    create: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    update: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-50",
    delete: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-50",
    view: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-50",
  };

  return (
    <div className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col gap-2 ${colorMap[actionType]}`}>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm opacity-80 font-medium">{description}</p>
    </div>
  );
};

// 2. Section Wrapper Component
const DashboardSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b-2 border-gray-100 pb-2">
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </section>
);

// --- MAIN PAGE ---

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState<string>("Loading...");

  useEffect(() => {
    // TODO: Replace this with your actual JWT decoding logic
    // Example: 
    // const token = localStorage.getItem('token');
    // if (token) {
    //   const payload = JSON.parse(atob(token.split('.')[1]));
    //   setAdminName(payload.name || payload.id);
    // }
    
    // Simulating token extraction
    setTimeout(() => setAdminName("System Admin"), 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Logged in as</span>
              <span className="text-sm font-bold text-gray-800">{adminName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Applications Section */}
        <DashboardSection title="Applications Management">
          <ActionCard actionType="create" title="Create Application" description="Register a new application in the system." />
          <ActionCard actionType="update" title="Update Application" description="Modify configurations of existing applications." />
          <ActionCard actionType="delete" title="Delete Application" description="Permanently remove an application." />
        </DashboardSection>

        {/* Members Section */}
        <DashboardSection title="Members Management">
          <ActionCard actionType="create" title="Add Member" description="Onboard a new member to the platform." />
          <ActionCard actionType="update" title="Update Member" description="Edit member roles, profiles, and access." />
          <ActionCard actionType="delete" title="Remove Member" description="Revoke access and delete member records." />
        </DashboardSection>

        {/* Events Section */}
        <DashboardSection title="Events Management">
          <ActionCard actionType="create" title="Create Event" description="Schedule and publish a new event." />
          <ActionCard actionType="update" title="Update Event" description="Change dates, venues, or event details." />
          <ActionCard actionType="delete" title="Cancel Event" description="Delete an upcoming or past event." />
        </DashboardSection>

        {/* Messages Section (View/Delete Only) */}
        <DashboardSection title="Messages & Inbox">
          <ActionCard actionType="view" title="View Messages" description="Read incoming user messages and inquiries." />
          <ActionCard actionType="delete" title="Delete Messages" description="Clear out old or resolved messages." />
        </DashboardSection>

      </main>
    </div>
  );
}