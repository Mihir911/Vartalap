import { useEffect, useState, useCallback } from "react";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";
import { getSocket, disconnectSocket } from "../config/socket.js";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { HiChatBubbleLeftRight } from "react-icons/hi2";

const ChatPage = () => {
    const { user } = useAuthStore();
    const {
        selectedChat,
        fetchChats,
        addMessage,
        addNotification,
        setOnlineUsers,
        addOnlineUser,
        removeOnlineUser,
    } = useChatStore();

    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [typingChatId, setTypingChatId] = useState(null);
    const [showSidebarMobile, setShowSidebarMobile] = useState(true);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        if (!user) return;

        const socket = getSocket();

        socket.emit("setup", user._id);

        socket.on("connected", () => {
            setSocketConnected(true);
        });

        socket.on("online users", (users) => {
            setOnlineUsers(users);
        });

        socket.on("user online", (userId) => {
            addOnlineUser(userId);
        });

        socket.on("user offline", (userId) => {
            removeOnlineUser(userId);
        });

        socket.on("typing", (chatId) => {
            setTyping(true);
            setTypingChatId(chatId);
        });

        socket.on("stop typing", () => {
            setTyping(false);
            setTypingChatId(null);
        });

        socket.on("message received", (newMessage) => {
            const currentChat = useChatStore.getState().selectedChat;
            if (!currentChat || currentChat._id !== newMessage.chat._id) {
                addNotification(newMessage);
            } else {
                addMessage(newMessage);
            }
            // Re-fetch chats to update order
            fetchChats();
        });

        return () => {
            socket.off("connected");
            socket.off("online users");
            socket.off("user online");
            socket.off("user offline");
            socket.off("typing");
            socket.off("stop typing");
            socket.off("message received");
            disconnectSocket();
        };
    }, [user]);

    const handleSelectChat = useCallback(() => {
        setShowSidebarMobile(false);
    }, []);

    const handleBackToSidebar = useCallback(() => {
        setShowSidebarMobile(true);
    }, []);

    return (
        <div className="chat-page">
            <ChatSidebar
                className={selectedChat && !showSidebarMobile ? "hidden-mobile" : ""}
                onSelectChat={handleSelectChat}
            />
            <div className="chat-main">
                {selectedChat ? (
                    <ChatWindow
                        typing={typing && typingChatId === selectedChat._id}
                        socketConnected={socketConnected}
                        onBack={handleBackToSidebar}
                    />
                ) : (
                    <div className="chat-empty">
                        <HiChatBubbleLeftRight className="empty-icon" />
                        <h3>Welcome to Vartalap</h3>
                        <p>Select a conversation or start a new chat to begin messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
