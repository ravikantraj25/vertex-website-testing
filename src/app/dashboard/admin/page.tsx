"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "./header";
// --- REUSABLE COMPONENTS ---

// 1. Action Card Component
const ActionCard = ({ title, description, actionType, onClick }: { title: string, description: string, actionType: 'create' | 'update' | 'delete' | 'view', onClick?: () => void }) => {
  // Map colors based on the type of operation
  const colorMap = {
    create: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    update: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-50",
    delete: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-50",
    view: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-50",
  };

  return (
    <div onClick={onClick} className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col gap-2 ${colorMap[actionType]}`}>
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
  const { data: session } = useSession();
  useEffect(() => {
     //   TODO Replace this with your actual JWT decoding logic
     //   Example: 
      
        console.log("Session data in AdminDashboard:", session);
       if (session) {
        setAdminName(session.user?.name || session.user?.email || "Admin");
       }else{
        setAdminName("Admin");
       }
    
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header  />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Applications Section */}
        <DashboardSection title="Applications Management">
          <Link href="/dashboard/admin/applications">
            <ActionCard actionType="view" title="View All Applications" description="View all registered applications in the system." />
          </Link>

        </DashboardSection>

        {/* Members Section */}
        <DashboardSection title="Members Management">
          <Link href="/dashboard/admin/addMember">
            <ActionCard actionType="create" title="Add Member" description="Onboard a new member to the platform." />
          </Link>
          <Link href="/dashboard/admin/updateMember">
            <ActionCard actionType="update" title="Update Member" description="Edit member roles, profiles, and access." />
          </Link>
        </DashboardSection>

        {/* Events Section */}
        <DashboardSection title="Events Management">
          <Link href="/dashboard/admin/createEvent">
            <ActionCard actionType="create" title="Create Event" description="Schedule and publish a new event." />
          </Link>
          <Link href="/dashboard/admin/updateEvent">
            <ActionCard actionType="update" title="View & Delete Event" description="Change dates, venues, or event details." />
          </Link>
        </DashboardSection>

        {/* Messages Section (View/Delete Only) */}
        <DashboardSection title="Messages & Inbox">
          <ActionCard actionType="view" title="View Messages" description="Read incoming user messages and inquiries." />
         
        </DashboardSection>

      </main>
    </div>
  );
}