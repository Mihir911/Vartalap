import { useState, useEffect, useRef, useCallback } from "react";
import { HiPaperAirplane, HiPhoto, HiArrowLeft, HiEllipsisVertical, HiInformationCircle } from "react-icons/hi2";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";
import { getSocket } from "../config/socket.js";
import MessageBubble from "./MessageBubble.jsx";
import GroupInfoModal from "./GroupInfoModal.jsx";

const ChatWindow = ({ typing, socketConnected, onBack }) => {
    const { user } = useAuthStore();
    const { selectedChat, messages, fetchMessages, sendMessage, loadingMessages, onlineUsers } =
        useChatStore();

    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat._id);
            const socket = getSocket();
            socket.emit("join chat", selectedChat._id);
        }
    }, [selectedChat, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const getOtherUser = useCallback(() => {
        if (!selectedChat || !user) return null;
        if (selectedChat.isGroupChat) return null;
        return selectedChat.users.find((u) => u._id !== user._id);
    }, [selectedChat, user]);

    const getChatTitle = () => {
        if (!selectedChat) return "";
        if (selectedChat.isGroupChat) return selectedChat.chatName;
        const otherUser = getOtherUser();
        return otherUser ? otherUser.name : "Unknown";
    };

    const getStatusText = () => {
        if (typing) return null; // Will show typing indicator instead
        if (selectedChat?.isGroupChat) {
            return `${selectedChat.users.length} members`;
        }
        const otherUser = getOtherUser();
        if (otherUser && onlineUsers.includes(otherUser._id)) {
            return "Online";
        }
        return "Offline";
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;
        const socket = getSocket();

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop typing", selectedChat._id);
            setIsTyping(false);
        }, 2000);
    };

    const handleSend = async (e) => {
        e?.preventDefault();

        if (!newMessage.trim()) return;

        const socket = getSocket();
        socket.emit("stop typing", selectedChat._id);
        setIsTyping(false);

        const content = newMessage;
        setNewMessage("");

        try {
            const data = await sendMessage(content, selectedChat._id);
            socket.emit("new message", data);
        } catch (err) {
            setNewMessage(content);
        }

        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    // Group messages by date
    const groupedMessages = [];
    let lastDate = "";
    messages.forEach((msg) => {
        const msgDate = new Date(msg.createdAt).toLocaleDateString();
        if (msgDate !== lastDate) {
            groupedMessages.push({ type: "date", date: msgDate, id: `date-${msgDate}` });
            lastDate = msgDate;
        }
        groupedMessages.push({ type: "message", data: msg, id: msg._id });
    });

    const otherUser = getOtherUser();

    return (
        <>
            <div className="chat-header">
                <div className="chat-header-info">
                    <button className="icon-btn back-btn" onClick={onBack}>
                        <HiArrowLeft />
                    </button>
                    <div className="avatar" style={{ cursor: selectedChat?.isGroupChat ? "pointer" : "default" }} onClick={() => selectedChat?.isGroupChat && setShowGroupInfo(true)}>
                        {otherUser?.avatar ? (
                            <img src={otherUser.avatar} alt="" className="avatar-img" style={{ width: "40px", height: "40px" }} />
                        ) : (
                            <div className="avatar-placeholder" style={{ width: "40px", height: "40px", fontSize: "15px" }}>
                                {selectedChat?.isGroupChat ? "G" : getInitials(getChatTitle())}
                            </div>
                        )}
                        {otherUser && onlineUsers.includes(otherUser._id) && (
                            <span className="online-badge" style={{ borderColor: "var(--bg-secondary)" }}></span>
                        )}
                    </div>
                    <div className="chat-header-text">
                        <h3>{getChatTitle()}</h3>
                        {typing ? (
                            <p className="typing-text">typing...</p>
                        ) : (
                            <p style={{ color: getStatusText() === "Online" ? "var(--success)" : "var(--text-muted)" }}>
                                {getStatusText()}
                            </p>
                        )}
                    </div>
                </div>
                <div className="chat-header-actions">
                    {selectedChat?.isGroupChat && (
                        <button className="icon-btn" onClick={() => setShowGroupInfo(true)}>
                            <HiInformationCircle />
                        </button>
                    )}
                </div>
            </div>

            <div className="messages-container">
                {loadingMessages ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {groupedMessages.map((item) => {
                            if (item.type === "date") {
                                return (
                                    <div key={item.id} className="date-separator">
                                        <span>{item.date === new Date().toLocaleDateString() ? "Today" : item.date}</span>
                                    </div>
                                );
                            }
                            return (
                                <MessageBubble
                                    key={item.id}
                                    message={item.data}
                                    isOwn={item.data.sender._id === user._id}
                                    showSender={selectedChat?.isGroupChat}
                                />
                            );
                        })}

                        {typing && (
                            <div className="message-wrapper received animate-fade-in">
                                <div className="typing-indicator">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="message-input-area">
                <form className="message-input-wrapper" onSubmit={handleSend}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="message-input"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={!newMessage.trim()}
                    >
                        <HiPaperAirplane />
                    </button>
                </form>
            </div>

            {showGroupInfo && selectedChat?.isGroupChat && (
                <GroupInfoModal chat={selectedChat} onClose={() => setShowGroupInfo(false)} />
            )}
        </>
    );
};

export default ChatWindow;
