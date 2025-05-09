"use client";

import { SocialConnections } from '@/components/dashboard/social-connections';

// Client components cannot export metadata
// Page title is controlled by the layout.tsx file

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Social Media Connections */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Social Media Connections</h2>
          <SocialConnections />
        </div>
        
        {/* Account Settings */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Account Settings</h2>
          <p className="text-sm text-gray-500">Update your account information and preferences.</p>
          
          {/* This would be a future enhancement */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Profile Information</h3>
                <p className="text-sm text-gray-500">Update your name and profile picture</p>
              </div>
              <button className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200">
                Edit
              </button>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-gray-500">Update your password</p>
              </div>
              <button className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200">
                Change
              </button>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Manage email notification preferences</p>
              </div>
              <button className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200">
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
