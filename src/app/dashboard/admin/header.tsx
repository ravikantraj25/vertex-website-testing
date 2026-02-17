"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
export default function Header() {
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">

          Admin Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
  {adminName.charAt(0)}
</div>

          <div className="flex flex-col">
            <span className="text-xs text-white/60 uppercase tracking-wider font-semibold">
Logged in as</span>
            <span className="text-sm font-bold text-white">
{adminName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
