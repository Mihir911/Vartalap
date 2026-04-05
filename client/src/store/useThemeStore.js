import { create } from "zustand";

const useThemeStore = create((set) => ({
    theme: localStorage.getItem("vartalap-theme") || "dark",
    setTheme: (theme) => {
        localStorage.setItem("vartalap-theme", theme);
        set({ theme });
    },
    toggleTheme: () => {
        const current = localStorage.getItem("vartalap-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";
        localStorage.setItem("vartalap-theme", next);
        set({ theme: next });
    },
}));

export default useThemeStore;
