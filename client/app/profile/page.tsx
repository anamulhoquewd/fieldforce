'use client';

import { useState } from 'react';
import { Bell, Truck, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useUser } from "@/context/authContext"

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export default function ProfilePage() {
  const { user, logout } = useUser()
  const [availability, setAvailability] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name ?? "—"}</h2>
            <p className="text-sm text-gray-500 capitalize">{user?.role ?? "—"}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-600">
                {availability ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Settings */}
      <div className="bg-white mt-4">
        {/* Availability */}
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900">Availability</span>
          </div>
          <button
            onClick={() => setAvailability(!availability)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              availability ? 'bg-teal-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                availability ? 'translate-x-6' : 'translate-x-1'
              } mt-0.5`}
            />
          </button>
        </div>

        {/* Notifications */}
        <button className="w-full px-4 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell size={20} className="text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">Notifications</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        {/* Vehicle & Equipment */}
        <button className="w-full px-4 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Truck size={20} className="text-orange-600" />
            </div>
            <span className="font-medium text-gray-900">Vehicle & equipment</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        {/* Help & Support */}
        <button className="w-full px-4 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <HelpCircle size={20} className="text-purple-600" />
            </div>
            <span className="font-medium text-gray-900">Help & support</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        {/* Sign Out */}
        <button onClick={logout} className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <LogOut size={20} className="text-red-600" />
            </div>
            <span className="font-medium text-red-600">Sign out</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
