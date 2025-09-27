import { Sidebar, SidebarItem, SidebarItemGroup } from "flowbite-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogInIcon,
  House,
  Cat,
  PencilIcon,
  Menu,
  CircleUser,
  LibraryIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const PaintSidebar = () => {
  const current_user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false); // mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-lg"
      >
        <Menu className="text-white" />
      </button>

      <Sidebar
        className={`
          fixed top-0 left-0 h-screen
          md:sticky md:top-0 md:h-screen
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
          rounded-r-2xl md:rounded-2xl
          z-40 shadow-xl bg-gray-800
          flex flex-col justify-between
          [&>div]:!bg-gray-800
        `}
      >
        {/* Logo → Clickable to go Home */}
        <div className="flex justify-center p-4">
          <Link to="/home">
            <img
              src="/logo2.png"
              alt="logo-sidebar"
              className={`cursor-pointer transition-all duration-300 ${
                isCollapsed ? "h-8 w-8" : "h-16 w-16"
              }`}
            />
          </Link>
        </div>

        {/* Navigation */}
        <SidebarItemGroup className="space-y-2 flex-1">
          {/* Home */}
          <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
            <Link
              to={"/home"}
              className={`flex w-full p-3 transition-all ${
                isCollapsed ? "justify-center" : "items-center"
              }`}
            >
              <House
                className={`${isCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isCollapsed && (
                <span className="text-lg font-semibold">Home</span>
              )}
            </Link>
          </SidebarItem>

          {/* Fast Draws */}
          <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
            <Link
              to={"/fastdraws"}
              className={`flex w-full p-3 transition-all ${
                isCollapsed ? "justify-center" : "items-center"
              }`}
            >
              <Cat className={`${isCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`} />
              {!isCollapsed && (
                <span className="text-lg font-semibold">Fast Draws</span>
              )}
            </Link>
          </SidebarItem>

          {/* Draw */}
          <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
            <Link
              to={"/draw"}
              className={`flex w-full p-3 transition-all ${
                isCollapsed ? "justify-center" : "items-center"
              }`}
            >
              <PencilIcon
                className={`${isCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isCollapsed && (
                <span className="text-lg font-semibold">Draw</span>
              )}
            </Link>
          </SidebarItem>

          {/* Wiki */}
          <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
            <Link
              to={"/wiki"}
              className={`flex w-full p-3 transition-all ${
                isCollapsed ? "justify-center" : "items-center"
              }`}
            >
              <LibraryIcon
                className={`${isCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isCollapsed && (
                <span className="text-lg font-semibold">How to draw</span>
              )}
            </Link>
          </SidebarItem>

          {/* User (if logged in) */}
          {current_user && (
            <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
              <Link
                to={`/user/${current_user.id}`}
                className={`flex w-full p-3 transition-all ${
                  isCollapsed ? "justify-center" : "items-center"
                }`}
              >
                <CircleUser
                  className={`${isCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
                />
                {!isCollapsed && (
                  <span className="text-lg font-semibold">User</span>
                )}
              </Link>
            </SidebarItem>
          )}

          {/* Login / Logout */}
          <SidebarItem className="hover:bg-gray-700 rounded-lg transition-colors">
            {current_user ? (
              <Link
                onClick={logout}
                to={"/login"}
                className={`flex w-full p-3 transition-all ${
                  isCollapsed ? "justify-center" : "items-center"
                }`}
              >
                <LogInIcon
                  className={`${isCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
                />
                {!isCollapsed && (
                  <span className="text-lg font-semibold">Logout</span>
                )}
              </Link>
            ) : (
              <Link
                to={"/login"}
                className={`flex w-full p-3 transition-all ${
                  isCollapsed ? "justify-center" : "items-center"
                }`}
              >
                <LogInIcon
                  className={`${isCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
                />
                {!isCollapsed && (
                  <span className="text-lg font-semibold">Login</span>
                )}
              </Link>
            )}
          </SidebarItem>
        </SidebarItemGroup>

        {/* Collapse button (desktop only) */}
        <div className="p-2 hidden md:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              flex items-center justify-center p-2 rounded-lg hover:!bg-gray-600 transition
              ${
                isCollapsed
                  ? "w-10 h-10 mx-auto !bg-gray-700"
                  : "w-full !bg-gray-700"
              }
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="text-white" />
            ) : (
              <ChevronLeft className="text-white" />
            )}
          </button>
        </div>
      </Sidebar>
    </>
  );
};

export default PaintSidebar;
