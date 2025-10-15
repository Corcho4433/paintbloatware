import { useState, useEffect } from "react";
import PaintSidebar from "../components/paintsidebar";
import { PostGallery } from "../components/postgallery";
import { fetchAllTags } from "../hooks/trending";

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
      <PaintSidebar />
      <main className="flex-1 ml-0 min-h-screen !bg-gray-900">
        {/* Tag Selector - Redesigned */}
        <div className="sticky top-0 z-10 !bg-gray-900 border-b border-gray-800">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Explore Posts</h1>
                <div className="text-sm text-gray-400">
                  {availableTags.length > 0 && `${availableTags.length} tags available`}
                </div>
              </div>

              {/* Tag Filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 whitespace-nowrap">Filter by:</span>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {/* Recent/All Posts Chip */}
                  <button
                    onClick={() => setSelectedTag("")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${selectedTag === ""
                        ? "!bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "!bg-gray-800 text-gray-300 hover:!bg-gray-700 hover:text-white border border-gray-700"
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent
                  </button>

                  {/* Tag Chips */}
                  {loading ? (
                    // Loading skeleton
                    <div className="flex gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-9 w-16 !bg-gray-800 rounded-full animate-pulse border border-gray-700"
                        />
                      ))}
                    </div>
                  ) : (
                    availableTags.map((tag) => (
                      <button
                        key={tag.name}
                        id={tag.name}
                        onClick={() => setSelectedTag(tag.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${selectedTag === tag.name
                            ? "!bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                            : "!bg-gray-800 text-gray-300 hover:!bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600"
                          }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Gallery */}
        {selectedTag ? <div className="p-6">
          <PostGallery tag={selectedTag || undefined} />
        </div> : 
        <div className="p-6"> <PostGallery /></div>
        }

      </main>
    </div>
  );
};

export default HomePage;