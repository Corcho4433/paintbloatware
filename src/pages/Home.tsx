import PaintSidebar from "../components/paintsidebar";
import HomeDraw from "../components/homedraw";
const HomePage = () => {
    
  return (
    <div className="w-full h-full bg-gray-300 dark:bg-gray-900 min-h-screen flex items-center justify-center px-6 py-8 flex-col space-y-4">
        <PaintSidebar />
        
        <HomeDraw />
    </div>
  );
}

export default HomePage;