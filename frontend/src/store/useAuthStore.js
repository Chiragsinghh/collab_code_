import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  login: async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5001/auth/login', { email, password });
      
      set({ user: data, token: data.token });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Login failed" };
    }
  },

  signup: async (name, email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5001/auth/signup', { name, email, password });

      set({ user: data, token: data.token });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Signup failed" };
    }
  },

  googleLogin: async (credential) => {
    try {
      const { data } = await axios.post('http://localhost:5001/auth/google', { credential });

      set({ user: data, token: data.token });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      return { success: true };
    } catch (error) {
      return { success: false, error: "Google login failed" };
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
