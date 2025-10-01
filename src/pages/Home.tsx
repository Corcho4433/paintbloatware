import PaintSidebar from "../components/paintsidebar";
import { PostGallery } from "../components/postgallery";
const HomePage = () => {
  return (
    <div className="flex">
        <PaintSidebar />
        <main className="flex-1  ml-0 min-h-screen bg-gray-900">
            <PostGallery />
        </main>
    </div>

  );
}

export default HomePage;