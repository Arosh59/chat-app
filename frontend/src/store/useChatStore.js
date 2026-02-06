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

    // Listen for message delivery updates
    socket.on("messageDelivered", (data) => {
      const { messageId, status } = data;
      const updatedMessages = get().messages.map((msg) =>
        msg._id === messageId ? { ...msg, status } : msg
      );
      set({ messages: updatedMessages });
    });

    // Listen for message read receipts
    socket.on("messageReadReceipt", (data) => {
      const { messageId, status } = data;
      const updatedMessages = get().messages.map((msg) =>
        msg._id === messageId ? { ...msg, status } : msg
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = UseAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("newCommunityMessage");
      socket.off("messageDelivered");
      socket.off("messageReadReceipt");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, selectedCommunity: null }),
  setSelectedCommunity: (selectedCommunity) => set({ selectedCommunity, selectedUser: null }),

  createCommunity: async (communityData) => {
    try {
      const res = await axiosInstance.post("/communities/create", communityData);
      toast.success("Community created successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create community");
    }
  },

  joinCommunity: async (communityId) => {
    try {
      const res = await axiosInstance.post(`/communities/${communityId}/join`);
      toast.success("Joined community successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to join community");
    }
  },

  leaveCommunity: async (communityId) => {
    try {
      await axiosInstance.post(`/communities/${communityId}/leave`);
      toast.success("Left community successfully!");
    } catch (error) {
      toast.error("Failed to leave community");
    }
  },

  updateCommunity: async (communityId, communityData) => {
    try {
      const res = await axiosInstance.put(`/communities/${communityId}`, communityData);
      toast.success("Community updated successfully!");
      return res.data;
    } catch (error) {
      toast.error("Failed to update community");
    }
  },
}));