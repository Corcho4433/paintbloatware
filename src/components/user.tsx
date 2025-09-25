import { usePosts } from '../hooks/posts';
import { useUser } from '../hooks/user';
import { drawPosts } from './drawposts';
import { useParams } from 'react-router-dom';


const UserPage = () => {
  const { id } = useParams<{ id: string }>();
  const {user,loading,error} = useUser(id || "");
  const renderedPosts = drawPosts(usePosts, id);

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

  return (
    <div className="p-4">
      <div className="flex items-center space-x-6 bg-gray-800 p-6 rounded-xl mb-8">
        <img
          src={user?.name || "https://www.example.com/your-pfp.jpg"}
          alt="User"
          className="w-32 h-32 rounded-full border-4 border-white"
        />
        <div>
          <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
          <p className="text-gray-400 mt-2">{user?.name}</p>
        </div>
      </div>

      {renderedPosts}
    </div>
  );
}

export default UserPage;
