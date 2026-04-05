import { useState, useEffect, useRef, useCallback } from "react";
import { HiPaperAirplane, HiArrowLeft, HiInformationCircle, HiPaperClip, HiXMark, HiPhone, HiVideoCamera, HiUserGroup, HiDocument } from "react-icons/hi2";
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
        if (selectedChat?._id) {
            fetchMessages(selectedChat._id);
            const socket = getSocket();
            socket.emit("join chat", selectedChat._id);
            setSelectedFile(null);
            setFilePreview(null);
        }
    }, [selectedChat?._id, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const getOtherUser = useCallback(() => {
        if (!selectedChat?.users || !user) return null;
        if (selectedChat.isGroupChat) return null;
        return selectedChat.users.find((u) => u._id !== user._id);
    }, [selectedChat, user]);

    const getChatTitle = () => {
        if (!selectedChat) return "";
        if (selectedChat.isGroupChat) return selectedChat.chatName || "Group Chat";
        const otherUser = getOtherUser();
        return otherUser ? otherUser.name : "Unknown Spirit";
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected || !selectedChat?._id) return;
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
        if ((!newMessage.trim() && !selectedFile) || !selectedChat?._id) return;

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
        if (!chat?.users || chat.isGroupChat || !user) return false;
        const otherUser = chat.users.find((u) => u._id !== user._id);
        return otherUser ? onlineUsers.includes(otherUser._id) : false;
    };

    const otherUser = getOtherUser();

    if (!selectedChat) return null;

    return (
        <div className="chat-window-content">
            <header className="chat-header">
                <div className="chat-header-info">
                    <button className="icon-btn back-btn" onClick={onBack} aria-label="Go back to list">
                        <HiArrowLeft />
                    </button>
                    <div className="avatar" style={{ cursor: selectedChat.isGroupChat ? "pointer" : "default" }} onClick={() => selectedChat.isGroupChat && setShowGroupInfo(true)}>
                        <div className="avatar-wrapper">
                            {otherUser?.avatar ? (
                                <img src={otherUser.avatar} alt="" className="avatar-img" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {selectedChat.isGroupChat ? <HiUserGroup className="group-avatar-icon" /> : getInitials(getChatTitle())}
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
                            <p>{selectedChat.isGroupChat ? `${selectedChat.users?.length || 0} members` : isUserOnline(selectedChat) ? "Online" : "Offline"}</p>
                        )}
                    </div>
                </div>
                <div className="chat-header-actions">
                    <button className="icon-btn" title="Phone Call" aria-label="Start Voice Call">
                        <HiPhone />
                    </button>
                    <button className="icon-btn" title="Video Call" aria-label="Start Video Call">
                        <HiVideoCamera />
                    </button>
                    <button className="icon-btn" title="Information" aria-label="Show chat details" onClick={() => selectedChat.isGroupChat && setShowGroupInfo(true)}>
                        <HiInformationCircle />
                    </button>
                </div>
            </header>

            <div className="messages-container">
                {loadingMessages ? (
                    <div className="chat-loading-spinner">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {messages && messages.map((m, index) => (
                            <MessageBubble
                                key={m._id}
                                message={m}
                                isSent={m.sender?._id === user?._id || m.sender === user?._id}
                                isLastMessage={index === messages.length - 1}
                            />
                        ))}
                        {typing && (
                            <div className="message-wrapper received typing-wrapper">
                                <div className="typing-indicator-bubble">
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
                    <div className="file-preview-bar animate-up">
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" className="img-preview-thumb" />
                        ) : (
                            <div className="doc-preview-thumb">
                                <HiDocument />
                                <span>{selectedFile?.name}</span>
                            </div>
                        )}
                        <button
                            className="icon-btn clear-preview-btn"
                            onClick={clearFile}
                            aria-label="Remove attachment"
                        >
                            <HiXMark />
                        </button>
                    </div>
                )}
                <div className="input-box">
                    <button className="attach-btn" onClick={() => fileInputRef.current.click()} aria-label="Attach file">
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
                        className="message-send-form"
                    >
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={handleTyping}
                            disabled={sending}
                            ref={inputRef}
                            aria-label="Message content"
                        />
                        <button
                            type="submit"
                            className="send-btn"
                            disabled={(!newMessage.trim() && !selectedFile) || sending}
                            aria-label="Send message"
                        >
                            {sending ? <div className="spinner small-spinner"></div> : <HiPaperAirplane />}
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
