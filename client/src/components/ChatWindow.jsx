import { useState, useEffect, useRef, useCallback } from "react";
import { HiPaperAirplane, HiPhoto, HiArrowLeft, HiEllipsisVertical, HiInformationCircle, HiPaperClip, HiXMark } from "react-icons/hi2";
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
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat._id);
            const socket = getSocket();
            socket.emit("join chat", selectedChat._id);
            // Reset file states when chat changes
            setSelectedFile(null);
            setFilePreview(null);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null); // No preview for non-images
            }
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async (e) => {
        e?.preventDefault();

        if (!newMessage.trim() && !selectedFile) return;

        const socket = getSocket();
        socket.emit("stop typing", selectedChat._id);
        setIsTyping(false);

        const content = newMessage;
        const file = selectedFile;

        setNewMessage("");
        clearFile();
        setSending(true);

        try {
            const data = await sendMessage({ content, chatId: selectedChat._id, file });
            socket.emit("new message", data);
        } catch (err) {
            setNewMessage(content);
            setSelectedFile(file);
        } finally {
            setSending(false);
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
        <div className="chat-window-container">
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
                                    isOwn={item.data.sender._id === user._id || item.data.sender === user._id}
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
                {selectedFile && (
                    <div className="file-preview-bar animate-slide-up">
                        <div className="preview-content">
                            {filePreview ? (
                                <img src={filePreview} alt="preview" className="img-preview" />
                            ) : (
                                <div className="doc-preview">
                                    <HiPaperClip />
                                    <span>{selectedFile.name}</span>
                                </div>
                            )}
                            <button className="clear-file-btn" onClick={clearFile}>
                                <HiXMark />
                            </button>
                        </div>
                    </div>
                )}
                <form className="message-input-wrapper" onSubmit={handleSend}>
                    <button
                        type="button"
                        className="icon-btn attachment-btn"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <HiPaperClip />
                    </button>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        className="message-input"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={(!newMessage.trim() && !selectedFile) || sending}
                    >
                        {sending ? <div className="small-spinner"></div> : <HiPaperAirplane />}
                    </button>
                </form>
            </div>

            {showGroupInfo && selectedChat?.isGroupChat && (
                <GroupInfoModal chat={selectedChat} onClose={() => setShowGroupInfo(false)} />
            )}
        </div>
    );
};

export default ChatWindow;
