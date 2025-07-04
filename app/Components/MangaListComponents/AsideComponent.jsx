"use client";
import React, { Suspense, useCallback, useMemo, useState } from "react";
import {
  Star,
  Heart,
  Flame,
  Trophy,
  Eye,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import Image from "next/image"
import AsideComponentSkeleton from "../Skeletons/MangaList/AsideComponentSkeleton";
import { useMangaFetch } from "../../hooks/useMangaFetch";
import { useRouter } from "next/navigation";
import { useManga } from "../../providers/MangaContext";

function AsideComponent() {
  const { data: ratingData, isLoading: ratingLoading, isError: ratingError, error: ratingErrorMsg } = useMangaFetch('rating', 1);
  const { data: favouriteData, isLoading: favouriteLoading, isError: favouriteError, error: favouriteErrorMsg } = useMangaFetch('favourite', 1);
  const { data: latestArrivalsData, isLoading: latestArrivalsLoading, isError: latestArrivalsError, error: latestArrivalsErrorMsg } = useMangaFetch('latestArrivals', 1);

  const processedMangas = useMemo(() => ratingData?.data || [], [ratingData]);
  const processedFavouriteMangas = useMemo(() => favouriteData?.data || [], [favouriteData]);
  const processedLatestArrivalsMangas = useMemo(() => latestArrivalsData?.data || [], [latestArrivalsData]);

  const [selectedCategory, setSelectedCategory] = useState("Top");
    const router = useRouter();
  const { setSelectedManga } = useManga();
  const handleMangaClicked = useCallback((manga) => {
    setSelectedManga(manga);
    router.push(`/manga/${manga.id}/chapters`);
  }, [router, setSelectedManga]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(".0", "") + "K";
    }
    return num.toString();
  };

  if (ratingLoading || favouriteLoading || latestArrivalsLoading) {
    return <AsideComponentSkeleton />; // Replace with your skeleton
  }

  if (ratingError || favouriteError || latestArrivalsError) {
    return <div className="text-red-500">Error: {ratingErrorMsg?.message || favouriteErrorMsg?.message || latestArrivalsErrorMsg?.message}</div>;
  }

  // Select manga list based on category
  const mangaToDisplay =
    selectedCategory === "Top"
      ? processedMangas
      : selectedCategory === "Favourite"
        ? processedFavouriteMangas
        : processedLatestArrivalsMangas;

  // Category icon & label config for stats
  const statConfig = {
    Top: {
      title: "Top Ranked",
      subtitle: "Highest Rated Series",
      titleIcon: Trophy,
      icon: Star,
      label: "Rating",
      getValue: (m) =>
        m?.rating?.rating?.bayesian?.toFixed(2) ?? "0.00",
      color: "text-yellow-400",
      iconBg: "bg-yellow-400/10",
    },
    Favourite: {
      title: "Fan Favorites",
      subtitle: "Most Loved Series",
      titleIcon: Heart,
      icon: UserPlus,
      label: "Follows",
      getValue: (m) => formatNumber(m?.rating?.follows ?? 0),
      color: "text-rose-400",
      iconBg: "bg-rose-400/10",
    },
    New: {
      title: "New Arrivals",
      subtitle: "Recently Added Mangas",
      titleIcon: Flame,
      icon: MessageCircle,
      label: "Comments",
      getValue: (m) =>
        m?.rating?.rating?.bayesian?.toFixed(2) ?? "0.00",
      color: "text-cyan-400",
      iconBg: "bg-cyan-400/10",
    },
  };

  // Category button config
  const categories = [
    { key: "Top", label: "Top", icon: Trophy, accent: "text-yellow-400" },
    { key: "Favourite", label: "Favourite", icon: Heart, accent: "text-rose-400" },
    { key: "New", label: "New", icon: Flame, accent: "text-cyan-400" },
  ];

console.log(processedFavouriteMangas)
  const StatIcon = statConfig[selectedCategory].icon;
  const TitleIcon = statConfig[selectedCategory].titleIcon
  return (
    <Suspense fallback={<AsideComponentSkeleton />}>
      <section
        aria-label="Manga list"
        className="w-full max-w-md mx-auto select-none mb-10 md:mb-0"
        style={{ background: "transparent" }}
      >
        <div className="flex mx-2 md:mx-9 mb-7 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-lg">< TitleIcon className={`w-6 h-6 ${statConfig[selectedCategory].color}   drop-shadow-md`} /></div>
            <div>
              <h2 className="text-lg font-semibold text-white">{statConfig[selectedCategory].title}</h2>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{statConfig[selectedCategory].subtitle}</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-3.5 rounded-md text-gray-300 text-sm hover:text-white hover:bg-gray-800/50 transition-all duration-200 border border-gray-700/50">
            <Eye className="w-4 h-4" />
            View All
          </button>
        </div>
        {/* Category Tabs */}
        <nav className="flex justify-center mx-2 md:mx-0 gap-4 mb-6">
          {categories.map(({ key, label, icon: Icon, accent }) => {
            const active = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex min-w-28 justify-center items-center gap-2 px-4 py-4 rounded-lg font-semibold text-xs md:text-sm transition-colors duration-300 focus:outline-none
                 ${active
                    ? `bg-[rgba(255,255,255,0.09)] ${accent}`
                    : "text-gray-400 bg-[rgba(255,255,255,0.05)]  hover:text-gray-200"
                  }`}
                aria-pressed={active}
                type="button"
              >
                <Icon
                  className={`w-5 h-5 ${active ? accent : "text-gray-500"
                    }`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Manga List */}
        <ul className="grid grid-cols-3 md:block md:space-y-3 mx-1 md:mx-3">
          {mangaToDisplay.slice(0, 9).map((manga, idx) => (
            <li
              key={manga.id}
              onClick={() => handleMangaClicked(manga)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleMangaClicked(manga);
                }
              }}
              className="flex items-center md:gap-1 cursor-pointer rounded-lg md:px-3 py-2 transition-colors duration-250
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
              hover:bg-gray-800/40"
              aria-label={`${manga.title} - ${statConfig[selectedCategory].label}: ${statConfig[
                selectedCategory
              ].getValue(manga)}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0  w-5 md:w-8 text-center select-none">
                <span
                  className={`text-2xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-gray-400 to-gray-600`}
                >
                  {idx + 1}
                </span>
              </div>

              {/* Cover */}
              <div className="flex-shrink-0 w-10 h-12 md:w-12 md:h-16 rounded-md overflow-hidden shadow-md">
                <Image
                  width={300}
                  height={300}
                  src={manga.coverImageUrl || "./placeholder.jpg"}
                  alt={manga.title ?? "Manga cover"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[102%]"
                  loading="lazy"
                  decoding="async"
                  onError={() => "./placeholder.jpg"}
                />
              </div>

              {/* Title & Stats */}
              <div className="flex flex-col ml-1 md:ml-3 flex-1 min-w-0">
                <h3
                  className="text-white text-xs md:text-base font-semibold truncate"
                  title={manga.title}
                >
                  {manga.title ?? "Untitled Manga"}
                </h3>

                <div className={`flex items-center gap-1 md:gap-2 mt-1 text-xs text-gray-400 select-none ${selectedCategory == "New" ? "hidden" : ""}`}>
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full ${statConfig[selectedCategory].iconBg} ${statConfig[selectedCategory].color}`}
                    aria-hidden="true"
                  >
                    <StatIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className={`font-medium text-gray-300`}>
                    {selectedCategory !== "New" && statConfig[selectedCategory].getValue(manga)}
                  </span>
                </div>
                {console.log(selectedCategory)
                }
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Suspense>
  );
}

export default React.memo(AsideComponent);
