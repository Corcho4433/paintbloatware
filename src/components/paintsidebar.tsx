import { Sidebar, SidebarItem, SidebarItemGroup } from "flowbite-react";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogInIcon,
  LogOutIcon,
  Home,
  Cat,
  PencilIcon,
  Menu,
  UserCircle2,
  LibraryIcon,
  Settings,
  Compass,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


interface PaintSidebarProps {
  selectedPage?: string;
}
const PaintSidebar = ({ selectedPage }: PaintSidebarProps) => {
  const current_user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate()
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
            onClick={() => navigate("/home")}
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 rounded-lg transition-colors 
              ${selectedPage === "home" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
            `}
          >
            <div className="flex items-center">
              <Home className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">Home</span>
              )}
            </div>
          </SidebarItem>

          {/* Fast Draws */}
          <SidebarItem
            onClick={() => navigate("/fastdraws")}
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "fastdraws" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
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
            onClick={() => navigate("/draw")}
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "draw" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
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
            onClick={() => navigate("/wiki")}
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "wiki" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
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
              onClick={() => navigate(`/user/${current_user.id}`)}
              className={`
                ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
                rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
                ${selectedPage === "user" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
              `}
            >
              <div className="flex items-center">
                <UserCircle2 className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
                {!isDesktopSidebarCollapsed && (
                  <span className="text-md font-semibold">Profile</span>
                )}
              </div>
            </SidebarItem>
          )}
          {/* Dashboard if admin*/}
          {current_user?.admin && (
            <SidebarItem
              onClick={() => navigate("/dashboard")}
              className={`
                ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
                rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
                ${selectedPage === "dashboard" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
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
              onClick={() => navigate("/settings")}
              className={`
                ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
                rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
                ${selectedPage === "settings" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
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
          {/* Comprar nitro */}
          
          <SidebarItem
            onClick={() =>{ !current_user?.nitro ? navigate("/comprar-nitro") : null}}
            className={`
            ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
            rounded-lg 
            !text-gray-300
            
            active:!bg-gradient-to-r active:from-violet-700 active:to-fuchsia-700
            ${!current_user?.nitro ? "" : "bg-gradient-to-r from-violet-700 to-fuchsia-700" }
            hocus:!bg-gradient-to-r hocus:from-violet-700 hocus:to-fuchsia-700
            hocus:shadow-lg
            transition-all 
            active:scale-95 
            cursor-pointer
          `}
                  >
            <div className="flex items-center">
              <Crown className={`${isDesktopSidebarCollapsed ? "md:w-7 md:h-7" : "w-7 h-7 mr-4"}`} />
              {!isDesktopSidebarCollapsed && (
                <span className="text-md font-semibold">{!current_user?.nitro ? "Get Nitro" : "Nitro Active"}</span>
              )}
            </div>
          </SidebarItem>
          

          {/* Login / Logout */}
          <SidebarItem
            onClick={() => { navigate(current_user ? "/logout" : "/login"); current_user ? logout : undefined }}
            className={`
              ${isDesktopSidebarCollapsed ? "md:aspect-square md:w-12 md:justify-center" : ""} 
              rounded-lg !text-gray-300 active:!bg-gray-700 hocus:!bg-gray-700 transition-colors 
              ${selectedPage === "login" ? "cursor-default !text-white !bg-gray-700" : "cursor-pointer"}
            `}
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

