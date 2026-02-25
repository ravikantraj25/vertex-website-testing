"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "./header";
// --- REUSABLE COMPONENTS ---

// 1. Action Card Component
const ActionCard = ({ title, description, onClick }: { title: string, description: string, actionType?: 'create' | 'update' | 'delete' | 'view', onClick?: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="group relative p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col gap-2"


    ><div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 blur-xl" />

      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition">
        {title}
      </h3>

      <p className="text-sm text-gray-300 group-hover:text-gray-200 transition">
        {description}
      </p>
    </div>
  );

};

// 2. Section Wrapper Component
const DashboardSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-12">

    <div className="flex items-center gap-4 mb-6">

      <h2 className="text-xl font-semibold text-white whitespace-nowrap">
        {title}
      </h2>

      <div className="flex-1 h-px bg-gradient-to-r from-purple-500/60 to-transparent"></div>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>

  </section>
);


// --- MAIN PAGE ---

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.replace("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user?.role !== "ADMIN") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0120] via-[#14032e] to-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">

      {/* background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0b0120] via-[#14032e] to-[#020617]" />

      {/* glow effect */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/20 blur-[200px] rounded-full -z-10" />



      <Header />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-10">


        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-xl max-w-5xl">



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
        </div>
      </main>
    </div>
  );
}