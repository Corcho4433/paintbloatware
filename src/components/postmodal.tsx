import { PostResponse } from "../types/requests";
import { useComments } from "../hooks/comments";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import useInfiniteScroll from "../hooks/infinetescroll";
export const PostModal = ({ post, onClose }: { post: PostResponse; onClose: () => void }) => {
  if (!post) return null;
  const { comments, loading, error, addComment, loadMore , isLoadingMore } = useComments(post.id);
  const [liked, setLiked] = useState(false); // added
  const [likePop, setLikePop] = useState(false);
  const sentinelRef = useInfiniteScroll({
    loadMore,
    isLoading: isLoadingMore || loading,
    rootMargin: '200px',
  });
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-800 overflow-hidden flex flex-col md:flex-row max-w-4xl w-full max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black md:w-[512px] w-full h-[512px]  flex items-center justify-center relative overflow-hidden border-2 border-gray-700">
          <img
            src={post.url_bucket}
            alt="Post Image"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Comments & Description Section */}
        <div className="flex flex-col w-full md:max-w-md h-[512px]">
          <div className="p-4 text-white ">
            <div className="flex items-center space-x-3 mb-1">
              {/* User Avatar - Replace with actual user image if available */}
              {post.user?.userPfp ? (
                <img
                  src={`${post.user.userPfp}`}
                  alt="User"
                  className="w-12 h-12 rounded-full border-1 border-white"
                />) : (
                <img
                  src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${post.user?.name || 'User'}`}
                  alt="User"
                  className="w-12 h-12 rounded-full border-1 border-white"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg"><Link className='!text-white hover:!underline' to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link> </h3>
                <p className="text-gray-400 text-sm">{post.description}</p>
              </div>
              <p className="text-gray-400 text-sm ml-auto">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {/* Comments List */}
          <div className="px-4 py-4 border-t border-gray-500 flex-1 overflow-y-auto">
            {loading && (
              <div className="text-gray-400 text-sm">Loading comments...</div>
            )}
            {error && !loading && (
              <div className="text-red-400 text-sm">Failed to load comments</div>
            )}
            {!loading && !error && comments && comments.comments.length === 0 && (
              <div className="text-gray-500 text-sm">No comments yet. Be the first!</div>
            )}
            {!loading && comments && comments.comments.length > 0 && (
              <ul className="space-y-3">
                {comments.comments.map(c => (
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-start space-x-3 mb-3">
                      {c.user?.userPfp ? (
                        <img
                          src={`${c.user.userPfp}`}
                          alt="User"
                          className="w-12 h-12 rounded-full border-1 border-white"
                        />) : (
                        <img
                          src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${c.user?.name || 'User'}`}
                          alt="User"
                          className="w-8 h-8 rounded-full border-1 border-white"
                        />
                      )}
                      <div className=''>
                        <h3 className="inline-flex text-sm"> <Link to={"/user/" + c.user?.id}>{c.user?.name || 'Unknown User'}</Link></h3>
                        <div className="inline text-sm ml-1 wrap-anywhere">{c.content}</div>
                      </div>
                    </div>
                    <div ref={sentinelRef}></div>
                    
                  </div>
                  

                ))}
                
              </ul>
            )}
          </div>

          {/* Comment Input */}
          <div className="px-4 py-2 border-t border-gray-700">
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => {
                  setLiked(l => !l);
                  setLikePop(true);
                  setTimeout(() => setLikePop(false), 220); // pop duration
                }}
                className={`p-2 rounded transition-colors ${liked ? 'text-red-500' : 'text-white hover:text-gray-400'
                  }`}
                aria-pressed={liked}
                aria-label="Like"
              >
                <Heart
                  className={`w-6 h-6 transition-transform duration-200 ease-out ${likePop ? 'scale-125' : 'scale-100'
                    }`}
                  fill={liked ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('comment-input');
                  el?.focus();
                }}
                className="p-2 rounded  text-white hover:text-gray-400  transition-colors"
                aria-label="Comment"
              >
                <MessageCircle className="w-6 h-6" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="p-2 rounded  text-white hover:text-gray-400 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-gray-700 text-white p-2 focus:outline-none"
                id="comment-input"
                autoComplete="off"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('comment-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    await addComment(input.value.trim());
                    input.value = '';
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 ml-2 hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
