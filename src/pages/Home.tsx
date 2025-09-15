import PaintSidebar from "../components/paintsidebar";
import HomeDraw from "../components/homedraw";
const HomePage = () => {
  return (
    <div className="flex">
        <PaintSidebar />
        <main className="flex-1 ml-0 min-h-screen bg-gray-900">
            <HomeDraw />
        </main>
    </div>

  );
}

export default HomePage;