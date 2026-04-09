// SettingsSection.jsx
// The settings section of the creator dashboard.
// Shows toggle switches for creator preferences and a danger zone for deactivating the listing.
// Note: These settings are currently stored in local React state only.
// To make them persistent, a settings API endpoint would need to be added to the backend.

import { useState } from "react";

export default function SettingsSection() {
  const [settings, setSettings] = useState({
    listingVisible: true,
    allowTaggedPosts: true,
    reviewNotifications: true,
    autoApproveTaggedPosts: false,
  });

  // Toggle a specific setting on or off
  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const preferences = [
    {
      key: "listingVisible",
      title: "Listing Visibility",
      description: "Make your place visible in search and explore",
    },
    {
      key: "allowTaggedPosts",
      title: "Allow Tagged Posts",
      description: "Let visitors tag your place in their posts",
    },
    {
      key: "reviewNotifications",
      title: "Review Notifications",
      description: "Get notified when someone reviews your place",
    },
    {
      key: "autoApproveTaggedPosts",
      title: "Auto-approve Tagged Posts",
      description: "Automatically approve all tagged posts",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Settings
        </h1>
        <p className="text-stone-600">Manage your preferences</p>
      </div>

      {/* Preferences — toggle switches */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm mb-8">
        <h3 className="font-semibold text-stone-900 mb-4">Preferences</h3>
        <div className="divide-y divide-stone-200">
          {preferences.map((pref, index) => (
            <div
              key={pref.key}
              className={`flex items-center justify-between ${index === 0 ? "pb-4" : "py-4"}`}
            >
              <div>
                <h4 className="font-medium text-stone-900">{pref.title}</h4>
                <p className="text-sm text-stone-500">{pref.description}</p>
              </div>
              {/* Custom toggle switch — gold when on, grey when off */}
              <button
                onClick={() => toggleSetting(pref.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[pref.key] ? "bg-gold-400" : "bg-stone-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[pref.key] ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone — deactivating hides the listing from all visitors */}
      <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-stone-600 mb-4">
          Deactivating your listing will hide it from all users. You can
          reactivate it anytime from your settings.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Deactivate Listing
        </button>
      </div>
    </div>
  );
}
