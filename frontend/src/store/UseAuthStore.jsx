import {create} from "zustand";

export const UseAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
}));