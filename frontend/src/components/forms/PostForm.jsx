import React, { useState } from "react";
import { Button } from "../ui/Button";

export function PostForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content, image });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-card p-8 rounded-2xl shadow-soft space-y-6"
    >
      <h2 className="font-display text-2xl font-semibold text-center">
        Create a Post
      </h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className="w-full p-3 rounded-lg border border-border bg-background text-foreground h-32"
      />
      <input
        type="text"
        placeholder="Image URL (optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
      />
      <Button type="submit" variant="gold" size="lg" className="w-full">
        Publish Post
      </Button>
    </form>
  );
}
