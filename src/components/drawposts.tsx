import { PostPage } from "../types/requests";
type UsePostsResult = {
  posts: PostPage | null;
  loading: boolean;
  error: Error | null;
  loadMore: () => void;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  count: number;
};

const drawPosts = (usePosts : () => UsePostsResult) => {
    const { posts, loading, error, loadMore, isRefreshing, isLoadingMore, count } = usePosts();




}