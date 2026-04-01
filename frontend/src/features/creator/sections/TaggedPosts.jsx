import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getCreatorTaggedPosts } from "../../../api/creatorApi";

export default function TaggedPosts() {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getCreatorTaggedPosts();
      setPosts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "pending") return !post.approved;
    if (activeTab === "approved") return post.approved;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Tagged Posts
        </h1>
        <p className="text-stone-600">
          Posts from visitors who tagged your place
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200">
        {[
          { id: "all", label: "All Posts" },
          { id: "pending", label: "Pending" },
          { id: "approved", label: "Approved" },
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
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
            )}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-square">
                <img
                  src={post.photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      post.approved
                        ? "bg-gold-400 text-white"
                        : "bg-orange-400 text-white"
                    }`}
                  >
                    {post.approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-stone-900">
                    @{post.user?.user?.username || "user"}
                  </p>
                  <div className="flex items-center gap-1 text-stone-500">
                    <Heart className="w-3.5 h-3.5" />
                    <span className="text-xs">0</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mb-3">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                {/* Actions */}
                {activeTab !== "approved" && (
                  <div className="flex gap-2">
                    {!post.approved && (
                      <button className="flex-1 h-7 px-3 bg-gold-400 text-white text-xs font-medium rounded hover:bg-gold-500 transition-colors">
                        Approve
                      </button>
                    )}
                    <button className="flex-1 h-7 px-3 border border-stone-300 text-stone-700 text-xs font-medium rounded hover:bg-stone-50 transition-colors">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-500">No {activeTab} posts yet</p>
        </div>
      )}
    </div>
  );
}
