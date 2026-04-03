import { create } from "zustand";
import api from "../utils/api";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,

  // 🔥 LOGIN
  login: async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      const { user, token } = data;

      set({ user, token });

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  },

  // 🔥 SIGNUP
  signup: async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      const { user, token } = data;

      set({ user, token });

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Signup failed",
      };
    }
  },

  // 🔥 GOOGLE LOGIN
  googleLogin: async (credential) => {
    try {
      const { data } = await api.post("/auth/google", { credential });

      const { user, token } = data;

      set({ user, token });

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Google login failed",
      };
    }
  },

  // 🔥 LOGOUT
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;