import {
  Button,
} from "flowbite-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Laugh,
  Smile,
  Meh,
  Frown,
  Angry,
  MessageCircle,
  Send,
  EllipsisVertical,
} from "lucide-react";  
import { useState, useEffect } from "react";
import PaintSidebar from "../components/paintsidebar";
import { usePosts } from "../hooks/posts";
const animations = {
  in: "animate-slide-in",
  out: "animate-slide-out",
};
const FastDraws = () => {
  const { posts, loading, error } = usePosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPostIndex, setCurrentPostIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Effect to handle initial load and URL params
  useEffect(() => {
    if (posts?.posts) {
      const postId = searchParams.get('postId');
      if (postId) {
        const index = posts.posts.findIndex(post => post.id === postId);
        if (index >= 0) {
          setCurrentPostIndex(index);
        } else {
          // If post not found, redirect to first post
          setCurrentPostIndex(0);
          setSearchParams({ postId: posts.posts[0].id });
        }
      } else {
        // No postId in URL, set to first post
        setCurrentPostIndex(0);
        setSearchParams({ postId: posts.posts[0].id });
      }
    }
  }, [posts, searchParams, setSearchParams]);

  // Effect to update URL when post changes
  useEffect(() => {
    if (posts?.posts && currentPostIndex !== null) {
      setSearchParams({ postId: posts.posts[currentPostIndex].id });
    }
  }, [currentPostIndex, posts, setSearchParams]);

  const handleReactionClick = () => {
    if (isAnimating || !posts?.posts || currentPostIndex === null) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPostIndex((prev) => (prev !== null ? (prev + 1) % posts.posts.length : 0));
      setIsAnimating(false);
    }, 500);
  };
  
  useEffect(() => {
  if (isAnimating) {
    // Remove focus from all buttons in the container
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.blur());
  }
}, [isAnimating]);

  const handleShareClick = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    // Optionally add a toast notification here
    alert("Link copied to clipboard!");
  };

  //const user = useAuthStore((state) => state);
  /*   const handleLogout = () => {
      useAuthStore.logout();
    }; */
  let photoIcon =
    "opacity-50 ease-in-out group-focus:opacity-100 group-hover:scale-116  group-focus:scale-116 group-hover:opacity-100 transition-all duration-600";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div className="flex overflow-y-hidden">
      <PaintSidebar />

      <section className="flex-1 ml-0 min-h-screen w-full h-full bg-gray-300 dark:bg-gray-900 flex items-center justify-center px-6 flex-col space-y-4">
        <div className="flex relative">
          <div className={`flex flex-col ${animations[isAnimating ? 'out' : 'in']}`}>
            <section className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
              {!loading ? (
                !error && posts?.posts && currentPostIndex !== null ? (
                  <div className="w-full h-full">
                    <img
                      src={posts.posts[currentPostIndex].url_bucket}
                      alt="Post Image"
                      width={512}
                      height={512}
                      style={{
                        imageRendering: 'pixelated',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 via-red-700 to-black text-white font-bold rounded-xl">
                    Error loading posts
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  Loading...
                </div>
              )}
            </section>

            <div className="flex w-[30%] mt-3 gap-2 bg-gray-700 p-2 rounded-xl justify-center mx-auto">
              <Button onClick={isAnimating ? undefined : handleReactionClick} className="group px-6 !bg-white dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-green-500 hover:!border-green-500">
                <Laugh color={isDark ? "white" : "black"} className={photoIcon} />
              </Button>
              
              <Button  onClick={isAnimating ? undefined : handleReactionClick} className="group !bg-white dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-red-800 hover:!border-red-800">
                <Angry color={isDark ? "white" : "black"} className={photoIcon} />
              </Button>
            </div>
          </div>

          <section className="absolute right-[0px] translate-x-3/2 translate-y-2/4 h-[200px] justify-around flex flex-col bg-gray-800 p-2 rounded-xl">
            <Button className="group focus:outline-none focus:ring-0 !bg-white  dark:!bg-black !border-2 focus:!border-white hover:!border-white  aspect-square !p-0 h-12">
              <MessageCircle
                color={isDark ? "white" : "black"}
                className={photoIcon}
              />
            </Button>
            <Button 
              onClick={handleShareClick}
              className="group focus:outline-none !bg-white dark:!bg-black !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12"
            >
              <Send color={isDark ? "white" : "black"} className={photoIcon} />
            </Button>
            <Button className="group focus:outline-none !bg-white  dark:!bg-black !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12">
              {" "}
              <EllipsisVertical
                color={isDark ? "white" : "black"}
                className={photoIcon}
              />
            </Button>
          </section>
        </div>
      </section>
    </div>
  );
};

export default FastDraws;
