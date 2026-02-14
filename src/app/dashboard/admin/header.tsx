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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm overflow-hidden" style={{ width: '2.5rem', overflow: 'hidden' }}>
            {adminName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Logged in as</span>
            <span className="text-sm font-bold text-gray-800">{adminName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
