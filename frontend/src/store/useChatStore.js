import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { UseAuthStore } from "./UseAuthStore"; // Import this to get the socket

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // --- SOCKET REAL-TIME LOGIC START ---
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    // Get the socket instance from your AuthStore
    const socket = UseAuthStore.getState().socket;

    // Clean up any existing listeners first to avoid duplicate messages
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      // Only add message if it's from the person currently open in the chat
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = UseAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },
  // --- SOCKET REAL-TIME LOGIC END ---

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));