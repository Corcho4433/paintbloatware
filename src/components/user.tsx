import { usePosts } from '../hooks/posts';
import { drawPosts } from './drawposts';
import { useParams } from 'react-router-dom';


const UserPage = () => {
  const { id } = useParams<{ id: string }>();
  

  return (
    <div className="p-4">
      <div className="flex items-center space-x-6 bg-gray-800 p-6 rounded-xl mb-8">
        <img
          src="https://www.example.com/your-pfp.jpg"
          alt="User"
          className="w-32 h-32 rounded-full border-4 border-white"
        />
        <div>
          <h1 className="text-3xl font-bold text-white">Juan Pérez</h1>
          <p className="text-gray-400 mt-2">Desarrollador frontend | Apasionado por la tecnología y el diseño</p>
        </div>
      </div>

      {drawPosts(usePosts, id)}
    </div>
  );
}

export default UserPage;
