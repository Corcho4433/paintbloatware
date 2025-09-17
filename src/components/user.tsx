import { usePosts } from '../hooks/posts';
import { Link } from 'react-router-dom';
import { Laugh, Angry } from "lucide-react";
import { Button } from "flowbite-react";

const UserPage = () => {
  const { posts, loading, error } = usePosts();
  const emptyArray = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

  let photoIcon =
    "opacity-50 ease-in-out group-focus:opacity-100 group-hover:scale-116  group-focus:scale-116 group-hover:opacity-100 transition-all duration-600";

  const renderContent = (postID: number) => {
    const currentPostIndex = postID;

    if (loading) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700">
          <div className="w-full h-full flex items-center justify-center text-white">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          {error instanceof Error ? error.message : "An error occurred while loading posts"}
        </div>
      );
    }

    if (!posts?.length) {
      return (
        <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white">
          No posts yet...
        </div>
      );
    }

    const currentPost = posts[currentPostIndex];

    if (!currentPost) {
      return (
        <div className="bg-gradient-to-br from-red-500 via-red-700 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 text-white font-bold">
          Post not found
        </div>
      );
    } else {
      return (
        <img
          src={currentPost.url}
          alt="Post Image"
          width={512}
          height={512}
          style={{
            imageRendering: 'pixelated',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      );
    }
  }

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

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 justify-items-center mt-7">
        {!loading && posts ? !error && posts.map((post, index) => (
          <div key={index} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl duration-300 w-[512px]">
            <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
              {renderContent(index)}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                  <Link to={`/users/${post.user.id}`} className="text-sm text-gray-300 hover:underline">
                    {post.user.name}
                  </Link>
                </div>
                <Button className="group !bg-white dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-green-500 hover:!border-green-500">
                  <Laugh className={photoIcon} />
                </Button>

                <Button className="group !bg-white dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-red-800 hover:!border-red-800">
                  <Angry className={photoIcon} />
                </Button>
              </div>
            </div>
          </div>
        )) : (
          emptyArray.map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl duration-300 w-[512px]">
              <div className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
                {renderContent(index)}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                    <Link to={``} className="text-sm text-gray-300 hover:underline"></Link>
                  </div>
                  <Button className="group !bg-white dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-green-500 hover:!border-green-500">
                    <Laugh className={photoIcon} />
                  </Button>

                  <Button className="group !bg-white dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-red-800 hover:!border-red-800">
                    <Angry className={photoIcon} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserPage;
