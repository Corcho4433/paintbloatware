import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
    id: string
    name: string
    email: string
}

interface AuthState {
    user: User | null
    login: (user: User) => void
    logout: () => void
    setUser: (user: User | null) => void
}

const clearAllCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            login: (user) => set({ user }),
            logout: () => {
                set({ user: null })
                clearAllCookies()
                localStorage.clear()
                sessionStorage.clear()
            },
            setUser: (user) => set({ user }),
        }),
        {
            name: "auth-storage",
        },
    ),
)
