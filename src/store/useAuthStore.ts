import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from 'js-cookie';
import { LogoutUser } from "../hooks/user";

export interface AuthStorageUser {
    id: string;
    pfp?: string;
    admin?: boolean;
}

interface AuthStore {
    user: AuthStorageUser | null;
    setUser: (user: AuthStorageUser) => void;
    setAdmin: (isAdmin:boolean) => void;
    logout: () => Promise<void>;
    // Sidebar state
    isMobileSidebarOpen: boolean;
    isDesktopSidebarCollapsed: boolean;
    setMobileSidebarOpen: (isOpen: boolean) => void;
    setDesktopSidebarCollapsed: (isCollapsed: boolean) => void;
    // Editor theme
    editorTheme: string;
    setEditorTheme: (theme: string) => void;
    sourceCode: string;
    setSourceCode: (code: string) => void;
    gridSize: number;
    setGridSize: (size: number) => void;
    snippet: number;
    setSnippet: (snippet: number) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user: AuthStorageUser) => set({ user }),
            setAdmin: (isAdmin: boolean) => set((state) => ({ user: state.user ? { ...state.user, admin: isAdmin} : null })),
            // Sidebar state
            isMobileSidebarOpen: false,
            gridSize: 64,
            setGridSize: (size: number) => set({ gridSize: size }),
            snippet: 0,
            setSnippet: (snippet: number) => set({ snippet }),
            isDesktopSidebarCollapsed: false,
            sourceCode: '', // Add default value for code
            setSourceCode: (code: string) => set({ sourceCode: code }),
            setMobileSidebarOpen: (isOpen: boolean) => set({ isMobileSidebarOpen: isOpen }),
            setDesktopSidebarCollapsed: (isCollapsed: boolean) => set({ isDesktopSidebarCollapsed: isCollapsed }),
            // Editor theme
            editorTheme: 'dracula',
            setEditorTheme: (theme: string) => set({ editorTheme: theme }),
            logout: async () => {
                try {
                    console.log("Logging out user:", useAuthStore.getState().user);
                    set({ user: null });
                    set({ snippet: 0 });
                    await LogoutUser();

                    // Clear all client-side cookies
                    Object.keys(Cookies.get()).forEach(cookieName => {
                        Cookies.remove(cookieName);
                    });

                    // Clear the local state
                    
                } catch (error) {
                    console.error("Logout error:", error);
                    throw error;
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);