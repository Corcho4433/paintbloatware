import { useState, useEffect } from 'react';
import { usePosts } from '../hooks/posts';
import useInfiniteScroll from '../hooks/infinetescroll';
import { PostResponse } from '../types/requests';
import { Link } from 'react-router-dom';



export const drawPosts = (userId: string | undefined = "") => {
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
    if (loading || currentPostIndex === null || !posts?.posts?.length) {
      return (
        <div className="cursor-progress w-[512px] h-[512px] flex items-center justify-center">
          <svg aria-hidden="true" className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Loading...</span>
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
      <div className="flex flex-wrap gap-8 justify-center w-full overflow-x-hidden mt-7">
        {!loading && !error && posts?.posts?.length ?
          posts.posts.map((_, index) => (
            <div
              onClick={() => handlePostPreview(index)}
              key={index}
              className="bg-gray-800 overflow-hidden hover:shadow-xl duration-300 w-[512px] cursor-pointer"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
                {renderContent(index)}
              </div>
            </div>
          )) : (
            emptyArray.map((_, index) => (
              <div key={index} className="bg-gray-800 hover:shadow-xl duration-300">
                <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
                  {renderContent(index)}
                </div>
              </div>
            ))
          )}
      </div>
      <div ref={sentinelRef} ></div>
      <div className="flex items-center justify-center py-6  mt-5 border-t border-gray-700">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 mr-3"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="text-gray-400 text-lg">Loading more...</span>
      </div>
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
