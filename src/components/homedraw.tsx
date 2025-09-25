import { usePosts } from '../hooks/posts';
import { drawPosts } from './drawposts';


const HomeDraw = () => {
  const renderedPosts = drawPosts(usePosts);
  return renderedPosts;
}

export default HomeDraw;