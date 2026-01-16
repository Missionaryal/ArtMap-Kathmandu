// src/features/home/RecentPosts.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/posts";

const RecentPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("/posts/").then((res) => setPosts(res.data));
  }, []);

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Recent Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <img
              src={post.photo || "https://via.placeholder.com/400x250"}
              alt={post.caption}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-gray-800 font-semibold">
                {post.user.user.username}
              </p>
              <p className="text-gray-600">{post.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentPosts;
