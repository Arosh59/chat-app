import { set } from "mongoose";
import { create } from "zustand";

export const useThemeStore = create ((set) => ({
   setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
   }
}));