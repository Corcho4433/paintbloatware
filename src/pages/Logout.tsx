import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    useEffect(() => {
        logout();
        // Redirect to login after logout
        navigate("/login");
    }, [logout]);
    return (<div className="w-full h-full bg-gray-900"></div>)
};

export default LogoutPage;
