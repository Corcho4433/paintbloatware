import { useState } from "react";
import { Comment } from "../types/requests";
import { useCommentThreads } from "../hooks/commentThreads";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp, Square } from "lucide-react";
import useInfiniteScroll from "../hooks/infinetescroll";

// Helper function to format relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60 || isNaN(diffInSeconds)) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

interface CommentWithThreadsProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  replyingTo: string | null;
}

export const CommentWithThreads = ({ comment, onReply, replyingTo }: CommentWithThreadsProps) => {
  // TODO: Implementar funcionalidad de likes para comentarios en el backend
  // const [commentLiked, setCommentLiked] = useState(false);
  // const [commentLikeCount, setCommentLikeCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    threads,
    totalCount,
    loading,
    isLoadingMore,
    hasLoaded,
    loadMore,
    addThread,
    initializeThreads,
  } = useCommentThreads(comment.id);

  const threadsSentinelRef = useInfiniteScroll({
    loadMore,
    isLoading: isLoadingMore || loading,
    rootMargin: '100px',
  });

  const handleToggleExpand = async () => {
    if (!expanded && !hasLoaded) {
      await initializeThreads();
    }
    setExpanded(!expanded);
  };

  // TODO: Implementar funcionalidad de likes para comentarios en el backend
  // const handleCommentLike = () => {
  //   setCommentLiked(!commentLiked);
  //   setCommentLikeCount(commentLiked ? commentLikeCount - 1 : commentLikeCount + 1);
  // };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addThread(replyText.trim());
      setReplyText("");
      if (!expanded) {
        setExpanded(true);
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const threadCount = totalCount || comment._count?.CommentThread || 0;

  return (
    <div className="space-y-1 overflow-hidden">
      <div className="flex items-start space-x-3 mb-2">
        {comment.user?.urlPfp ? (
          <img
            src={comment.user.urlPfp}
            alt="User"
            className="w-8 h-8 rounded-full border-1 border-white flex-shrink-0"
          />
        ) : (
          <img
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${comment.user?.name || 'User'}`}
            alt="User"
            className="w-8 h-8 rounded-full border-1 border-white flex-shrink-0"
          />
        )}
        <div className='flex-1 min-w-0'>
          <div className="flex items-start gap-1">
            <h3 className="text-sm font-medium">
              <Link to={"/user/" + comment.user?.id}>{comment.user?.name || 'Unknown User'}</Link>
            </h3>
            <span className="text-xs text-gray-500">· {getRelativeTime(comment.created_at)}</span>
          </div>
          <div className="text-sm wrap-anywhere">{comment.content}</div>
          <div className="flex items-center gap-3 mt-1">
            {/* TODO: Implementar funcionalidad de likes para comentarios en el backend */}
            {/* <button
              onClick={handleCommentLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                commentLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart 
                className="w-3 h-3" 
                fill={commentLiked ? 'currentColor' : 'none'}
              />
              {commentLikeCount || 0}
            </button> */}
            <button
              onClick={() => onReply(comment.id)}
              className={`text-xs transition-colors ${
                replyingTo === comment.id ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              Reply
            </button>
            {threadCount > 0 && (
              <button
                onClick={handleToggleExpand}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Hide {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    View {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Reply Input (shown when replying to this comment) */}
          {replyingTo === comment.id && (
            <div className="mt-2 flex items-center">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (replyText.trim()) {
                      setIsSubmitting(true);
                      await handleSubmitReply();
                      setIsSubmitting(false);
                    }
                  }
                }}
                placeholder="Write a reply..."
                className={`flex-1 bg-gray-900 border ${isSubmitting ? 'border-gray-700 !text-gray-400' : 'border-gray-600'} rounded-md text-white p-2 focus:outline-none`}
                autoFocus
                disabled={isSubmitting}
              />
              <button
                onClick={async () => {
                  if (replyText.trim()) {
                    setIsSubmitting(true);
                    await handleSubmitReply();
                    setIsSubmitting(false);
                  }
                }}
                disabled={!replyText.trim() || isSubmitting}
                className="bg-gray-900 cursor-pointer rounded-md border border-gray-700 aspect-square text-white p-2.5 hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Square className="w-5 h-5 animate-pulse"></Square>
                ) : (
                  <ArrowRight className="w-5 h-5"></ArrowRight>
                )}
              </button>
            </div>
          )}

          {/* Threads (Replies) */}
          {expanded && (
            <div className="mt-3 pl-4 border-l-2 border-gray-600 space-y-2">
              {loading && !threads.length && (
                <div className="text-xs text-gray-400">Loading replies...</div>
              )}
              {threads.map((thread) => (
                <div key={thread.id} className="flex items-start space-x-2">
                  {thread.user?.urlPfp ? (
                    <img
                      src={thread.user.urlPfp}
                      alt="User"
                      className="w-6 h-6 rounded-full border-1 border-white flex-shrink-0"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${thread.user?.name || 'User'}`}
                      alt="User"
                      className="w-6 h-6 rounded-full border-1 border-white flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1">
                      <h3 className="text-xs font-medium">
                        <Link to={"/user/" + thread.user?.id}>{thread.user?.name || 'Unknown User'}</Link>
                      </h3>
                      <span className="text-xs text-gray-500">· {getRelativeTime(thread.created_at)}</span>
                    </div>
                    <div className="text-xs wrap-anywhere text-gray-300">{thread.content}</div>
                  </div>
                </div>
              ))}
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <svg aria-hidden="true" className="w-3 h-3 animate-spin text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none">
                    <path d="M100 50.59c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50ZM9.08 50.59c0 22.598 18.32 40.919 40.92 40.919 22.598 0 40.919-18.321 40.919-40.919C90.919 27.992 72.598 9.672 50 9.672 27.401 9.672 9.081 27.992 9.081 50.59Z" fill="currentColor"/>
                    <path d="M93.968 39.04c2.425-.637 3.895-3.129 3.04-5.486-1.715-4.731-4.137-9.185-7.191-13.206-3.972-5.229-8.934-9.624-14.605-12.935C69.541 4.101 63.275 1.94 56.77 1.051 51.767.368 46.698.447 41.734 1.279c-2.473.415-3.922 2.919-3.285 5.344.637 2.426 3.119 3.849 5.6 3.485 3.801-.559 7.669-.58 11.49-.057 5.324.727 10.453 2.496 15.093 5.205 4.64 2.71 8.701 6.307 11.951 10.586 2.332 3.071 4.214 6.45 5.595 10.035.902 2.34 3.361 3.803 5.787 3.165Z" fill="currentFill"/>
                  </svg>
                  <span>Loading more...</span>
                </div>
              )}
              <div ref={threadsSentinelRef}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
