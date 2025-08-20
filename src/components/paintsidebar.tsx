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
  Bomb,
  PencilIcon,
  Menu
} from "lucide-react";    
import { useState } from 'react';

const PaintSidebar = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-lg"
            >
                <Menu className="text-white" />
            </button>

            <Sidebar 
                className={`
                    fixed top-0 left-0 h-screen w-64
                    md:sticky md:top-0 md:h-screen
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    rounded-r-2xl md:rounded-2xl
                    z-40 shadow-xl
                    bg-gray-800
                `}
            >
                <div className="flex justify-center p-4"> 
                    <Bomb size={64} className="md:w-24 md:h-24" />
                </div>
                <SidebarItemGroup className="space-y-2">
                    <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
                        <Link to={"/home"} className="flex items-center w-full p-2">
                            <House className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                            <span className="text-sm md:text-base">Home</span>
                        </Link>
                    </SidebarItem>
                    <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
                        <Link to={"/fastdraws"} className="flex items-center w-full p-2">
                            <Bomb className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                            <span className="text-sm md:text-base">Fast Draws</span>
                        </Link>
                    </SidebarItem>
                    <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
                        <Link to={"/draw"} className="flex items-center w-full p-2">
                            <PencilIcon className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                            <span className="text-sm md:text-base">Draw</span>
                        </Link>
                    </SidebarItem>
                    <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
                        {user ? (
                            <Link 
                                onClick={logout} 
                                to={"/login"} 
                                className="flex items-center w-full p-2"
                            >
                                <LogInIcon className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                                <span className="text-sm md:text-base">Logout</span>
                            </Link>
                        ) : (
                            <Link 
                                to={"/login"} 
                                className="flex items-center w-full p-2"
                            >
                                <LogInIcon className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                                <span className="text-sm md:text-base">Login</span>
                            </Link>
                        )}
                    </SidebarItem>
                </SidebarItemGroup>
            </Sidebar>
        </>
    );
}

export default PaintSidebar;