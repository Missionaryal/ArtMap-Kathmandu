import React from "react";
import { Link } from "react-router-dom";

export function PostCard({ post }) {
  return (
    <Link
      to={`/post/${post.id}`}
      className="group rounded-2xl bg-card border border-border/50 shadow-soft overflow-hidden card-hover"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.image || "/assets/placeholder.svg"}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
        <span className="text-xs text-primary font-medium">{post.author}</span>
      </div>
    </Link>
  );
}
