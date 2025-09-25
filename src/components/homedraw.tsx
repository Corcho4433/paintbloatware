import { useState, useEffect } from 'react';
import { usePosts } from '../hooks/posts';
import useInfiniteScroll from '../hooks/infinetescroll';
import { PostResponse } from '../types/requests';
import { Link } from 'react-router-dom';
import { drawPosts } from './drawposts';

// Modal component for post preview
const PostModal = ({ post, onClose }: { post: PostResponse; onClose: () => void }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="bg-gradient-to-br from-gray-900 to-black md:w-[512px] w-full h-[512px] rounded-t-xl md:rounded-l-xl md:rounded-tr-none flex items-center justify-center relative overflow-hidden border-2 border-gray-700">
          <img
            src={post.url_bucket}
            alt="Post Image"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Comments & Description Section */}
        <div className="flex flex-col w-full md:max-w-md h-[512px]">
          <div className="p-4 text-white ">
            <div className="flex items-center space-x-3 mb-3">
              {/* User Avatar - Replace with actual user image if available */}
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {post.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <h3 className="font-bold text-lg">{post.user?.name || 'Unknown User'}</h3>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-500 flex-1 overflow-y-auto">
            <div className="space-y-1 overflow-scroll">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {post.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className=''>
                  <h3 className="inline-flex text-sm"> <Link to={"/user/" + post.user?.id}>{post.user?.name || 'Unknown User'}</Link></h3>
                  <div className="inline text-sm ml-1 break-words">Mi adfasdjbhf ajskdlfhjlksadfh kjasdhflkj ashcomentario adfñkjasdfhñjkaadsfasdfjsahlfjdsfhñkj</div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-gray-700 text-white rounded-l-md p-2 focus:outline-none"
              />
              <button className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition-colors">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeDraw = () => {

  
  //return (null)
  return drawPosts(usePosts);
}

export default HomeDraw;