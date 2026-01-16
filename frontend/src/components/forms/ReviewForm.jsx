import React, { useState } from "react";
import { Button } from "../ui/Button";

export function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-card p-8 rounded-2xl shadow-soft space-y-6"
    >
      <h2 className="font-display text-2xl font-semibold text-center">
        Leave a Review
      </h2>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Rating:</label>
        <select
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="p-2 rounded-lg border border-border bg-background text-foreground"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} Star{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        className="w-full p-3 rounded-lg border border-border bg-background text-foreground h-24"
      />
      <Button type="submit" variant="gold" size="lg" className="w-full">
        Submit Review
      </Button>
    </form>
  );
}
