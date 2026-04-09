// Overview.jsx
// The main dashboard home page shown when a creator first opens the dashboard.
// Displays summary stats (photos, saves, reviews, rating), the creator's place
// quick info card, and a recent activity feed built from the data.

import { useState, useEffect } from "react";
import {
  Eye,
  Heart,
  MessageSquare,
  Star,
  MapPin,
  Camera,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getCreatorStats, getCreatorPlaces } from "../../../api/creatorApi";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, places] = await Promise.all([
        getCreatorStats(),
        getCreatorPlaces(),
      ]);
      setStats(statsData);
      // Use the first place — creators currently only have one place
      if (places.length > 0) setPlace(places[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build a simple activity feed from the creator's real data
  const buildActivity = () => {
    if (!place)
      return [
        { icon: MapPin, text: "Create your place to get started", time: "Now" },
      ];
    const activity = [];
    if (place.name)
      activity.push({
        icon: MapPin,
        text: `Your place "${place.name}" is live`,
        time: "Active",
      });
    if (place.photos?.length > 0)
      activity.push({
        icon: Camera,
        text: `${place.photos.length} photo(s) uploaded to gallery`,
        time: "Gallery",
      });
    if (stats?.total_reviews > 0)
      activity.push({
        icon: MessageSquare,
        text: `${stats.total_reviews} review(s) from visitors`,
        time: "Reviews",
      });
    if (stats?.total_posts > 0)
      activity.push({
        icon: Heart,
        text: `${stats.total_posts} post(s) tagged to your place`,
        time: "Posts",
      });
    if (activity.length === 0)
      activity.push({
        icon: TrendingUp,
        text: "Add photos and details to attract visitors",
        time: "Tip",
      });
    return activity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-400" />
      </div>
    );
  }

  const activity = buildActivity();
  const avgRating = place?.average_rating || 0;

  const statCards = [
    {
      label: "Total Photos",
      value: stats?.total_photos ?? 0,
      icon: Camera,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      label: "Saves",
      value: stats?.total_bookmarks ?? 0,
      icon: Heart,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
    },
    {
      label: "Reviews",
      value: stats?.total_reviews ?? 0,
      icon: MessageSquare,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
    },
    {
      label: "Avg. Rating",
      // Show a dash if no reviews yet, otherwise show the rating to 1 decimal place
      value: avgRating > 0 ? avgRating.toFixed(1) : "—",
      icon: Star,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-1">
          Dashboard
        </h1>
        <p className="text-stone-500 text-sm">
          {place
            ? "Manage your place listing and track performance."
            : "Welcome! Start by creating your place."}
        </p>
      </div>

      {/* Prompt the creator to add their place if they haven't yet */}
      {!place && (
        <div className="bg-gold-50 border border-gold-200 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-stone-900 mb-1">
              You haven't created your place yet
            </p>
            <p className="text-sm text-stone-500">
              Go to Place Details to create your listing.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gold-600 flex-shrink-0" />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm text-stone-500">{stat.label}</p>
                <div
                  className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-serif font-bold text-stone-900 mb-2">
                {stat.value}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-gold-500" />
                <span className="text-xs font-medium text-gold-600">+0</span>
                <span className="text-xs text-stone-400 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Place Quick Info Card */}
      {place && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">Your Place</h3>
            <a
              href={`/places/${place.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium"
            >
              View public page <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            {/* Show the first gallery photo as the thumbnail, or a placeholder icon */}
            <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
              {place.photos?.[0]?.photo_url ? (
                <img
                  src={place.photos[0].photo_url}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-stone-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">{place.name}</p>
              <p className="text-sm text-stone-500 capitalize">
                {place.category?.replace("_", " ")}
              </p>
              {place.location && (
                <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {place.location}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                <span className="font-bold text-stone-900">
                  {place.average_rating || "—"}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {place.review_count || 0} reviews
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activity.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gold-600" />
                </div>
                <p className="text-sm text-stone-700 flex-1">{item.text}</p>
                <span className="text-xs text-stone-400">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
