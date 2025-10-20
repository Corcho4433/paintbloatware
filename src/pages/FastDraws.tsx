import {
  Button,
} from "flowbite-react";
import { useSearchParams, Link } from "react-router-dom";
import {
  MessageCircle,
  Send,

  Eye,
  EyeOff,
  X,

} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import PaintSidebar from "../components/paintsidebar";
import { usePosts, usePostById } from "../hooks/posts";
import { useAuthStore } from "../store/useAuthStore";
import { useComments } from "../hooks/comments";
import { CommentWithThreads } from "../components/CommentWithThreads";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import useInfiniteScroll from "../hooks/infinetescroll";
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
import { LikeButtons } from "../components/likeButtons";

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

const animations = {
  in: "animate-slide-in",
  out: "animate-slide-out",
};

const FastDraws = () => {
  const { posts, loading, error, loadMore, isLoadingMore, setPosts } = usePosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPostIndex, setCurrentPostIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const editorTheme = useAuthStore((state) => state.editorTheme);

  // UI States
  const [showComments, setShowComments] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);

  // Get postId from URL params
  const postId = searchParams.get('postId');
  const { post, loading: postLoading, error: postError } = usePostById(postId);

  // Get current post
  const currentPost = currentPostIndex !== null && posts?.posts?.length
    ? posts.posts[currentPostIndex]
    : null;

  // Comments and ratings for current post
  const { comments, loading: commentsLoading, error: commentsError, addComment, loadMore: loadMoreComments, isLoadingMore: isLoadingMoreComments } = useComments(currentPost?.id || '');
  console.log(post)
  const sentinelRef = useInfiniteScroll({
    loadMore: loadMoreComments,
    isLoading: isLoadingMoreComments || commentsLoading,
    rootMargin: '200px',
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        handleReactionClick();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPostIndex, posts, isAnimating]);

  // Close share menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showShareMenu && shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShareMenu]);

  const handleCopy = (text: string, label: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(label + ' copied');
      setTimeout(() => setCopyMsg(''), 1500);
      setShowShareMenu(false);
    });
  };





  // Effect to handle URL postId - prioritize fetched post from URL
  useEffect(() => {
    if (postId && post && !postLoading && !postError) {
      const existingIndex = posts?.posts?.findIndex(p => p.id === postId);

      if (existingIndex !== undefined && existingIndex >= 0) {
        setCurrentPostIndex(existingIndex);
      } else if (posts?.posts && !posts.posts.some(p => p.id === postId)) {
        setPosts(prev => ({
          ...prev!,
          posts: [post, ...prev!.posts],
        }));
        setCurrentPostIndex(0);
      } else if (!posts?.posts) {
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
      setCurrentPostIndex(0);
      setSearchParams({ postId: posts.posts[0].id });
    }
  }, [postId, loading, posts, currentPostIndex, setSearchParams]);

  const handleReactionClick = async () => {
    if (isAnimating || !posts?.posts?.length || currentPostIndex === null) return;

    const currentPost = posts.posts[currentPostIndex];
    if (!currentPost) return;

    // Trigger animation based on value
    setIsAnimating(true);



    setTimeout(() => {
      const isLastPost = currentPostIndex === posts.posts.length - 2;
      if (isLastPost) {
        if (!isLoadingMore) {
          loadMore();
        }
      }

      setCurrentPostIndex((prev) =>
        prev !== null ? (prev + 1) : 0
      );
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    if (isAnimating) {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => button.blur());
    }
  }, [isAnimating]);

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  let photoIcon =
    "ease-in-out group-hover:scale-116  group-focus:scale-116 group-hover:opacity-100 transition-all duration-600";

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

  const renderContent = () => {
    if (postId && postLoading) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700">
          <div className="w-full h-full flex items-center justify-center text-white">
            Loading post...
          </div>
        </div>
      );
    }

    if (postId && postError) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          Failed to load post: {postError.message}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700">
          <div className="w-full h-full flex items-center justify-center text-white">
            Loading...
          </div>
        </div>
      );
    }

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
      if (eyeOpen) {
        return (
          <>
            <img
              src={currentPost.url_bucket}
              alt="Post Image"
              width={512}
              height={512}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                imageRendering: 'pixelated',
              }}
            />

          </>
        );
      } else {
        return (
          <div className="w-full h-full bg-gray-900 flex justify-left overflow-y-auto">
            <SyntaxHighlighter
              language="lua"
              style={themes[editorTheme as keyof typeof themes] || themes.dracula}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.875rem',
                width: '100%',
              }}
              className="*:!bg-transparent text-xl wrap-anywhere"
            >
              {currentPost.content || ''}
            </SyntaxHighlighter>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex overflow-y-hidden">
      <PaintSidebar />

      <section className="flex-1 ml-0 min-h-screen w-full h-full bg-gray-900 flex items-center justify-center px-6 flex-col space-y-4">
        <div className="flex relative gap-4">
          <div className={`flex flex-col ${animations[isAnimating ? 'out' : 'in']}`}>
            <section className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px]  flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
              <div className="w-full h-full">
                {renderContent()}
              </div>
            </section>

            <div className="flex w-[30%] mt-3 gap-2 bg-gray-700  rounded-xl justify-center mx-auto">
              <LikeButtons
                postId={currentPost?.id || ''}
                ratingValue={currentPost?.ratingValue || 0}
                onReactionClick={handleReactionClick}
                isAnimating={isAnimating}
                photoIcon={photoIcon}
              />
            </div>
          </div>

          <section className="absolute right-[0px] translate-x-3/2 translate-y-2/4 h-[200px] justify-around flex flex-col bg-gray-800 p-2 rounded-xl">
            <Button
              onClick={() => setShowComments(!showComments)}
              className="focus:!border-white hover:!border-white cursor-pointer group focus:outline-none focus:ring-0 !bg-black !border-2 border-gray-500 aspect-square !p-0 h-12"
            >
              <MessageCircle className={photoIcon} />
            </Button>
            {!showComments && (
              <>
                <div ref={shareRef} className="relative">
                  <Button
                    onClick={() => setShowShareMenu(o => !o)}
                    className="cursor-pointer group focus:outline-none border-gray-500  !bg-black !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12"
                  >
                    <Send color={"white"} className={photoIcon} />
                  </Button>
                  {(showShareMenu || copyMsg) && currentPost && (
                    <div className="absolute left-full bottom-0 ml-2 w-40 bg-gray-800 border border-gray-600 rounded shadow-lg z-20 text-xs text-white">
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-700"
                        onClick={() =>
                          handleCopy(
                            `${window.location.origin}/post/${currentPost.id}`,
                            'Link'
                          )
                        }
                      >
                        Copy link
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-700"
                        onClick={() =>
                          handleCopy(currentPost.content || '', 'Post code')
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
                <Button
                  onClick={() => setEyeOpen(o => !o)}
                  className="cursor-pointer border-gray-500 group focus:outline-none !bg-black !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12"
                >
                  {eyeOpen ? (
                    <Eye className={photoIcon} />
                  ) : (
                    <EyeOff className={photoIcon} />
                  )}
                </Button>
              </>
            )}

          </section>

          {/* Comments Panel */}
          {showComments && currentPost && (
            <div className="absolute left-full ml-4 w-[400px] h-[512px] bg-gray-800 border-2 border-gray-700 rounded-lg flex flex-col">
              {/* User info and description header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  {currentPost.user?.urlPfp ? (
                    <img
                      src={currentPost.user.urlPfp}
                      alt="User"
                      className="w-10 h-10 rounded-full border border-white"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${currentPost.user?.name || 'User'}`}
                      alt="User"
                      className="w-10 h-10 rounded-full border border-white"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">
                      <Link className='!text-white hover:!underline' to={"/user/" + currentPost.user?.id}>
                        {currentPost.user?.name || 'Unknown User'}
                      </Link>
                    </h3>
                    {currentPost.description && (
                      <p className="text-gray-400 text-sm">{currentPost.description}</p>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">{new Date(currentPost.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Comments title */}
              <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-white font-bold">Comments</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {commentsLoading && <CommentSkeleton />}
                {commentsError && !commentsLoading && (
                  <div className="text-red-400 text-sm">Failed to load comments</div>
                )}
                {!commentsLoading && !commentsError && comments && comments.comments.length === 0 && (
                  <div className="text-gray-500 text-sm flex items-center justify-center h-full">
                    No comments yet. Be the first!
                  </div>
                )}
                {!commentsLoading && comments && comments.comments.length > 0 && (
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
                    {!commentsLoading && isLoadingMoreComments && (
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <svg aria-hidden="true" className="w-4 h-4 animate-spin text-gray-600 fill-blue-500" viewBox="0 0 100 101" fill="none">
                          <path d="M100 50.59c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50ZM9.08 50.59c0 22.598 18.32 40.919 40.92 40.919 22.598 0 40.919-18.321 40.919-40.919C90.919 27.992 72.598 9.672 50 9.672 27.401 9.672 9.081 27.992 9.081 50.59Z" fill="currentColor" />
                          <path d="M93.968 39.04c2.425-.637 3.895-3.129 3.04-5.486-1.715-4.731-4.137-9.185-7.191-13.206-3.972-5.229-8.934-9.624-14.605-12.935C69.541 4.101 63.275 1.94 56.77 1.051 51.767.368 46.698.447 41.734 1.279c-2.473.415-3.922 2.919-3.285 5.344.637 2.426 3.119 3.849 5.6 3.485 3.801-.559 7.669-.58 11.49-.057 5.324.727 10.453 2.496 15.093 5.205 4.64 2.71 8.701 6.307 11.951 10.586 2.332 3.071 4.214 6.45 5.595 10.035.902 2.34 3.361 3.803 5.787 3.165Z" fill="currentFill" />
                        </svg>
                        <span>Loading more...</span>
                      </div>
                    )}
                  </ul>
                )}
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center">
                  <div className="flex flex-col gap-2">
                    {showComments && (
                      <div className="flex flex-row gap-2 mb-2">
                        <div ref={shareRef} className="relative">
                          <button
                            onClick={() => setShowShareMenu(o => !o)}
                            className="p-2 rounded cursor-pointer  text-white hover:text-gray-400  transition-colors"
                          >
                            <Send className={photoIcon} />
                          </button>
                          {(showShareMenu || copyMsg) && currentPost && (
                            <div className="absolute left-full bottom-0 ml-2 w-40 bg-gray-800 border border-gray-600 rounded shadow-lg z-20 text-xs text-white">
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-gray-700"
                                onClick={() =>
                                  handleCopy(
                                    `${window.location.origin}/post/${currentPost.id}`,
                                    'Link'
                                  )
                                }
                              >
                                Copy link
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-gray-700"
                                onClick={() =>
                                  handleCopy(currentPost.content || '', 'Post code')
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
                        <button
                          onClick={() => setEyeOpen(o => !o)}
                          className="cursor-pointer p-2  text-white hover:text-gray-400  transition-colors"
                        >
                          {eyeOpen ? (
                            <Eye className={photoIcon} />
                          ) : (
                            <EyeOff className={photoIcon} />
                          )}
                        </button>
                      </div>
                    )}
                    <div className="w-full">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-700 text-white p-2 rounded-l focus:outline-none text-sm"
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
                        className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FastDraws;