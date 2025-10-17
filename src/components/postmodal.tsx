import { PostResponse } from "../types/requests";
import { useComments } from "../hooks/comments";
import { useRatings } from "../hooks/ratings";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Eye, EyeOff, HeartCrack, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useInfiniteScroll from "../hooks/infinetescroll";
import { CommentWithThreads } from "./CommentWithThreads";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useAuthStore } from "../store/useAuthStore";
// Import all themes
import { 
  dracula,
  vscDarkPlus,
  oneDark,
  atomDark,
  tomorrow,
  okaidia,
  darcula,
  materialDark,
  nord,
  nightOwl,
  coldarkDark,
  duotoneDark,
  solarizedDarkAtom
} from 'react-syntax-highlighter/dist/esm/styles/prism';

// Available themes
const themes = {
  dracula,
  vscDarkPlus,
  oneDark,
  atomDark,
  tomorrow,
  okaidia,
  darcula,
  materialDark,
  nord,
  nightOwl,
  coldarkDark,
  duotoneDark,
  solarizedDarkAtom
};

export const PostModal = (
  { post, onClose, darkenScreen = true }: { post: PostResponse; onClose: () => void; darkenScreen?: boolean }
) => {
  if (!post) return null;
  const editorTheme = useAuthStore((state) => state.editorTheme);
  const { comments, loading, error, addComment, loadMore , isLoadingMore } = useComments(post.id);
  const { liked, disliked, toggleLike, toggleDislike } = useRatings(post.id, post.ratingValue);
  const [likePop, setLikePop] = useState(false);
  const [dislikePop, setDislikePop] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string>('');
  const shareRef = useRef<HTMLDivElement | null>(null); // added
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => { // added
    const handler = (e: MouseEvent) => {
      if (showShareMenu && shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShareMenu]);

  const handleCopy = (text: string, label: string) => { // added
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(label + ' copied');
      setTimeout(() => setCopyMsg(''), 1500);
      setShowShareMenu(false);
    });
  };
  const triggerLikePop = () => {
    setLikePop(true);
    setTimeout(() => setLikePop(false), 300);
  };
  const triggerDislikePop = () => {
    setDislikePop(true);
    setTimeout(() => setDislikePop(false), 300);
  };
  const handleToggleDislike = async () => {
    triggerDislikePop();
    
    try {
      await toggleDislike();
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
    }
  };

  const handleToggleLike = async () => {
    triggerLikePop();
    
    try {
      await toggleLike();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleImageDoubleClick = async () => {
    try {
      // Force like on double click
      if (!liked) {
        await toggleLike();
      }
      triggerLikePop();
    } catch (error) {
      console.error("Failed to like on double click:", error);
    }
  };
  const sentinelRef = useInfiniteScroll({
    loadMore,
    isLoading: isLoadingMore || loading,
    rootMargin: '200px',
  });
  const CommentSkeleton = () => (
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-start space-x-3 animate-pulse">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-600 rounded w-1/4"></div>
            <div className="h-3 bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  return (
    <div className={`fixed ${darkenScreen ? 'inset-0 !bg-black/70' : ''} flex items-center justify-center z-50 p-0 md:p-4 bg-gray-900`} onClick={onClose}>
      <div
        className="bg-gray-800 overflow-hidden flex flex-col md:flex-row max-w-4xl w-full max-h-[100vh] md:max-h-[90vh] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 md:hidden bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div onDoubleClick={handleImageDoubleClick} className="bg-gradient-to-br from-gray-900 to-black w-full md:w-[512px] h-[300px] md:h-[512px] flex items-center justify-center relative overflow-hidden border-2 border-gray-700 flex-shrink-0">
          {eyeOpen ?
          <img
            src={post.url_bucket}
            className="[image-rendering:pixelated] w-full h-full object-cover"
            alt="Post Image"
            draggable={false} 
          /> :
          <div className="w-full h-full bg-gray-900 flex justify-left overflow-y-auto">
            <SyntaxHighlighter 
              language="lua" 
              style={themes[editorTheme as keyof typeof themes] || themes.dracula}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: '!transparent',
                fontSize: '0.875rem',
                width: '100%',
              }}
              className="*:!bg-transparent text-xl wrap-anywhere"
            >
              {post.content || ''}
            </SyntaxHighlighter>
          </div>
          }
          
          {disliked && dislikePop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <HeartCrack className="w-40 h-40 text-blue-400 opacity-80 animate-ping" fill="currentColor" />
            </div>
          )}
          {liked && likePop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart
                className="w-40 h-40 text-red-500 opacity-80 animate-ping"
                fill="currentColor"
              />
              
            </div>
          )}
        </div>

        {/* Comments & Description Section */}
        <div className="flex flex-col w-full md:w-[512px] min-h-0 flex-1 md:flex-initial md:h-[512px]">
          <div className="p-4 text-white ">
            <div className="flex items-center space-x-3 mb-1">
              {/* User Avatar - Replace with actual user image if available */}
              {post.user?.urlPfp ? (
                <img
                  src={`${post.user.urlPfp}`}
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
            {loading && <CommentSkeleton />}
            {error && !loading && (
              <div className="text-red-400 text-sm">Failed to load comments</div>
            )}
            {!loading && !error && comments && comments.comments.length === 0 && (
              <div className="text-gray-500 text-sm flex-1 flex items-center justify-center md:block md:flex-none">No comments yet. Be the first!</div>
            )}
            {!loading && comments && comments.comments.length > 0 && (
              <ul className="space-y-3">
                {comments.comments.map(c => (
                  <CommentWithThreads 
                    key={c.id}
                    comment={c}
                    onReply={handleReply}
                    replyingTo={replyingTo}
                  />
                ))}
                <div ref={sentinelRef}></div>
                {!loading && isLoadingMore && (
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <svg aria-hidden="true" className="w-4 h-4 animate-spin text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none">
                      <path d="M100 50.59c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50ZM9.08 50.59c0 22.598 18.32 40.919 40.92 40.919 22.598 0 40.919-18.321 40.919-40.919C90.919 27.992 72.598 9.672 50 9.672 27.401 9.672 9.081 27.992 9.081 50.59Z" fill="currentColor"/>
                      <path d="M93.968 39.04c2.425-.637 3.895-3.129 3.04-5.486-1.715-4.731-4.137-9.185-7.191-13.206-3.972-5.229-8.934-9.624-14.605-12.935C69.541 4.101 63.275 1.94 56.77 1.051 51.767.368 46.698.447 41.734 1.279c-2.473.415-3.922 2.919-3.285 5.344.637 2.426 3.119 3.849 5.6 3.485 3.801-.559 7.669-.58 11.49-.057 5.324.727 10.453 2.496 15.093 5.205 4.64 2.71 8.701 6.307 11.951 10.586 2.332 3.071 4.214 6.45 5.595 10.035.902 2.34 3.361 3.803 5.787 3.165Z" fill="currentFill"/>
                    </svg>
                    <span>Loading more...</span>
                  </div>
                )}
              </ul>
            )}
          </div>

          {/* Comment Input */}
          <div className="px-4 py-2 border-t border-gray-700">
            <div className="flex gap-3 mb-3 relative"> {/* made relative for popover */}
              <button
                type="button"
                onClick={handleToggleLike}
                className={`p-2 rounded transition-colors ${
                  liked ? 'text-red-500' : 'text-white hover:text-gray-400'
                }`}
                aria-pressed={liked}
                aria-label="Like"
              >
                <Heart
                  className={`w-6 h-6 transition-transform duration-200 ease-out ${likePop ? 'scale-125' : 'scale-100'
                    }`}
                  fill={liked ? 'currentColor' : 'none'}
                  color="white"
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                onClick={handleToggleDislike}
                className={`p-2 rounded transition-colors ${
                  disliked ? 'text-blue-400' : 'text-white hover:text-gray-400'
                }`}
                aria-pressed={disliked}
                aria-label="Dislike"
              >
                <HeartCrack
                  className={`w-6 h-6 transition-transform duration-200 ease-out ${dislikePop ? 'scale-125' : 'scale-100'}`}
                  fill={disliked ? 'currentColor' : 'none'}
                  color="white"
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
                className={`p-2 rounded transition-colors text-white hover:text-gray-400`}
                aria-label={eyeOpen ? "Disable view" : "Enable view"}
                aria-pressed={!eyeOpen}
                onClick={() => setEyeOpen(o => !o)}
              >

                  {eyeOpen ? (
                    <Eye className="w-6 h-6" strokeWidth={2} />
                  ) : (
                    <EyeOff className="w-6 h-6" strokeWidth={2} />
                  )}
                  
              </button>
              <div ref={shareRef} className="relative"> {/* added wrapper */}
                <button
                  type="button"
                  className="p-2 rounded  text-white hover:text-gray-400 transition-colors"
                  aria-label="Share"
                  onClick={() => setShowShareMenu(o => !o)}
                >
                  <Share2 className="w-6 h-6" strokeWidth={2} />
                </button>
                
                {(showShareMenu || copyMsg) && (
                  <div
                    className="absolute left-full bottom-full ml-2 w-40 bg-gray-800 border border-gray-600 rounded shadow-lg z-20 text-xs"
                  >
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-700"
                      onClick={() =>
                        handleCopy(
                          `${window.location.origin}/post/${post.id}`,
                          'Link'
                        )
                      }
                    >
                      Copy link
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-700"
                      onClick={() =>
                        handleCopy(post.content || '', 'Post code')
                      }
                    >
                      Copy post code
                    </button>
                    {copyMsg && (
                      <div className="px-3 py-2 text-green-400 border-t border-gray-700">
                        {copyMsg}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
