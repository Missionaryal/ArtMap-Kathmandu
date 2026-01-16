import React from "react";
import { Star } from "lucide-react";

export function ReviewCard({ review }) {
  return (
    <div className="group rounded-2xl bg-card border border-border/50 shadow-soft p-6 card-hover">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-semibold text-lg">{review.user}</h3>
        <div className="flex items-center gap-1 text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? "fill-current" : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>
    </div>
  );
}
