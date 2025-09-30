import {
  Button,
} from "flowbite-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Laugh,
  Angry,
  MessageCircle,
  Send,
  EllipsisVertical,
} from "lucide-react";
import { useState, useEffect } from "react";
import PaintSidebar from "../components/paintsidebar";
import { usePosts, usePostById } from "../hooks/posts";

const animations = {
  in: "animate-slide-in",
  out: "animate-slide-out",
};

const FastDraws = () => {
  const { posts, loading, error, loadMore, isLoadingMore, setPosts } = usePosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPostIndex, setCurrentPostIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get postId from URL params
  const postId = searchParams.get('postId');
  const { post, loading: postLoading, error: postError } = usePostById(postId);

  // Effect to handle URL postId - prioritize fetched post from URL
  useEffect(() => {
    if (postId && post && !postLoading && !postError) {
      // Check if this post is already in the posts array
      const existingIndex = posts?.posts?.findIndex(p => p.id === postId);
      
      if (existingIndex !== undefined && existingIndex >= 0) {
        // Post exists in array, just set the index
        setCurrentPostIndex(existingIndex);
      } else if (posts?.posts && !posts.posts.some(p => p.id === postId)) {
        // Post doesn't exist in array, add it to the beginning
        console.log(posts);
        setPosts(prev => ({
          ...prev!,
          posts: [post, ...prev!.posts],
        }));
        setCurrentPostIndex(0);
        console.log(posts);
      } else if (!posts?.posts) {
        // No posts array yet, create one with just this post
        setPosts({
          posts: [post],
          maxPages: 1,
          currentPage: 1,
          totalCount: 1
        });
        setCurrentPostIndex(0);
      }
    }
  }, [postId, post, postLoading, postError]);

  // Effect to handle initial load when no postId in URL
  useEffect(() => {
    if (!postId && !loading && posts?.posts?.length && currentPostIndex === null) {
      // No postId in URL, set to first post from the general posts
      setCurrentPostIndex(0);
      setSearchParams({ postId: posts.posts[0].id });
    }
  }, [postId, loading, posts, currentPostIndex, setSearchParams]);

  const handleReactionClick = () => {
  if (isAnimating || !posts?.posts?.length || currentPostIndex === null) return;
  setIsAnimating(true);

  setTimeout(() => {
   
    const isLastPost = currentPostIndex === posts.posts.length - 2; // -1 es el ultimo post, -2 e es el penultimo post
    console.log(currentPostIndex, posts.posts.length);
    if (isLastPost) {
      

      if (!isLoadingMore) {
        // Load more posts only if not already loading
        loadMore();
        console.log("Loading next page...");
      }
    }

    // Move to next post (loop around if necessary)
    setCurrentPostIndex((prev) =>
      prev !== null ? (prev + 1) : 0
    );
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

  let photoIcon =
    "opacity-50 ease-in-out group-focus:opacity-100 group-hover:scale-116  group-focus:scale-116 group-hover:opacity-100 transition-all duration-600";

  const renderContent = () => {
    // If we have a postId but are still loading that specific post
    if (postId && postLoading) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700">
          <div className="w-full h-full flex items-center justify-center text-white">
            Loading post...
          </div>
        </div>
      );
    }

    // If we have a postId but failed to load that specific post
    if (postId && postError) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          Failed to load post: {postError.message}
        </div>
      );
    }

    // Loading general posts
    if (loading) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700">
          <div className="w-full h-full flex items-center justify-center text-white">
            Loading...
          </div>
        </div>
      );
    }

    // General error loading posts
    if (error) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          {error instanceof Error ? error.message : "An error occurred while loading posts"}
        </div>
      );
    }

    if (currentPostIndex === null || !posts?.posts?.length) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white">
          Loading post...
        </div>
      );
    }

    const currentPost = posts.posts[currentPostIndex];
    if (!currentPost) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px] flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          Post not found
        </div>
      );
    } else {
      return (
        <img
          src={currentPost.url_bucket}
          alt="Post Image"
          width={512}
          height={512}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      );
    }
  };



  return (
    <div className="flex overflow-y-hidden">
      <PaintSidebar />

      <section className="flex-1 ml-0 min-h-screen w-full h-full bg-gray-900 flex items-center justify-center px-6 flex-col space-y-4">
        <div className="flex relative">
          <div className={`flex flex-col ${animations[isAnimating ? 'out' : 'in']}`}>
            <section className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
              <div className="w-full h-full">
                {renderContent()}
              </div>
            </section>

            <div className="flex w-[30%] mt-3 gap-2 bg-gray-700 p-2 rounded-xl justify-center mx-auto">
              <Button onClick={isAnimating ? undefined : handleReactionClick} className="group cursor-pointer !bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-green-500 hover:!border-green-500">
                <Laugh color={"white"} className={photoIcon} />
              </Button>

              <Button onClick={isAnimating ? undefined : handleReactionClick} className="group cursor-pointer  !bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-red-800 hover:!border-red-800">
                <Angry color={"white"} className={photoIcon} />
              </Button>
            </div>
          </div>

          <section className="absolute right-[0px] translate-x-3/2 translate-y-2/4 h-[200px] justify-around flex flex-col bg-gray-800 p-2 rounded-xl">
            <Button className="cursor-pointer group focus:outline-none focus:ring-0   !bg-black !border-2 focus:!border-white hover:!border-white  aspect-square !p-0 h-12">
              <MessageCircle
                color={"white"}
                className={photoIcon}
              />
            </Button>
            <Button
              onClick={handleShareClick}
              className="cursor-pointer group focus:outline-none !bg-black !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12"
            >
              <Send color={"white"} className={photoIcon} />
            </Button>
            <Button className="cursor-pointer group focus:outline-none !bg-black  !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12">
              <EllipsisVertical
                color={"white"}
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