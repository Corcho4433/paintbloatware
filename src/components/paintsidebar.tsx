import {
    Sidebar,
    SidebarItem,
    SidebarItemGroup,
} from "flowbite-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
    LogInIcon,
    House,
    FastForward,
    PencilIcon
} from "lucide-react";

const PaintSidebar = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout); // Agregar esta línea

    return (
        <Sidebar className="absolute left-0 h-full rounded-2xl">
            <div className="flex justify-center"> <img src="/logo2.png" className="w-50 h-50" alt="logo" /> </div>
            <SidebarItemGroup>
                <SidebarItem>
                    <Link to={"/home"} className="flex flex-row">
                        <House className="mr-4"></House>
                        Home
                    </Link>
                </SidebarItem>
                <SidebarItem>
                    <Link to={"/fastdraws"} className="flex flex-row">
                        <FastForward className="mr-4"></FastForward>
                        FastDraws
                    </Link>
                </SidebarItem>
                <SidebarItem>
                    <Link to={"/draw"} className="flex flex-row">
                        <PencilIcon className="mr-4"></PencilIcon>
                        Draw
                    </Link>
                </SidebarItem>
                <SidebarItem>
                    {user ? (
                        <Link onClick={logout} to={"/login"} className="flex flex-row">
                            <LogInIcon className="mr-4"></LogInIcon>
                            Logout
                        </Link>
                    ) : (
                        <Link to={"/login"} className="flex flex-row">
                            <LogInIcon className="mr-4"></LogInIcon>
                            Login
                        </Link>
                    )}
                </SidebarItem>
            </SidebarItemGroup>
        </Sidebar>
    );
}

export default PaintSidebar;