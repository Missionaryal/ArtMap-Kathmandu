// HomePage.jsx
// The main landing page of ArtMap.
// Assembles all homepage sections in order with alternating background colours
// to create visual separation between sections.

import HeroSection from "./HeroSection";
import FeaturedCreators from "./FeaturedCreators";
import CategoryBrowser from "./CategoryBrowser";
import UpcomingEvents from "./UpcomingEvents";
import CreatorCTA from "./CreatorCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Full-screen hero with background image */}
      <HeroSection />

      {/* Featured art spaces — warm cream background */}
      <div className="bg-[#F5F0E8]">
        <FeaturedCreators />
      </div>

      {/* Category cards — white background for contrast */}
      <div className="bg-white">
        <CategoryBrowser />
      </div>

      {/* Upcoming workshops and events — back to cream */}
      <div className="bg-[#F5F0E8]">
        <UpcomingEvents />
      </div>

      {/* "Become a Creator" call-to-action — white background */}
      <div className="bg-white">
        <CreatorCTA />
      </div>
    </div>
  );
}
