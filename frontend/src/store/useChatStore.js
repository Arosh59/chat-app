import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { UseAuthStore } from "./UseAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  communities: [],
  selectedUser: null,
  selectedCommunity: null,
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
        res = await axiosInstance.post(`/communities/send/${selectedCommunity._id}`, messageData);
      } else {
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

    socket.on("newMessage", (newMessage) => {
      const isChattingWithSender = selectedUser && newMessage.senderId === selectedUser._id;
      if (isChattingWithSender) {
        set({ messages: [...get().messages, newMessage] });
      }
    });

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
  setSelectedCommunity: (selectedCommunity) => set({ selectedCommunity, selectedUser: null }),
}));