import { useEffect, useState, useCallback } from "react";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";
import { getSocket, disconnectSocket } from "../config/socket.js";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

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
    }, [user, fetchChats, addMessage, addNotification, setOnlineUsers, addOnlineUser, removeOnlineUser]);

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
                showSidebarMobile={showSidebarMobile}
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
                        <div className="logo animate-up" style={{ marginBottom: '20px' }}>
                            <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
                                <defs>
                                    <linearGradient id="emptyLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                                <rect width="48" height="48" rx="14" fill="url(#emptyLogoGrad)" />
                                <path
                                    d="M14 16C14 14.8954 14.8954 14 16 14H32C33.1046 14 34 14.8954 34 16V28C34 29.1046 33.1046 30 32 30H22L17 34V30H16C14.8954 30 14 29.1046 14 28V16Z"
                                    fill="white"
                                    fillOpacity="0.95"
                                />
                            </svg>
                        </div>
                        <h3 className="animate-up" style={{ animationDelay: '0.1s' }}>Welcome, {user?.name.split(" ")[0]}!</h3>
                        <p className="animate-up" style={{ animationDelay: '0.2s' }}>
                            Select a conversation to start messaging or search for a new friend to begin a journey.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
