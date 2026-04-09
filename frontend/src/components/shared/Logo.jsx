// Logo.jsx
// A reusable logo component used across the app.
// Supports different sizes and can optionally show or hide the "ArtMap" text.

import { Link } from "react-router-dom";
import logo from "../../assets/artmap final logo.jpeg";

// Props:
// size     — "sm" | "md" | "lg" — controls the image size
// linkTo   — path to navigate when clicked (set to null to make it non-clickable)
// showText — whether to show the "ArtMap" text next to the image
// textClass — extra CSS classes for the text (e.g. to change colour)
export default function Logo({
  size = "md",
  linkTo = "/",
  showText = true,
  textClass = "",
}) {
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };
  const textSizes = { sm: "text-base", md: "text-lg", lg: "text-xl" };

  const content = (
    <div className="flex items-center gap-2.5 group">
      <img
        src={logo}
        alt="ArtMap"
        className={`${sizes[size]} object-contain group-hover:scale-105 transition-transform`}
      />
      {showText && (
        <span
          className={`font-serif font-bold text-stone-900 hidden sm:block ${textSizes[size]} ${textClass}`}
        >
          ArtMap
        </span>
      )}
    </div>
  );

  // If linkTo is null, render as a plain div (no navigation)
  if (!linkTo) return content;

  return (
    <Link to={linkTo} className="flex-shrink-0">
      {content}
    </Link>
  );
}
