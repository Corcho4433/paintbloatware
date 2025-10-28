import { Sidebar, SidebarItem, SidebarItemGroup } from "flowbite-react";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogInIcon,
  LogOutIcon,
  House,
  Cat,
  PencilIcon,
  Menu,
  CircleUser,
  LibraryIcon,
  Settings,
  Compass,
} from "lucide-react";


interface PaintSidebarProps {
  selectedPage?: string;
}
const PaintSidebar = ({ selectedPage }: PaintSidebarProps) => {
  const current_user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  // Use persistent sidebar state from store
  const isMobileSidebarOpen = useAuthStore((state) => state.isMobileSidebarOpen);
  const isDesktopSidebarCollapsed = useAuthStore((state) => state.isDesktopSidebarCollapsed);
  const setMobileSidebarOpen = useAuthStore((state) => state.setMobileSidebarOpen);

  return (
    <>
      {/* Mobile toggle button - only show when sidebar is closed */}
      {!isMobileSidebarOpen && (
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-lg shadow-lg hocus:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="text-white w-6 h-6" />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        className={`
          fixed top-0 left-0 h-screen
          md:sticky md:top-0 md:h-screen
          transition-all duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isDesktopSidebarCollapsed ? "md:w-20" : "md:w-64"}
          w-64
          rounded-r-2xl md:rounded-2xl
          z-40 shadow-xl bg-gray-800
          border-r border-gray-700
          flex flex-col justify-between
          [&>div]:!bg-gray-800
        `}
      >
        {/* Mobile close button */}
        

        {/* Desktop collapse toggle button */}
      

        {/* Navigation */}
        <SidebarItemGroup className="space-y-2 flex-1 md:!mt-3">
          {/* Home */}
          <SidebarItem 
            href="/home" 
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 rounded-lg transition-colors 
              ${selectedPage === "home" ? "cursor-default !text-white !bg-gray-700" : ""}
            `}
          >
            <div className="flex items-center">
              <House className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Home</span>
              )}
            </div>
          </SidebarItem>

          {/* Fast Draws */}
          <SidebarItem 
            href="/fastdraws" 
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "fastdraws" ? "cursor-default !text-white !bg-gray-700" : ""}
            `}
          >
            <div className="flex items-center">
              <Cat className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Fast Draws</span>
              )}
            </div>
          </SidebarItem>

          {/* Draw */}
          <SidebarItem 
            href="/draw" 
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "draw" ? "cursor-default !text-white !bg-gray-700" : ""}
            `}
          >
            <div className="flex items-center">
              <PencilIcon className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Draw</span>
              )}
            </div>
          </SidebarItem>

          {/* Wiki */}
          <SidebarItem 
            href="/wiki" 
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "wiki" ? "cursor-default !text-white !bg-gray-700" : ""}
            `}
          >
            <div className="flex items-center">
              <LibraryIcon className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Wiki</span>
              )}
            </div>
          </SidebarItem>

          {/* User Profile (if logged in) */}
          {current_user && (
            <SidebarItem 
              href={`/user/${current_user.id}`} 
              className={`
                ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
                rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
                ${selectedPage === "user" ? "cursor-default !text-white !bg-gray-700" : ""}
              `}
            >
              <div className="flex items-center">
                <CircleUser className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
                {!isDesktopSidebarCollapsed && (
                  <span className="text-md font-semibold">Profile</span>
                )}
              </div>
            </SidebarItem>
          )}
          {/* Dashboard if admin*/}
          {current_user?.admin && (
            <SidebarItem 
              href="/dashboard" 
              className={`
                ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
                rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
                ${selectedPage === "dashboard" ? "cursor-default !text-white !bg-gray-700" : ""}
              `}
            >
              <div className="flex items-center">
                <Compass className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
                {!isDesktopSidebarCollapsed && (
                  <span className="text-md font-semibold">Dashboard</span>
                )}
              </div>
            </SidebarItem>
          )}
          {/* Settings (if logged in) */}
          {current_user && (
            <SidebarItem 
              href="/settings" 
              className={`
                ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
                rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
                ${selectedPage === "settings" ? "cursor-default !text-white !bg-gray-700" : ""}
              `}
            >
              <div className="flex items-center">
                <Settings className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
                {!isDesktopSidebarCollapsed && (
                  <span className="text-md font-semibold">Settings</span>
                )}
              </div>
            </SidebarItem>
          )}

          {/* Login / Logout */}
          <SidebarItem 
            href={current_user ? "/logout" : "/login"} 
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "login" ? "cursor-default !text-white !bg-gray-700" : ""}
            `}
            onClick={current_user ? logout : undefined}
          >
            <div className="flex items-center">
              {current_user ? (
                <LogOutIcon className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              ) : (
                <LogInIcon className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              )}
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">{current_user ? "Logout" : "Login"}</span>
              )}
            </div>
          </SidebarItem>
        </SidebarItemGroup>
      </Sidebar>
    </>
  );
};

export default PaintSidebar;

