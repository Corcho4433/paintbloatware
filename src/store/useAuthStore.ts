import { create } from "zustand";

export interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthStore {
    user: User | null;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
}));