import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { UseAuthStore } from "./UseAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  communities: [], // NEW: Store for age groups
  selectedUser: null,
  selectedCommunity: null, // NEW: Active group
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // NEW: Fetch groups based on logged-in user's age
  getCommunities: async () => {
    try {
      const res = await axiosInstance.get("/communities");
      set({ communities: res.data });
    } catch (error) {
      toast.error("Failed to load communities");
    }
  },

  getMessages: async (id, isCommunity = false) => {
    set({ isMessagesLoading: true });
    try {
      // Determine which API to call based on type
      const endpoint = isCommunity ? `/communities/messages/${id}` : `/messages/${id}`;
      const res = await axiosInstance.get(endpoint);
      set({ messages: res.data });
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, selectedCommunity, messages } = get();
    try {
      let res;
      if (selectedCommunity) {
        // NEW: Send to community API
        res = await axiosInstance.post(`/communities/send/${selectedCommunity._id}`, messageData);
      } else {
        // Existing: Send to private user API
        res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      }
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, selectedCommunity } = get();
    if (!selectedUser && !selectedCommunity) return;

    const socket = UseAuthStore.getState().socket;
    if (!socket) return;

    // Listen for Private Messages
    socket.on("newMessage", (newMessage) => {
      const isChattingWithSender = selectedUser && newMessage.senderId === selectedUser._id;
      if (isChattingWithSender) {
        set({ messages: [...get().messages, newMessage] });
      }
    });

    // NEW: Listen for Community Messages
    socket.on("newCommunityMessage", (newMessage) => {
      const isSameGroup = selectedCommunity && newMessage.groupId === selectedCommunity._id;
      if (isSameGroup) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = UseAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("newCommunityMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, selectedCommunity: null }),
  
  // NEW: Helper to switch to community view
  setSelectedCommunity: (selectedCommunity) => {
    set({ selectedCommunity, selectedUser: null });
    if (selectedCommunity) {
      const socket = UseAuthStore.getState().socket;
      socket.emit("joinCommunity", selectedCommunity._id);
    }
  },
}));