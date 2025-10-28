import { useState, useEffect } from 'react';
import { Trash2, Users, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import { DashboardData, useDashboardData, useDeleteComment, useDeletePost, useDeleteUser, useGetAllComments, useGetAllPosts, useGetAllUsers, verifyAdmin } from '../hooks/admin';
import { PostPage } from '../types/requests';
import { UserInfo } from '../hooks/user';
import { Comment as CommentResponse } from '../types/requests';
import useInfiniteScroll from '../hooks/infinetescroll';



export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [posts, setPosts] = useState<PostPage | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [activeTab, setActiveTab] = useState('overview');
    const commentContainerRef = document.getElementById('commentContainer');
    const [commentRef, setCommentRef] = useState<React.RefObject<HTMLDivElement | null> | null>(null);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        setIsLoading(true);
        const adminStatus = await verifyAdmin();
        setIsAdmin(adminStatus);

        if (adminStatus) {
            await loadDashboardData();
        }
        setIsLoading(false);
    };

    const loadDashboardData = async () => {
        const [dashboard, usersData, postsData, commentsData] = await Promise.all([
            useDashboardData(),
            useGetAllUsers(),
            useGetAllPosts(),
            useGetAllComments()
        ]);

        setDashboardData(dashboard);
        setUsers(usersData.data || []);
        setPosts(postsData.data || null);

        setComments(commentsData.data || []);
        if (!commentContainerRef) {
            console.warn("commentContainerRef is null");
        } else {
            const commentRef = useInfiniteScroll({
                loadMore: commentsData.loadMore || (() => { }),
                isLoading: false, // Puedes también pasar esto desde PostGallery
                root: commentContainerRef,
            });
            setCommentRef(commentRef);
        }
        
    };


    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            const success = await useDeleteUser(userId);
            if (success) {
                setUsers(users.filter(u => u.id !== userId));
                await loadDashboardData();
            }
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este post?')) {
            const success = await useDeletePost(postId);
            if (success) {
                if (posts) {
                    setPosts({
                        ...posts,
                        posts: posts.posts.filter(pa => pa.id !== postId)
                    });
                }
                await loadDashboardData();
            }
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este comentario?')) {
            const success = await useDeleteComment(commentId);
            if (success) {
                setComments(comments.filter(c => c.id !== commentId));
                await loadDashboardData();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Verificando permisos...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md">
                    <div className="flex items-start gap-4">
                        <div className="text-red-500 text-3xl font-bold">⚠</div>
                        <div>
                            <h2 className="text-red-400 font-bold text-xl mb-2">Acceso Denegado</h2>
                            <p className="text-red-300">No tienes permisos de administrador para acceder a este dashboard.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">Panel de administración y gestión de contenido</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { id: 'overview', label: 'Vista General' },
                        { id: 'users', label: 'Usuarios' },
                        { id: 'posts', label: 'Posts' },
                        { id: 'comments', label: 'Comentarios' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ${activeTab === tab.id
                                ? 'bg-gray-700 text-white border border-gray-600'
                                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Users, label: 'Usuarios', count: dashboardData.userCount, color: 'blue' },
                            { icon: FileText, label: 'Posts', count: dashboardData.postCount, color: 'green' },
                            { icon: MessageSquare, label: 'Comentarios', count: dashboardData.commentCount, color: 'purple' },
                            { icon: TrendingUp, label: 'Ratings', count: dashboardData.ratingCount, color: 'yellow' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stat.count}</div>
                                <div className="text-gray-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Usuarios</h2>
                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors">
                                    <div>
                                        <div className="text-white font-medium">{user.name}</div>
                                        <div className="text-gray-400 text-sm">{user.email}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Posts Tab */}
                {activeTab === 'posts' && posts && posts.posts.length > 0 && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Posts</h2>
                        <div className="space-y-3">
                            {posts.posts.map(post => (
                                <div key={post.id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors">
                                    <div>
                                        <div className='h-[200px] aspect-square'>
                                            <img src={post.url_bucket} alt={post.description || 'Post Image'} className="object-contain h-full w-full [image-rendering:pixelated] rounded-md" />
                                        </div>
                                        <div className="text-white font-medium">{post.description}</div>
                                        <div className="text-gray-400 text-sm">por {post.user.name}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Comentarios</h2>
                        <div className="space-y-3" id="commentContainer">
                            {comments.map(comment => (
                                <div key={comment.id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors">
                                    <div className="flex-1">
                                        <div className="text-white text-sm mb-1">{comment.content}</div>
                                        <div className="text-gray-400 text-xs">por {comment.user.name}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <div ref={commentRef}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}