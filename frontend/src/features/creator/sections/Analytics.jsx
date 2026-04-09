// Analytics.jsx
// The analytics section of the creator dashboard.
// Shows total places, photos, reviews, and tagged posts pulled from the API.
// Also shows a monthly views bar chart and discovery source breakdown.
// Note: The monthly views and discovery source data are currently placeholder values
// since view tracking is not yet implemented in the backend.

import { Eye, Heart, MessageSquare, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { getCreatorStats } from "../../../api/creatorApi";

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getCreatorStats();
      // Map the API response to the stat cards format
      setStats([
        {
          label: "Total Places",
          value: data.total_places.toString(),
          icon: Eye,
        },
        {
          label: "Total Photos",
          value: data.total_photos.toString(),
          icon: Heart,
        },
        {
          label: "Total Reviews",
          value: data.total_reviews.toString(),
          icon: MessageSquare,
        },
        {
          label: "Tagged Posts",
          value: data.total_posts.toString(),
          icon: Star,
        },
      ]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Placeholder data — real view tracking would need a separate backend model
  const monthlyViews = [
    { month: "Oct", views: 0 },
    { month: "Nov", views: 0 },
    { month: "Dec", views: 0 },
    { month: "Jan", views: 0 },
    { month: "Feb", views: 0 },
    { month: "Mar", views: 1 },
  ];

  // Avoid dividing by zero when all values are 0
  const maxViews = Math.max(...monthlyViews.map((m) => m.views), 1);

  // Placeholder data — real source tracking would need analytics integration
  const sources = [
    { name: "Explore Page", percentage: 42 },
    { name: "Map View", percentage: 28 },
    { name: "Direct Link", percentage: 18 },
    { name: "Search", percentage: 12 },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Analytics
        </h1>
        <p className="text-stone-600">Track your place performance</p>
      </div>

      {/* Stats Grid — real data from the API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats?.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-stone-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-serif font-bold text-stone-900">
                    {stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Views Bar Chart — placeholder data */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm mb-8">
        <h3 className="font-semibold text-stone-900 mb-2">Monthly Views</h3>
        <p className="text-sm text-stone-500 mb-6">
          Page views over the last 6 months
        </p>
        <div className="h-48 flex items-end gap-4">
          {monthlyViews.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <span className="text-xs font-medium text-stone-900 mb-2">
                {data.views}
              </span>
              <div
                className="w-full bg-gold-400/80 rounded-t-lg transition-all hover:bg-gold-400"
                style={{
                  height: `${(data.views / maxViews) * 100}%`,
                  minHeight: data.views > 0 ? "8px" : "0px",
                }}
              />
              <span className="text-xs text-stone-500 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discovery Sources — placeholder data */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-stone-900 mb-2">Discovery Sources</h3>
        <p className="text-sm text-stone-500 mb-6">
          Where your visitors come from
        </p>
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-900">
                  {source.name}
                </span>
                <span className="text-sm text-stone-500">
                  {source.percentage}%
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-400 rounded-full"
                  style={{ width: `${source.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
