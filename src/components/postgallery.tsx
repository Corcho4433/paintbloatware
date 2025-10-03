import { useState, useEffect, useRef } from 'react';
import { usePosts  } from '../hooks/posts';
import useInfiniteScroll from '../hooks/infinetescroll';
import { PostModal } from './postmodal';
import { useAuthStore } from '../store/useAuthStore';

export const PostGallery = ({ userId }: { userId?: string }) => {
  const { posts, loading, error, loadMore, isLoadingMore } = usePosts({ userId: userId });
  const auth = useAuthStore();
  const id = auth.user?.id; // Adjust this line if your user ID is stored differently
  const sentinelRef = useInfiniteScroll({
    loadMore,
    isLoading: isLoadingMore
  });

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const prevUrlRef = useRef<string | null>(null);
  
  // Check if error is "NoPostsMadeYet" to determine array size
  const isNoPostsError = error && (error.name === "NoPostsMadeYet" || error.message.includes("No posts found"));
  let emptyArray = Array(isNoPostsError ? 1 : 6).fill(-1); // 1 element for no posts, 6 for loading

  const handlePostPreview = (postIndex: number) => {
    if (posts?.posts?.[postIndex]) {
      const post = posts.posts[postIndex];
      if (prevUrlRef.current === null) {
        prevUrlRef.current = window.location.pathname + window.location.search + window.location.hash;
      }
      // push new state with post id, does not trigger react-router navigation directly
      window.history.pushState({ modalPostId: post.id }, '', `/post/${post.id}`);
      setSelectedPost(post);
    }
  };

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      // If modal open and state has no modalPostId, close it (user went back)
      if (selectedPost && (!e.state || !e.state.modalPostId)) {
        setSelectedPost(null);
        prevUrlRef.current = null;
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [selectedPost]);

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost]);

  const closeModal = () => {
    setSelectedPost(null);
    if (prevUrlRef.current) {
      window.history.replaceState({}, '', prevUrlRef.current);
      prevUrlRef.current = null;
    }
  };

  const renderContent = (postID: number) => {
    const currentPostIndex = postID;
    if (error) {
      // Check if the error is specifically about no posts being made yet
      if (error.name === "NoPostsMadeYet" || error.message.includes("No posts found")) {
        // Check if we're viewing a user profile and if it's the current user's profile
        const isViewingProfile = !!userId;
        const isOwnProfile = isViewingProfile && userId === id;
        
        if (isViewingProfile && isOwnProfile) {
          // Viewing own profile with no posts
          return (
            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-800 w-[350px] h-[350px] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white p-6 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">Your gallery is empty!</h3>
              <p className="text-sm opacity-90 mb-4">You haven't shared any artwork yet. It's time to show your creativity to the world!</p>
              <button 
                onClick={() => window.location.href = '/draw'}
                className="bg-white cursor-pointer text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Create my first artwork ✨
              </button>
            </div>
          );
        } else if (isViewingProfile && !isOwnProfile) {
          // Viewing someone else's profile with no posts
          return (
            <div className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 w-[350px] h-[350px] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white p-6 text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-bold mb-2">Empty gallery</h3>
              <p className="text-sm opacity-90 mb-4">This user hasn't shared any artwork yet.</p>
              <div className="text-xs opacity-70">
                Be the first to inspire them to create!
              </div>
            </div>
          );
        } else {
          // General feed with no posts
          return (
            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-800 w-[350px] h-[350px] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white p-6 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">Ready to Create?</h3>
              <p className="text-sm opacity-90 mb-4">No posts yet! Be the first to share your amazing artwork with the community.</p>
              <button 
                onClick={() => window.location.href = '/draw'}
                className="bg-white cursor-pointer text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Start Drawing ✨
              </button>
            </div>
          );
        }
      }
      
      // Default error display for other errors
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[350px] h-[350px] flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          {error instanceof Error ? error.message : "An error occurred while loading posts"}
        </div>
      );
    }
    if (loading  || !posts?.posts?.length) {
      return (
        <div className="cursor-progress w-[350px] h-[350px] flex items-center justify-center">
          <svg aria-hidden="true" className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    

    const currentPost = posts.posts[currentPostIndex];
    if (!currentPost) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[350px] h-[350px] flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          Post not found
        </div>
      );
    } else {
      return (
        <img
          src={currentPost.url_bucket}
          alt="Post Image"
          width={300}
          height={300}
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
    <div className="py-4">
      {/* Post Preview Modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={closeModal} />}

      {/* Masonry Grid */}
      <div className="flex justify-center">
        <div className="flex flex-wrap mt-7 w-[90%] justify-center">
          {!loading && !error && posts?.posts?.length ?
            posts.posts.map((_, index) => (
              <div
                onClick={() => handlePostPreview(index)}
                key={index}
                className="bg-gray-800 overflow-hidden hover:shadow-xl duration-300 w-[350px] cursor-pointer"
              >
                <div className="bg-gradient-to-br from-gray-900 to-black w-[350px] h-[350px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
                  {renderContent(index)}
                </div>
              </div>
            )) : (
              emptyArray.map((_, index) => (
                <div key={index} className="bg-gray-800 hover:shadow-xl duration-300">
                  <div className="bg-gradient-to-br from-gray-900 to-black w-[350px] h-[350px] flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
                    {renderContent(index)}
                  </div>
                </div>
              ))
            )}
          <div ref={sentinelRef} ></div>
        </div>
      </div>
      {!loading && isLoadingMore && (
        <div className="flex items-center gap-2 text-gray-400 text-xl justify-center mt-4">
          <svg aria-hidden="true" className="w-6 h-6 animate-spin text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none">
            <path d="M100 50.59c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50ZM9.08 50.59c0 22.598 18.32 40.919 40.92 40.919 22.598 0 40.919-18.321 40.919-40.919C90.919 27.992 72.598 9.672 50 9.672 27.401 9.672 9.081 27.992 9.081 50.59Z" fill="currentColor"/>
            <path d="M93.968 39.04c2.425-.637 3.895-3.129 3.04-5.486-1.715-4.731-4.137-9.185-7.191-13.206-3.972-5.229-8.934-9.624-14.605-12.935C69.541 4.101 63.275 1.94 56.77 1.051 51.767.368 46.698.447 41.734 1.279c-2.473.415-3.922 2.919-3.285 5.344.637 2.426 3.119 3.849 5.6 3.485 3.801-.559 7.669-.58 11.49-.057 5.324.727 10.453 2.496 15.093 5.205 4.64 2.71 8.701 6.307 11.951 10.586 2.332 3.071 4.214 6.45 5.595 10.035.902 2.34 3.361 3.803 5.787 3.165Z" fill="currentFill"/>
          </svg>
          <span>Loading more...</span>
        </div>
      )}
      
    </div>
  );



}

