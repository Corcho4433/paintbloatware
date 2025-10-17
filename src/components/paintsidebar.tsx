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
  Settings,
} from "lucide-react";

const PaintSidebar = () => {
  const current_user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  // Use persistent sidebar state from store
  const isMobileSidebarOpen = useAuthStore((state) => state.isMobileSidebarOpen);
  const isDesktopSidebarCollapsed = useAuthStore((state) => state.isDesktopSidebarCollapsed);
  const setMobileSidebarOpen = useAuthStore((state) => state.setMobileSidebarOpen);
  const setDesktopSidebarCollapsed = useAuthStore((state) => state.setDesktopSidebarCollapsed);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-lg"
      >
        <Menu className="text-white" />
      </button>

      <Sidebar
        className={`
          fixed top-0 left-0 h-screen
          md:sticky md:top-0 md:h-screen
          transition-all duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isDesktopSidebarCollapsed ? "w-20" : "w-64"}
          rounded-r-2xl md:rounded-2xl
          z-40 shadow-xl bg-gray-800
          flex flex-col justify-between
          [&>div]:!bg-gray-800
        `}
      >
        {/* Logo → Clickable to go Home */}
        <div className="space-y-3">

        </div>

        {/* Navigation */}
        <SidebarItemGroup className="space-y-2 flex-1">
          {/* Home */}
          <SidebarItem href="/home" className={`${ isDesktopSidebarCollapsed ? "aspect-square w-12 " : "" } hover:!bg-gray-700 rounded-lg transition-colors`}>
            <div className="flex items-center">
              <House
                className={`${isDesktopSidebarCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Home</span>
              )}
            </div>
          </SidebarItem>

          {/* Fast Draws */}
          <SidebarItem href="/fastdraws" className={`${ isDesktopSidebarCollapsed ? "aspect-square w-12 " : "" } hover:!bg-gray-700 rounded-lg transition-colors `}>
            <div className="flex items-center">
              <Cat className={`${isDesktopSidebarCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`} />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Fast Draws</span>
              )}
            </div>
          </SidebarItem>

          {/* Draw */}
          <SidebarItem href="/draw" className={`${ isDesktopSidebarCollapsed ? "aspect-square w-12 "  : "" } hover:!bg-gray-700 rounded-lg transition-colors`}>
            <div className="flex items-center">
              <PencilIcon
                className={`${isDesktopSidebarCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Draw</span>
              )}
            </div>
          </SidebarItem>

          {/* Wiki */}
          <SidebarItem href="/wiki" className={`${ isDesktopSidebarCollapsed ? "aspect-square w-12 " : "" } hover:!bg-gray-700 rounded-lg transition-colors`}>
            <div className="flex items-center">
              <LibraryIcon
                className={`${isDesktopSidebarCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Wiki</span>
              )}
            </div>
          </SidebarItem>

          {/* User (if logged in) */}
          {current_user && (
            <SidebarItem href={`/user/${current_user.id}`} className={`${ isDesktopSidebarCollapsed ? "aspect-square w-12 " : "" } hover:!bg-gray-700 rounded-lg transition-colors`}>
              <div className="flex items-center">
                <CircleUser
                  className={`${isDesktopSidebarCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
                />
                {!isDesktopSidebarCollapsed && (
                  <span className="text-md font-semibold">Profile</span>
                )}
              </div>
            </SidebarItem>
          )}
          {current_user && 
          <SidebarItem href="/settings" className={`${ isDesktopSidebarCollapsed ? "aspect-square w-12 " : "" } hover:!bg-gray-700 rounded-lg transition-colors`}>
            <div className="flex items-center">
              <Settings
                className={`${isDesktopSidebarCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Settings</span>
              )}
            </div>
          </SidebarItem>
          }
          {/* Login / Logout */}
          <SidebarItem href={current_user ? "/login" : "/login"} className={`${ isDesktopSidebarCollapsed ? "aspect-square w-12 " : "" } hover:!bg-gray-700 rounded-lg transition-colors`} onClick={current_user ? logout : undefined}>
            <div className="flex items-center">
              <LogInIcon
                className={`${isDesktopSidebarCollapsed ? "w-7 h-7" : "w-7 h-7 mr-4"}`}
              />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">{current_user ? "Logout" : "Login"}</span>
              )}
            </div>
          </SidebarItem>
          
        </SidebarItemGroup>

        {/* Collapse button (desktop only) */}
        <div className="p-2 hidden md:block">
          <button
            onClick={() => setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            className={`
              flex items-center justify-center p-2 rounded-lg hover:!bg-gray-600 transition
              ${
                isDesktopSidebarCollapsed
                  ? "w-10 h-10 mx-auto !bg-gray-700"
                  : "w-full !bg-gray-700"
              }
            `}
          >
            {isDesktopSidebarCollapsed ? (
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

