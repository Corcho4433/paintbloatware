import { useUser } from '../hooks/user';
import { PostGallery } from '../components/postgallery';
import { useParams } from 'react-router-dom';
//import { useAuthStore } from '../store/useAuthStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import PaintSidebar from "../components/paintsidebar";
import useInfiniteScroll from '../hooks/infinetescroll';

const UserPage = () => {
    const { id } = useParams<{ id: string }>();
    //const auth = useAuthStore();
    //const loggedId = auth.user?.id;
    const { user, loading } = useUser(id || "");
    const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
    const [loadMoreFn, setLoadMoreFn] = useState<(() => void) | null>(null);
    const handleLoadMore = useCallback((fn: () => void) => {
        setLoadMoreFn(() => fn); // Guardar la función
        console.log("Load more function set");
    }, []);

    const sentinelRef = useInfiniteScroll({
        loadMore: loadMoreFn || (() => { }),
        isLoading: false, // Puedes también pasar esto desde PostGallery
        root: scrollableContainerRef.current,
    });
    useEffect(() => {
        console.log('User changed:', user);
    }, [user]);

    const renderSkeleton = () => (
        <div>
            <div className="flex items-center space-x-6 border border-gray-700 bg-gray-800 p-6 rounded-xl mb-8">
                <div className="w-32 h-32 rounded-full border border-white bg-gray-600 animate-pulse" />
                <div>
                    <div className="h-8 w-48 bg-gray-600 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-72 bg-gray-600 rounded animate-pulse"></div>
                </div>
            </div>
            <PostGallery userId={id} />
        </div>
    );

    // Fallback for missing user name
    const userName = user?.name || "Unknown User";

    return (
        <div className="flex">
            <PaintSidebar selectedPage="user" />
            <main className="flex-1 ml-0 min-h-screen bg-gray-900">
                {loading ? (
                    renderSkeleton()
                ) : (
                    <div>
                        <div className="flex items-center space-x-6 border m-3 border-gray-700 bg-gray-800 p-6 rounded-xl">
                            {user?.urlPfp ? (
                                <img
                                    src={user.urlPfp}
                                    alt="User"
                                    className="w-32 h-32 rounded-full border-2 border-white"
                                />
                            ) : (
                                <img
                                    src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${userName}`}
                                    alt="User"
                                    className="w-32 h-32 rounded-full border-2 border-white"
                                />
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-white">{userName}</h1>
                                {user?.description ? (
                                    <p className="text-gray-400 mt-2">{user.description}</p>
                                ) : (
                                    <p className="text-gray-300 mt-2">No description available</p>
                                )}
                            </div>
                        </div>
                        <PostGallery onLoadMore={handleLoadMore} userId={id} />
                    </div>
                )}
                <div ref={sentinelRef} />
            </main>
        </div>
    );
};

export default UserPage;