// AboutPage.jsx
// The About page — explains ArtMap's mission, the art forms it documents,
// and the values driving the project. Uses alternating warm/white sections.
// Clicking art form cards navigates to the Explore page pre-filtered by category.

import { useNavigate } from "react-router-dom";
import {
  Palette,
  Shield,
  Users,
  BookOpen,
  ArrowRight,
  Heart,
} from "lucide-react";
import heroImage from "../../assets/about/aboutus hero image.avif";
import thangkaArtist from "../../assets/about/Lucky_Thanka_ aboutus.jpg";
import thangkaProcess from "../../assets/about/Thanka-Painting-Nepal- process.jpg";
import metalCasting from "../../assets/about/metal casting aboutus.jpg";
import artisanTeaching from "../../assets/about/old gen teaching.png";
import paubhaArt from "../../assets/about/paubha art about us.png";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero — 75% screen height with a diagonal gradient overlay */}
      <section className="relative h-[75vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Kathmandu heritage"
          className="w-full h-full object-cover"
        />
        {/* Gradient is stronger on the left so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                <span className="text-xs font-semibold text-gold-400 tracking-widest uppercase">
                  Preserving Heritage
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                Where Ancient Art Meets Living Culture
              </h1>
              <p className="text-lg text-white/75 leading-relaxed max-w-xl">
                ArtMap is a love letter to the artisans, creators, and cultural
                guardians who keep Nepal's artistic soul alive — from thangka
                painters in Bhaktapur to bronze casters of Patan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist — warm cream background */}
      <section className="bg-[#F5F0E8] py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden h-[480px]">
            <img
              src={thangkaArtist}
              alt="Thangka artist painting"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gold-500 tracking-widest uppercase mb-4">
              Why We Exist
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
              Art Is Nepal's Heartbeat
            </h2>
            <div className="space-y-5 text-stone-500 leading-relaxed">
              <p>
                Nepal's artistic heritage stretches back millennia. From the
                sacred thangka paintings of Buddhist monasteries to the
                intricate Newari wood carvings that adorn Kathmandu's ancient
                courtyards, art is not decoration here — it is devotion,
                identity, and memory.
              </p>
              <p>
                Yet many of these traditions are fading. Master artisans are
                aging without apprentices. Cultural spaces struggle for
                visibility. The stories behind the art risk being lost.
              </p>
              <p>
                ArtMap was created to change this — to give Nepal's art and its
                creators the visibility, respect, and connection they deserve.
                We map not just places, but the living, breathing culture behind
                them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Art Forms We Celebrate — white background for contrast */}
      <section className="bg-white py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-gold-500 tracking-widest uppercase mb-4">
              Heritage We Protect
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
              The Art Forms We Celebrate
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
              These sacred traditions have shaped Nepal's identity for
              centuries. Each one deserves to be seen, understood, and
              preserved.
            </p>
          </div>
          {/* Clicking an art form card navigates to explore with that category pre-selected */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Thangka Painting",
                image: thangkaProcess,
                desc: "Sacred Buddhist scroll paintings created with mineral pigments — lapis lazuli, malachite, and gold. A single medium thangka requires up to six months of devoted work.",
                category: "thangka",
              },
              {
                title: "Paubha Art",
                image: paubhaArt,
                desc: "The Newari tradition of religious painting — intricate deity portraits on cotton canvas that serve as windows between the human world and the divine.",
                category: "gallery",
              },
              {
                title: "Metal Casting",
                image: metalCasting,
                desc: "The lost-wax cire perdue technique used in Patan for over 1,500 years — creating bronze deities so perfect they have been collected by museums worldwide.",
                category: "sculpture",
              },
            ].map((item) => (
              <div
                key={item.title}
                onClick={() => navigate(`/explore?category=${item.category}`)}
                className="group cursor-pointer"
              >
                <div className="h-72 rounded-2xl overflow-hidden mb-5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-xl mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Than a Map — warm background again */}
      <section className="bg-[#F5F0E8] py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold text-gold-500 tracking-widest uppercase mb-4">
              What Drives Us
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
              More Than a Map. A Movement.
            </h2>
            <p className="text-stone-500 leading-relaxed mb-10">
              ArtMap is not just about finding galleries. It is about building a
              bridge between the keepers of tradition and a new generation of
              art lovers who believe culture is worth fighting for.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  icon: Palette,
                  title: "Preserve Tradition",
                  desc: "We document and celebrate the living art traditions that define Nepal's cultural identity.",
                },
                {
                  icon: Users,
                  title: "Empower Creators",
                  desc: "We give artisans and gallery owners a platform to share their craft with the world.",
                },
                {
                  icon: Shield,
                  title: "Protect Heritage",
                  desc: "We advocate for the preservation of endangered art forms and cultural spaces.",
                },
                {
                  icon: BookOpen,
                  title: "Educate & Inspire",
                  desc: "We connect learners with master artisans to keep ancient techniques alive.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">
                      {title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden h-[480px]">
              <img
                src={artisanTeaching}
                alt="Master artisan teaching"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating quote card overlaid on the image */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    Passing It On
                  </p>
                  <p className="text-xs text-stone-500">
                    Every master artisan on ArtMap is a living library of
                    knowledge that cannot be found in any book.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — white background so the Footer (cream) contrasts clearly below it */}
      <section className="bg-white py-24 px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-gold-500 tracking-widest uppercase mb-6">
            Join the Movement
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
            Help Us Keep Nepal's Art Alive
          </h2>
          <p className="text-stone-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Whether you are an artist, a gallery owner, a traveler, or simply
            someone who believes in the power of culture — there is a place for
            you on ArtMap. Explore, connect, and become part of the story.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all text-sm shadow-md hover:-translate-y-0.5"
            >
              Discover Cultural Spaces
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/map")}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-100 text-stone-800 font-semibold rounded-xl border border-stone-200 hover:bg-stone-200 transition-all text-sm hover:-translate-y-0.5"
            >
              Explore the Map
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
