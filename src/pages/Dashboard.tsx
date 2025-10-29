import { useState, useEffect, KeyboardEvent, MouseEvent } from 'react';
import { Trash2, Users, MessageSquare, FileText, TrendingUp, ChevronLeft, ChevronRight, Tag, Plus, Shield, ChevronDown } from 'lucide-react';
import { DashboardData, useCreateAdmin, useCreateTag, useDashboardData, useDeleteAdmin, useDeleteComment, useDeletePost, useDeleteTag, useDeleteThread, useDeleteUser, useGetAllComments, useGetAllPosts, useGetAllTags, useGetAllUsers, verifyAdmin } from '../hooks/admin';
import { GetAllTagsResponse, PostPage } from '../types/requests';
import { UserPageResponse } from '../types/requests';
import { CommentPageResponse } from '../types/requests';
import { useAuthStore } from '../store/useAuthStore';
import PaintSidebar from '../components/paintsidebar';
import { useCommentThreads } from '../hooks/commentThreads';
import { Comment } from '../types/requests';
interface PaginationProps {
    currentPage: number;
    maxPages: number;
    onPageChange: (page: number) => void;
}

function CommentItem({ comment, onDelete }: { 
  comment: Comment; 
  onDelete: (id: string) => void;
}) {
  const [showThreads, setShowThreads] = useState(false);
  const { 
    threads, 
    loading, 
    hasLoaded, 
    initializeThreads, 
  } = useCommentThreads(comment.id);

  const handleToggleThreads = async () => {
    if (!showThreads && !hasLoaded) {
      await initializeThreads();
    }
    setShowThreads(!showThreads);
  };

  const handleDeleteThread = async (threadId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta respuesta?')) {
      const success = await useDeleteThread(threadId);
      if (success) {
        // Opcional: Mostrar mensaje de éxito
        console.log("Thread eliminado exitosamente");
      } else {
        alert("Error al eliminar la respuesta");
      }
    }
  };
  
  const threadCount = comment._count?.CommentThread || 0;
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700">
      <div className="p-4 flex items-center justify-between hover:border-gray-600 transition-colors group">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-purple-900/30 p-2 rounded-lg">
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="text-white text-sm mb-1">{comment.content}</div>
            <div className="text-gray-400 text-xs">por {comment.user.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {threadCount > 0 && (
            <button
              onClick={handleToggleThreads}
              className="px-3 py-1.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-all flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{threadCount} {threadCount === 1 ? 'respuesta' : 'respuestas'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showThreads ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            onClick={() => onDelete(comment.id)}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showThreads && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
          {loading ? (
            <div className="text-center text-gray-400 py-4">
              Cargando respuestas...
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              No hay respuestas aún
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map(thread => (
                <div
                  key={thread.id}
                  className="bg-gray-900/50 rounded-lg p-3 flex items-start justify-between group/thread hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <div className="bg-blue-900/30 p-1.5 rounded">
                      <MessageSquare className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-200 text-sm">{thread.content}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        por {thread.user?.name || 'Usuario'}
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-all opacity-0 group-hover/thread:opacity-100"
                    onClick={() => handleDeleteThread(thread.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TagsTab = ({
    tags,
    onTagCreated,
    onTagDeleted
}: {
    tags: GetAllTagsResponse;
    onTagCreated?: () => void;
    onTagDeleted?: (id: string) => void;
}) => {
    const [tagName, setTagName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        // Validación
        if (!tagName.trim()) {
            setError('El nombre del tag no puede estar vacío');
            return;
        }

        if (tagName.length < 2) {
            setError('El nombre del tag debe tener al menos 2 caracteres');
            return;
        }

        if (tagName.length > 50) {
            setError('El nombre del tag no puede exceder 50 caracteres');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const success = await useCreateTag(tagName.trim());

            if (success) {
                setSuccessMessage(`Tag "${tagName}" creado exitosamente`);
                setTagName('');

                // Llamar callback para recargar tags
                if (onTagCreated) {
                    onTagCreated();
                }

                // Limpiar mensaje de éxito después de 3 segundos
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError('Error al crear el tag. Inténtalo de nuevo.');
            }
        } catch (err) {
            setError('Error al crear el tag. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTag = async (id: string) => {
        try {
            // Llamar tu API de eliminación
            // await deleteTag(id);

            if (onTagDeleted) {
                onTagDeleted(id);
            }
        } catch (err) {
            console.error('Error al eliminar tag:', err);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-6">
                <Tag className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Gestión de Tags</h2>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-700 p-5 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Crear Nuevo Tag</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nombre del Tag
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={tagName}
                                onChange={(e) => {
                                    setTagName(e.target.value);
                                    setError('');
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Ej: JavaScript, React, CSS..."
                                maxLength={50}
                                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                disabled={isSubmitting}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !tagName.trim()}
                                className="px-6 py-2.5 bg-gray-700 text-white rounded-lg font-medium border-gray-600 hover:cursor-pointer hover:bg-gray-800 hover:border-blue-400 shadow-lg hover:shadow-blue-400/25 disabled:opacity-50 border disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                {isSubmitting ? 'Creando...' : 'Crear'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {tagName.length}/50 caracteres
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm">
                            {successMessage}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Tags Existentes</h3>
                    <span className="text-gray-400 text-sm">
                        Total: {tags.totalTags} tags
                    </span>
                </div>

                <div className="space-y-3">
                    {tags.tags.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay tags creados aún</p>
                        </div>
                    ) : (
                        tags.tags.map(tag => (
                            <div
                                key={tag.id}
                                className="bg-gray-900 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-900/30 p-2 rounded-lg">
                                        <Tag className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="text-white font-medium">{tag.name}</div>
                                </div>
                                <button
                                    onClick={() => handleDeleteTag(tag.id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Eliminar tag"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


const Pagination = ({ currentPage, maxPages, onPageChange }: PaginationProps) => {
    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = maxPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= maxPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(maxPages);
            } else if (currentPage >= maxPages - 3) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = maxPages - 4; i <= maxPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(maxPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {getPageNumbers().map((page, idx) => (
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="text-gray-400 px-2">...</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(typeof page === 'string' ? parseInt(page) : page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === maxPages}
                className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};


export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [users, setUsers] = useState<UserPageResponse | null>(null);
    const [posts, setPosts] = useState<PostPage | null>(null);
    const [comments, setComments] = useState<CommentPageResponse | null>(null);
    const [tags, setTags] = useState<GetAllTagsResponse | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const setAdmin = useAuthStore((state) => state.setAdmin);
    const loggedId = useAuthStore((state) => state.user?.id);
    const reloadTags = async () => {
        const tagsData = await useGetAllTags();
        setTags(tagsData);
    };





    // Guardar las funciones loadPage
    const [loadUsersPage, setLoadUsersPage] = useState<((page: number) => Promise<UserPageResponse | null>) | null>(null);
    const [loadPostsPage, setLoadPostsPage] = useState<((page: number) => Promise<PostPage | null>) | null>(null);
    const [loadCommentsPage, setLoadCommentsPage] = useState<((page: number) => Promise<CommentPageResponse | null>) | null>(null);


    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        setIsLoading(true);
        const adminStatus = await verifyAdmin();
        setIsAdmin(adminStatus);
        if (adminStatus) {
            setAdmin(true);
            await loadDashboardData();
        }
        setIsLoading(false);
    };

    const loadDashboardData = async () => {
        const [dashboard, usersData, postsData, commentsData, tagsData] = await Promise.all([
            useDashboardData(),
            useGetAllUsers(),
            useGetAllPosts(),
            useGetAllComments(),
            useGetAllTags()
        ]);

        setDashboardData(dashboard);
        setUsers(usersData.data || null);
        setPosts(postsData.data || null);
        setComments(commentsData.data || null);
        setTags(tagsData || null);

        // Guardar las funciones loadPage
        setLoadUsersPage(() => usersData.loadPage);
        setLoadPostsPage(() => postsData.loadPage);
        setLoadCommentsPage(() => commentsData.loadPage);
    };

    const handleCommentPage = async (page: number) => {
        if (loadCommentsPage) {
            const newCommentsData = await loadCommentsPage(page);
            setComments(newCommentsData);
        }
    };

    const handleUserPage = async (page: number) => {
        if (loadUsersPage) {
            const newUsersData = await loadUsersPage(page);
            setUsers(newUsersData);
        }
    };

    const handlePostPage = async (page: number) => {
        if (loadPostsPage) {
            const newPostsData = await loadPostsPage(page);
            setPosts(newPostsData);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            const success = await useDeleteUser(userId);
            if (success) {
                if (users) {
                    setUsers({
                        ...users,
                        users: (users.users ?? []).filter(u => u.id !== userId)
                    });
                }
                await loadDashboardData();
            }
        }
    };
    const handleDeleteTag = async (tagId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este tag?')) {
            const success = await useDeleteTag(tagId);
            if (success) {
                if (tags) {
                    setTags({
                        ...tags,
                        tags: (tags.tags ?? []).filter(t => t.id !== tagId)
                    });
                }
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

    const handleAdminToggle = async (userId: string, desiredState: boolean) => {
        if (userId === loggedId) {
            alert('No puedes cambiar tus propios permisos de administrador.');
            return;
        };
        if (desiredState === true) {
            const response = await useCreateAdmin(userId);
            if (!response) {
                alert('Error al otorgar permisos de administrador.');
                return;
            }
            setUsers(users
                ? { ...users, users: users.users.map(u => u.id === userId ? { ...u, isAdmin: true } : u) }
                : null
            );
        } else {
            const response = await useDeleteAdmin(userId);
            if (!response) {
                alert('Error al revocar permisos de administrador.');
                return;
            } 
                setUsers(users
                    ? { ...users, users: users.users.map(u => u.id === userId ? { ...u, isAdmin: false } : u) }
                    : null
                );
            

        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este comentario?')) {
            const success = await useDeleteComment(commentId);
            if (success) {
                setComments(comments
                    ? { ...comments, comments: comments.comments.filter(c => c.id !== commentId) }
                    : null
                );
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
        <div className="flex">
            <PaintSidebar selectedPage='dashboard'></PaintSidebar>
            <div className="min-h-screen w-full bg-gray-900 p-6">

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
                            { id: 'comments', label: 'Comentarios' },
                            { id: 'createTag', label: 'Crear Tag' }
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

                    {activeTab === 'createTag' && tags && (
                        <TagsTab
                            tags={tags}
                            onTagCreated={reloadTags}
                            onTagDeleted={handleDeleteTag}
                        />
                    )}





                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Users className="w-6 h-6 text-blue-400" />
                                <h2 className="text-2xl font-bold text-white">Usuarios</h2>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Lista de Usuarios</h3>
                                    <span className="text-gray-400 text-sm">
                                        Total: {users && users.totalCount} usuarios
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {users && users.users.map(user => (
                                        <div
                                            key={user.id}
                                            className="bg-gray-900 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-900/30 p-2 rounded-lg">
                                                    <Users className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">{user.name}</span>
                                                        {user.isAdmin && (
                                                            <span className="bg-purple-900/30 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-700/50 font-medium">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-400 text-sm">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAdminToggle(user.id, !user.isAdmin)}
                                                    className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${user.isAdmin
                                                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20'
                                                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20'
                                                        }`}
                                                    title={user.isAdmin ? 'Quitar permisos de admin' : 'Hacer admin'}
                                                >
                                                    <Shield className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {users && users.maxPages > 1 && (
                                    <Pagination
                                        currentPage={users.currentPage}
                                        maxPages={users.maxPages}
                                        onPageChange={handleUserPage}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Posts Tab */}
                    {activeTab === 'posts' && posts && posts.posts.length > 0 && (
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <FileText className="w-6 h-6 text-green-400" />
                                <h2 className="text-2xl font-bold text-white">Posts</h2>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Lista de Posts</h3>
                                    <span className="text-gray-400 text-sm">
                                        Total: {posts && posts.totalCount} posts
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {posts && posts.posts.map(post => (
                                        <div
                                            key={post.id}
                                            className="bg-gray-900 rounded-lg p-4 flex items-start justify-between border border-gray-700 hover:border-gray-600 transition-colors group"
                                        >
                                            <div className="flex gap-4 flex-1">
                                                <div className="flex gap-4 flex-1">
                                                    <div className="h-[120px] w-[120px] flex-shrink-0">
                                                        <img
                                                            src={post.url_bucket}
                                                            alt={post.description || 'Post Image'}
                                                            className="object-cover h-full w-full rounded-md [image-rendering:pixelated]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium mb-1">{post.description}</div>
                                                        <div className="text-gray-400 text-sm">por {post.user.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                onClick={() => handleDeletePost(post.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {posts && posts.maxPages > 1 && (
                                    <Pagination
                                        currentPage={posts.currentPage}
                                        maxPages={posts.maxPages}
                                        onPageChange={handlePostPage}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <MessageSquare className="w-6 h-6 text-purple-400" />
                                <h2 className="text-2xl font-bold text-white">Comentarios</h2>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Lista de Comentarios</h3>
                                    <span className="text-gray-400 text-sm">
                                        Total: {comments && comments.totalCount} comentarios
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {comments && comments.comments.map(comment => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            onDelete={handleDeleteComment}
                                        />
                                    ))}
                                </div>
                                {comments && comments.maxPages > 1 && (
                                    <Pagination
                                        currentPage={comments.currentPage}
                                        maxPages={comments.maxPages}
                                        onPageChange={handleCommentPage}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}