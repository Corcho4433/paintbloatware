import PaintSidebar from "../components/paintsidebar";
import User from "../components/userDisplay";
const UserPage = () => {
    
    return (
    <div className="flex">
        <PaintSidebar />
        <main className="flex-1 ml-0 min-h-screen bg-gray-900">
            <User/>
        </main>
    </div>

  );
}

export default UserPage;