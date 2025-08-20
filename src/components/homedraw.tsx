import { useEffect, useRef } from 'react';
import { DrawImage } from './drawimage';
import { usePosts } from '../hooks/posts';
import { Link } from 'react-router-dom';

const HomeDraw = () => {
  const { posts, loading, error } = usePosts();

  return (
    <div className="p-4">


      {/* Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mx-auto">
        {!loading && !error && posts?.posts.map((post, index) => (
          <div key={index} className="mb-4">
            <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 w-[512px] hover:scale-[1.02]">
              <div className="aspect-square w-full relative">
                <DrawImage image_json={post.image_json} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                    <Link to={`/users/${post.user.id}`} className="text-sm text-gray-300 hover:underline">
                      {post.user.name}
                    </Link>
                  </div>
                  <button className="text-gray-300 hover:text-white">❤️</button>
                </div>
              </div>
            </div>
          </div>
        ))}



        {/* Loading State */}
        {loading && (
          <div className="text-center text-white text-xl">
            Loading images...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 text-xl">
            Error loading images
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeDraw;