import { useState, useEffect } from "react";
import PaintSidebar from "../components/paintsidebar";
import { PostGallery } from "../components/postgallery";
import { fetchAllTags } from "../hooks/trending";
import { Clock } from 'lucide-react'
interface Tag {
  name: string;
}

const HomePage = () => {
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchAllTags();
        setAvailableTags(tags || []);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setAvailableTags([]);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  return (
    <div className="flex">
      <PaintSidebar selectedPage="home" />
      <main className="flex-1 ml-0 min-h-screen w-full !bg-gray-900">
        {/* Tag Selector - Redesigned */}
        <div className="top-0 z-10 !bg-gray-900">
          {/* Tag Filter - Scrollable and Left Aligned */}
          <div className="bg-gray-800 rounded-xl m-3 mt-6  border border-gray-700 py-2 px-6 overflow-x-auto flex gap-2 flex-nowrap  ">
            {/* Recent/All Posts Chip */}
            <button
              onClick={() => setSelectedTag("")}
              className={`flex flex-row items-center justify-center gap-2 rounded-full px-3 py-2 transition-all duration-150
    ${selectedTag === ""
                  ? "text-white underline underline-offset-4"
                  : "text-gray-400 cursor-pointer hover:text-white"
                }`}
            >
             Recent
            </button>

            {/* Tag Chips */}
            {loading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-5 w-16 bg-gray-800 rounded-md animate-pulse"
                  />
                ))}
              </>
            ) : (
              availableTags.map((tag) => (
                <button
                  key={tag.name}
                  id={tag.name}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`flex flex-row items-center justify-center gap-2 rounded-full px-3 py-2 transition-all duration-150
        ${selectedTag === tag.name
                      ? "text-white underline underline-offset-4"
                      : "text-gray-400 cursor-pointer hover:text-white"
                    }`}
                >
                  {tag.name}
                </button>
              ))
            )}

          </div>
        </div>

        {/* Post Gallery */}
        {selectedTag ? (
          <PostGallery tag={selectedTag || undefined} />
        ) : (
          <PostGallery />
        )}

      </main>
    </div>
  );
};

export default HomePage;