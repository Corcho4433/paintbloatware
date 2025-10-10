import { useParams } from "react-router-dom";
import { usePostById } from "../hooks/posts";
import { PostModal } from "../components/postmodal";
import PaintSidebar from "../components/paintsidebar";

const SinglePost = () => {
    const { id } = useParams<{ id: string }>();
    const {post, loading, error} = usePostById(id || "");

    
    if (error) return <div>Error: {error.message}</div>;
    

    return (
        <div className="flex">
        <PaintSidebar />
        <main className="flex flex-1 items-center justify-center ml-0 min-h-screen bg-gray-900">
            {loading && <div>Loading...</div>}
            {!loading && !post && <div>Post not found</div>}
            {!loading && post && <PostModal post={post} onClose={() => {}} darkenScreen={false} />}
        </main>
    </div>
    );
};



export default SinglePost;
