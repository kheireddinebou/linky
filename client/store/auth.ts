import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: Cookies.get("token") || null,
      isAuthenticated: false,
      isLoading: false,
      setUser: user => set({ user, isAuthenticated: true }),
      setToken: token => {
        Cookies.set("token", token, { expires: 7 });
        set({ token, isAuthenticated: true });
      },
      logout: () => {
        Cookies.remove("token");
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoading: isLoading => set({ isLoading }),
    }),
    {
      name: "linky",
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
