import PaintSidebar from "../components/paintsidebar";
import Wiki from "../components/wiki";
const WikiPage = () => {

    return (
    <div className="flex">
        <PaintSidebar />
        <main className="flex-1 ml-0 min-h-screen bg-gray-900">
            <Wiki/>
        </main>
    </div>

  );
}

export default WikiPage;