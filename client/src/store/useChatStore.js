import { create } from "zustand";
import API from "../config/api.js";

const useChatStore = create((set, get) => ({
    chats: [],
    selectedChat: null,
    messages: [],
    notifications: [],
    onlineUsers: [],
    loadingChats: false,
    loadingMessages: false,

    setOnlineUsers: (users) => set({ onlineUsers: users }),

    addOnlineUser: (userId) => {
        const { onlineUsers } = get();
        if (!onlineUsers.includes(userId)) {
            set({ onlineUsers: [...onlineUsers, userId] });
        }
    },

    removeOnlineUser: (userId) => {
        const { onlineUsers } = get();
        set({ onlineUsers: onlineUsers.filter((id) => id !== userId) });
    },

    fetchChats: async () => {
        set({ loadingChats: true });
        try {
            const { data } = await API.get("/chats");
            set({ chats: data });
        } catch (err) {
            console.error("Failed to fetch chats:", err);
        } finally {
            set({ loadingChats: false });
        }
    },

    setSelectedChat: (chat) => {
        set({ selectedChat: chat, messages: [] });
    },

    fetchMessages: async (chatId) => {
        set({ loadingMessages: true });
        try {
            const { data } = await API.get(`/messages/${chatId}`);
            set({ messages: data });
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            set({ loadingMessages: false });
        }
    },

    sendMessage: async (content, chatId) => {
        try {
            const { data } = await API.post("/messages", { content, chatId });
            set((state) => ({ messages: [...state.messages, data] }));
            // Update latest message in chat list
            set((state) => ({
                chats: state.chats.map((c) =>
                    c._id === chatId ? { ...c, latestMessage: data } : c
                ),
            }));
            return data;
        } catch (err) {
            console.error("Failed to send message:", err);
            throw err;
        }
    },

    addMessage: (message) => {
        set((state) => {
            // Only add if it's for the currently selected chat
            if (state.selectedChat && state.selectedChat._id === message.chat._id) {
                // Avoid duplicates
                const exists = state.messages.find((m) => m._id === message._id);
                if (exists) return {};
                return { messages: [...state.messages, message] };
            }
            return {};
        });
        // Update chat list latest message
        set((state) => ({
            chats: state.chats.map((c) =>
                c._id === message.chat._id ? { ...c, latestMessage: message } : c
            ),
        }));
    },

    addNotification: (message) => {
        set((state) => {
            // Check if notification for this chat already exists
            const exists = state.notifications.find(
                (n) => n.chat._id === message.chat._id
            );
            if (exists) {
                return {
                    notifications: state.notifications.map((n) =>
                        n.chat._id === message.chat._id
                            ? { ...n, count: (n.count || 1) + 1 }
                            : n
                    ),
                };
            }
            return {
                notifications: [...state.notifications, { ...message, count: 1 }],
            };
        });
    },

    removeNotification: (chatId) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.chat._id !== chatId),
        }));
    },

    accessChat: async (userId) => {
        try {
            const { data } = await API.post("/chats", { userId });
            set((state) => {
                const exists = state.chats.find((c) => c._id === data._id);
                if (!exists) {
                    return { chats: [data, ...state.chats], selectedChat: data };
                }
                return { selectedChat: data };
            });
            return data;
        } catch (err) {
            console.error("Failed to access chat:", err);
            throw err;
        }
    },

    createGroup: async (name, users) => {
        try {
            const { data } = await API.post("/chats/group", { name, users });
            set((state) => ({
                chats: [data, ...state.chats],
                selectedChat: data,
            }));
            return data;
        } catch (err) {
            console.error("Failed to create group:", err);
            throw err;
        }
    },

    renameGroup: async (chatId, chatName) => {
        try {
            const { data } = await API.put("/chats/group/rename", { chatId, chatName });
            set((state) => ({
                chats: state.chats.map((c) => (c._id === chatId ? data : c)),
                selectedChat:
                    state.selectedChat?._id === chatId ? data : state.selectedChat,
            }));
            return data;
        } catch (err) {
            console.error("Failed to rename group:", err);
            throw err;
        }
    },

    addToGroup: async (chatId, userId) => {
        try {
            const { data } = await API.put("/chats/group/add", { chatId, userId });
            set((state) => ({
                chats: state.chats.map((c) => (c._id === chatId ? data : c)),
                selectedChat:
                    state.selectedChat?._id === chatId ? data : state.selectedChat,
            }));
            return data;
        } catch (err) {
            console.error("Failed to add to group:", err);
            throw err;
        }
    },

    removeFromGroup: async (chatId, userId) => {
        try {
            const { data } = await API.put("/chats/group/remove", { chatId, userId });
            set((state) => ({
                chats: state.chats.map((c) => (c._id === chatId ? data : c)),
                selectedChat:
                    state.selectedChat?._id === chatId ? data : state.selectedChat,
            }));
            return data;
        } catch (err) {
            console.error("Failed to remove from group:", err);
            throw err;
        }
    },
}));

export default useChatStore;
