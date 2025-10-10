import { useUser } from '../hooks/user';
import { PostGallery } from './postgallery';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

import { useEffect } from 'react';

const UserPage = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useAuthStore();
  const loggedId = auth.user?.id;
  const { user, loading } = useUser(id || "");
  const renderedPosts = <PostGallery userId={id} />;
  useEffect(() => {
    console.log('User changed:', user);
  }, [user]);

  const renderSkeleton = () => (
    <div className="p-4">
      <div className="flex items-center space-x-6 bg-gray-800 p-6 rounded-xl mb-8">
        <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-600 animate-pulse" />
        <div>
          <div className="h-8 w-48 bg-gray-600 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
      {renderedPosts}
    </div>
  );

  if (loading) return renderSkeleton();

  // Fallback for missing user name
  const userName = user?.name || "Unknown User";

  return (
    <div className="p-4">
      <div className="flex items-center space-x-6 bg-gray-800 p-6 rounded-xl mb-8">
        {(user && user.urlPfp && !loading) ? (
          <img
            src={`${user.urlPfp}`}
            alt="User"
            className="w-32 h-32 rounded-full border-4 border-white"
          />) : (
          <img
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${userName}`}
            alt="User"
            className="w-32 h-32 rounded-full border-4 border-white"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">{userName}</h1>
          {user?.description ? <p className="text-gray-400 mt-2">{user.description}</p> : <p className="text-gray-300 mt-2">No description available</p>}
        </div>
        
      </div>

      {renderedPosts}
    </div>
  );
}

export default UserPage;
