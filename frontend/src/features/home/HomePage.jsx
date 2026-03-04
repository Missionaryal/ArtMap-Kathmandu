import HeroSection from "./HeroSection";
import FeaturedCreators from "./FeaturedCreators";
import CategoryBrowser from "./CategoryBrowser";
import UpcomingEvents from "./UpcomingEvents";
import CreatorCTA from "./CreatorCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedCreators />
      <CategoryBrowser />
      <UpcomingEvents />
      <CreatorCTA />
    </div>
  );
}
