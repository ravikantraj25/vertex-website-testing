"use client";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
//  const searchParams = useSearchParams();
//  const role = searchParams.get("role") || "guest";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">
          Hello from Vertex
        </h1>
        <p className="text-lg text-gray-600">
          Role: <span className="font-medium text-gray-900"></span>
        </p>
      </div>
    </div>
  );
}