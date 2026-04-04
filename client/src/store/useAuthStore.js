import { create } from "zustand";
import API from "../config/api.js";

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem("vartalap-user")) || null,

    login: async (email, password) => {
        const { data } = await API.post("/users/login", { email, password });
        localStorage.setItem("vartalap-user", JSON.stringify(data));
        set({ user: data });
        return data;
    },

    register: async (name, email, password) => {
        const { data } = await API.post("/users/register", { name, email, password });
        localStorage.setItem("vartalap-user", JSON.stringify(data));
        set({ user: data });
        return data;
    },

    logout: () => {
        localStorage.removeItem("vartalap-user");
        set({ user: null });
    },

    updateProfile: (updatedUser) => {
        const current = JSON.parse(localStorage.getItem("vartalap-user"));
        const merged = { ...current, ...updatedUser };
        localStorage.setItem("vartalap-user", JSON.stringify(merged));
        set({ user: merged });
    },
}));

export default useAuthStore;
