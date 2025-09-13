import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from 'js-cookie';

export interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthStore {
    user: User | null;
    setUser: (user: User) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user: User) => set({ user }),
            logout: async () => {
                try {
                    console.log("Logging out user:", useAuthStore.getState().user);
                    // Call the logout endpoint to clear server-side cookies
                   // const response = await fetch("http://localhost:3000/api/auth/logout", {
                    //    method: "POST",
                    //    credentials: "include",
                    //});
                        // AGREGAR ESTO CUANDO SE AGREGUE EL LOGOUT !
                   // if (!response.ok) {
                    //    throw new Error("Logout failed");
                    //}

                    // Clear all client-side cookies
                    Object.keys(Cookies.get()).forEach(cookieName => {
                        Cookies.remove(cookieName);
                    });

                    // Clear the local state
                    set({ user: null });
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