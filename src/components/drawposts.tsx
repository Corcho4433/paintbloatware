import { PostPage } from "../types/requests";
import { useState, useEffect } from 'react';
import { usePosts } from '../hooks/posts';
import useInfiniteScroll from '../hooks/infinetescroll';
import { PostResponse } from '../types/requests';
import { Link } from 'react-router-dom';

type UsePostsResult = {
  posts: PostPage | null;
  loading: boolean;
  error: Error | null;
  loadMore: () => void;
  isLoadingMore: boolean;
};

interface UsePostsOptions {
  initialPage?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  userId?: string; 
}

export const drawPosts = (options : UsePostsOptions, userId : string | undefined = "") => {
    const { posts, loading, error, loadMore, isLoadingMore } = usePosts({ userId: userId });
    const sentinelRef = useInfiniteScroll({
    loadMore,
    isLoading: isLoadingMore
  });

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const emptyArray = Array(6).fill(-1);

  const handlePostPreview = (postIndex: number) => {
    if (posts?.posts?.[postIndex]) {
      setSelectedPost(posts.posts[postIndex]);
    }
  };

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
  };

  const renderContent = (postID: number) => {
    const currentPostIndex = postID;
    if (loading) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700">
          <div className="w-full h-full flex items-center justify-center text-white">
            Loading...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          {error instanceof Error ? error.message : "An error occurred while loading posts"}
        </div>
      );
    }

    if (currentPostIndex === null || !posts?.posts?.length) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white">
          Loading post...
        </div>
      );
    }

    const currentPost = posts.posts[currentPostIndex];
    if (!currentPost) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
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
    <div className="py-4">
      {/* Post Preview Modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={closeModal} />}

      {/* Masonry Grid */}
      <div className="flex flex-wrap justify-evenly  w-full overflow-x-hidden mt-7">
        {!loading && !error && posts?.posts?.length ? 
          posts.posts.map((_, index) => (
            <div
              onClick={() => handlePostPreview(index)}
              key={index}
              className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl duration-300 w-[512px] cursor-pointer"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
                {renderContent(index)}
              </div>
            </div>
          )) : (
            emptyArray.map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-xl hover:shadow-xl duration-300">
                <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
                  {renderContent(index)}
                </div>
              </div>
            ))
          )}
      </div>
      <div ref={sentinelRef}></div>
    </div>
  );



}
// Modal component for post preview
const PostModal = ({ post, onClose }: { post: PostResponse; onClose: () => void }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black md:w-[512px] w-full h-[512px] rounded-t-xl md:rounded-l-xl md:rounded-tr-none flex items-center justify-center relative overflow-hidden border-2 border-gray-700">
          <img
            src={post.url_bucket}
            alt="Post Image"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Comments & Description Section */}
        <div className="flex flex-col w-full md:max-w-md h-[512px]">
          <div className="p-4 text-white ">
            <div className="flex items-center space-x-3 mb-3">
              {/* User Avatar - Replace with actual user image if available */}
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {post.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <h3 className="font-bold text-lg">{post.user?.name || 'Unknown User'}</h3>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-500 flex-1 overflow-y-auto">
            <div className="space-y-1 overflow-hidden">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-gray-700 text-white rounded-l-md p-2 focus:outline-none"
              />
              <button className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition-colors">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
