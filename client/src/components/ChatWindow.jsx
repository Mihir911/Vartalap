import { useState, useEffect, useRef, useCallback } from "react";
import { HiPaperAirplane, HiArrowLeft, HiInformationCircle, HiPaperClip, HiXMark, HiPhone, HiVideoCamera, HiUserGroup, HiDocumentText } from "react-icons/hi2";
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
                setFilePreview(null);
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

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    const isUserOnline = (chat) => {
        if (!chat || chat.isGroupChat) return false;
        const otherUser = chat.users.find((u) => u._id !== user._id);
        return otherUser ? onlineUsers.includes(otherUser._id) : false;
    };

    const otherUser = getOtherUser();

    return (
        <div className="chat-main">
            <header className="chat-header">
                <div className="chat-header-info">
                    <button className="icon-btn back-btn" onClick={onBack}>
                        <HiArrowLeft />
                    </button>
                    <div className="avatar" style={{ cursor: selectedChat?.isGroupChat ? "pointer" : "default" }} onClick={() => selectedChat?.isGroupChat && setShowGroupInfo(true)}>
                        <div className="avatar-wrapper" style={{ width: "48px", height: "48px" }}>
                            {otherUser?.avatar ? (
                                <img src={otherUser.avatar} alt="" className="avatar-img" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {selectedChat?.isGroupChat ? <HiUserGroup style={{ fontSize: "24px" }} /> : getInitials(getChatTitle())}
                                </div>
                            )}
                            {isUserOnline(selectedChat) && <span className="online-badge"></span>}
                        </div>
                    </div>
                    <div className="chat-header-text">
                        <h3>{getChatTitle()}</h3>
                        {typing ? (
                            <p className="typing-text">typing...</p>
                        ) : (
                            <p>{selectedChat?.isGroupChat ? `${selectedChat.users?.length} members` : isUserOnline(selectedChat) ? "Online" : "Offline"}</p>
                        )}
                    </div>
                </div>
                <div className="chat-header-actions">
                    <button className="icon-btn" title="Phone Call">
                        <HiPhone />
                    </button>
                    <button className="icon-btn" title="Video Call">
                        <HiVideoCamera />
                    </button>
                    <button className="icon-btn" title="Information" onClick={() => selectedChat?.isGroupChat && setShowGroupInfo(true)}>
                        <HiInformationCircle />
                    </button>
                </div>
            </header>

            <div className="messages-container">
                {loadingMessages ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {messages.map((m, index) => (
                            <MessageBubble
                                key={m._id}
                                message={m}
                                isSent={m.sender._id === user._id || m.sender === user._id}
                                isLastMessage={index === messages.length - 1}
                            />
                        ))}
                        {typing && (
                            <div className="message-wrapper received" style={{ padding: "10px 0" }}>
                                <div className="typing-indicator" style={{ background: "rgba(255,255,255,0.05)", padding: "12px 20px", borderRadius: "18px" }}>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="message-input-area">
                {selectedFile && (
                    <div className="file-preview-bar animate-up" style={{ marginBottom: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.05)", padding: "12px", display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" style={{ width: "50px", height: "50px", borderRadius: "12px", objectFit: "cover" }} />
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "white" }}>
                                <HiDocumentText style={{ fontSize: "24px", color: "var(--secondary-glow)" }} />
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>{selectedFile?.name}</span>
                            </div>
                        )}
                        <button
                            className="icon-btn"
                            onClick={clearFile}
                            style={{ position: "absolute", top: "-10px", right: "-10px", width: "28px", height: "28px", fontSize: "16px", background: "#ef4444", color: "white" }}
                        >
                            <HiXMark />
                        </button>
                    </div>
                )}
                <div className="input-box">
                    <button className="attach-btn" onClick={() => fileInputRef.current.click()}>
                        <HiPaperClip />
                    </button>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <form
                        onSubmit={handleSend}
                        style={{ flex: 1, display: "flex", gap: "12px" }}
                    >
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={handleTyping}
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            className="send-btn"
                            disabled={(!newMessage.trim() && !selectedFile) || sending}
                        >
                            {sending ? <div className="spinner" style={{ width: "20px", height: "20px" }}></div> : <HiPaperAirplane />}
                        </button>
                    </form>
                </div>
            </div>

            {showGroupInfo && selectedChat?.isGroupChat && (
                <GroupInfoModal chat={selectedChat} onClose={() => setShowGroupInfo(false)} />
            )}
        </div>
    );
};

export default ChatWindow;
