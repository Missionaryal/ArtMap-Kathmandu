// TaggedPosts.jsx
// Shows all posts that users have tagged at the creator's place.
// New posts arrive as "Pending" — the creator must approve them before
// they become visible on the public place detail page.
// The creator can also remove any post they don't want shown.

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCreatorTaggedPosts,
  approveTaggedPost,
  removeTaggedPost,
} from "../../../api/creatorApi";

export default function TaggedPosts() {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Tracks which post's button is currently being processed (shows "..." spinner)
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getCreatorTaggedPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load tagged posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve a post — calls the backend to set is_approved=True
  // Then updates local state so the UI reflects the change immediately
  const handleApprove = async (postId) => {
    setActionLoading(postId);
    try {
      await approveTaggedPost(postId);
      // Update the post in local state — no need to re-fetch everything
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_approved: true } : p)),
      );
    } catch (err) {
      console.error("Failed to approve post:", err);
      alert("Could not approve post. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Remove a post — deletes it permanently from the backend
  // Then removes it from local state so it disappears from the UI
  const handleRemove = async (postId) => {
    if (!window.confirm("Remove this post? This cannot be undone.")) return;
    setActionLoading(postId);
    try {
      await removeTaggedPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to remove post:", err);
      alert("Could not remove post. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter posts based on which tab is active
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "pending") return !post.is_approved;
    if (activeTab === "approved") return post.is_approved;
    return true; // "all" tab shows everything
  });

  // Count helpers for tab labels
  const pendingCount = posts.filter((p) => !p.is_approved).length;
  const approvedCount = posts.filter((p) => p.is_approved).length;

  if (loading)
    return (
      <div className="text-center py-8 text-stone-500">Loading posts...</div>
    );

  return (
    <div>
      {/* Section header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Tagged Posts
        </h1>
        <p className="text-stone-600">
          Posts from visitors who tagged your place — approve to make them
          visible publicly
        </p>
      </div>

      {/* Tab filter with live counts */}
      <div className="flex gap-2 mb-6 border-b border-stone-200">
        {[
          { id: "all", label: `All Posts (${posts.length})` },
          { id: "pending", label: `Pending (${pendingCount})` },
          { id: "approved", label: `Approved (${approvedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-gold-600"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab.label}
            {/* Gold underline indicator for active tab */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
            )}
          </button>
        ))}
      </div>

      {/* Post grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden"
            >
              {/* Post photo with approval status badge */}
              <div className="relative aspect-square">
                <img
                  src={post.photo}
                  alt={post.caption || "Tagged post"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.is_approved
                        ? "bg-green-500 text-white"
                        : "bg-orange-400 text-white"
                    }`}
                  >
                    {post.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Post metadata and action buttons */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-stone-900">
                    @{post.user?.username || "user"}
                  </p>
                  <div className="flex items-center gap-1 text-stone-400">
                    <Heart className="w-3.5 h-3.5" />
                    <span className="text-xs">0</span>
                  </div>
                </div>

                {/* Show caption if the user wrote one */}
                {post.caption && (
                  <p className="text-xs text-stone-500 mb-2 line-clamp-2">
                    {post.caption}
                  </p>
                )}

                <p className="text-xs text-stone-400 mb-3">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                {/* Action buttons — Approve only shows for pending posts */}
                <div className="flex gap-2">
                  {!post.is_approved && (
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={actionLoading === post.id}
                      className="flex-1 h-7 px-3 bg-gold-400 text-white text-xs font-medium rounded hover:bg-gold-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === post.id ? "..." : "Approve"}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(post.id)}
                    disabled={actionLoading === post.id}
                    className="flex-1 h-7 px-3 border border-stone-300 text-stone-600 text-xs font-medium rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === post.id ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state message changes based on active tab
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-400">
            {activeTab === "pending"
              ? "No posts waiting for approval"
              : activeTab === "approved"
                ? "No approved posts yet"
                : "No tagged posts yet"}
          </p>
        </div>
      )}
    </div>
  );
}
