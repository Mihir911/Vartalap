import { useState, useCallback } from "react";
import { HiMagnifyingGlass, HiUserGroup, HiArrowRightOnRectangle, HiPlus } from "react-icons/hi2";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";
import useThemeStore from "../store/useThemeStore.js";
import UserSearch from "./UserSearch.jsx";
import GroupModal from "./GroupModal.jsx";
import { useNavigate } from "react-router-dom";
import { HiMoon, HiSun } from "react-icons/hi2";

const ChatSidebar = ({ className = "", onSelectChat }) => {
    const { user, logout } = useAuthStore();
    const { chats, selectedChat, setSelectedChat, notifications, removeNotification, onlineUsers } = useChatStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [filterText, setFilterText] = useState("");

    const getOtherUser = useCallback(
        (chat) => {
            if (!chat.users || !user) return null;
            return chat.users.find((u) => u._id !== user._id);
        },
        [user]
    );

    const getChatName = useCallback(
        (chat) => {
            if (chat.isGroupChat) return chat.chatName;
            const otherUser = getOtherUser(chat);
            return otherUser ? otherUser.name : "Unknown";
        },
        [getOtherUser]
    );

    const getChatAvatar = useCallback(
        (chat) => {
            if (chat.isGroupChat) return null;
            const otherUser = getOtherUser(chat);
            return otherUser?.avatar || null;
        },
        [getOtherUser]
    );

    const isUserOnline = useCallback(
        (chat) => {
            if (chat.isGroupChat) return false;
            const otherUser = getOtherUser(chat);
            return otherUser ? onlineUsers.includes(otherUser._id) : false;
        },
        [getOtherUser, onlineUsers]
    );

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    const getNotificationCount = (chatId) => {
        const notif = notifications.find((n) => n.chat._id === chatId);
        return notif ? notif.count : 0;
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        if (diff < 86400000) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        if (diff < 604800000) {
            return date.toLocaleDateString([], { weekday: "short" });
        }
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    const filteredChats = chats.filter((chat) => {
        if (!filterText) return true;
        const name = getChatName(chat).toLowerCase();
        return name.includes(filterText.toLowerCase());
    });

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        removeNotification(chat._id);
        onSelectChat?.();
    };

    return (
        <>
            <div className={`chat-sidebar ${className}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                            <defs>
                                <linearGradient id="sidebarLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            <rect width="48" height="48" rx="14" fill="url(#sidebarLogoGrad)" />
                            <path
                                d="M14 16C14 14.8954 14.8954 14 16 14H32C33.1046 14 34 14.8954 34 16V28C34 29.1046 33.1046 30 32 30H22L17 34V30H16C14.8954 30 14 29.1046 14 28V16Z"
                                fill="white"
                                fillOpacity="0.9"
                            />
                            <circle cx="21" cy="22" r="1.5" fill="#8b5cf6" />
                            <circle cx="27" cy="22" r="1.5" fill="#8b5cf6" />
                        </svg>
                        <h2>Vartalap</h2>
                    </div>
                    <div className="sidebar-actions">
                        <button className="icon-btn" title="Toggle Theme" onClick={toggleTheme}>
                            {theme === "dark" ? <HiSun /> : <HiMoon />}
                        </button>
                        <button className="icon-btn" title="New Chat" onClick={() => setShowSearch(true)}>
                            <HiPlus />
                        </button>
                        <button className="icon-btn" title="New Group" onClick={() => setShowGroupModal(true)}>
                            <HiUserGroup />
                        </button>
                    </div>
                </div>

                <div className="sidebar-search">
                    <div className="search-input-wrapper">
                        <HiMagnifyingGlass className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search conversations..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="chat-list">
                    {filteredChats.length === 0 ? (
                        <div className="no-chats">
                            <p>No conversations yet.<br />Start chatting!</p>
                        </div>
                    ) : (
                        filteredChats.map((chat) => {
                            const notifCount = getNotificationCount(chat._id);
                            return (
                                <div
                                    key={chat._id}
                                    className={`chat-item ${selectedChat?._id === chat._id ? "active" : ""}`}
                                    onClick={() => handleSelectChat(chat)}
                                >
                                    <div className="avatar">
                                        {getChatAvatar(chat) ? (
                                            <img src={getChatAvatar(chat)} alt="" className="avatar-img" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {chat.isGroupChat ? (
                                                    <HiUserGroup style={{ fontSize: "20px" }} />
                                                ) : (
                                                    getInitials(getChatName(chat))
                                                )}
                                            </div>
                                        )}
                                        {isUserOnline(chat) && <span className="online-badge"></span>}
                                    </div>
                                    <div className="chat-item-info">
                                        <div className="chat-item-name">
                                            <span>{getChatName(chat)}</span>
                                            <span className="time">
                                                {chat.latestMessage && formatTime(chat.latestMessage.createdAt || chat.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="chat-item-preview">
                                            <span>
                                                {chat.latestMessage
                                                    ? chat.latestMessage.sender?.name
                                                        ? `${chat.latestMessage.sender._id === user._id ? "You" : chat.latestMessage.sender.name.split(" ")[0]}: ${chat.latestMessage.content || "📷 Image"}`
                                                        : chat.latestMessage.content || "📷 Image"
                                                    : "No messages yet"}
                                            </span>
                                            {notifCount > 0 && (
                                                <span className="unread-badge">{notifCount}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="sidebar-user">
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/profile")}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="avatar-img" style={{ width: "36px", height: "36px" }} />
                        ) : (
                            <div className="avatar-placeholder small">
                                {getInitials(user?.name)}
                            </div>
                        )}
                    </div>
                    <div className="sidebar-user-info" style={{ cursor: "pointer" }} onClick={() => navigate("/profile")}>
                        <div className="name">{user?.name}</div>
                        <div className="email">{user?.email}</div>
                    </div>
                    <button className="logout-btn" title="Logout" onClick={logout}>
                        <HiArrowRightOnRectangle />
                    </button>
                </div>
            </div>

            {showSearch && <UserSearch onClose={() => setShowSearch(false)} />}
            {showGroupModal && <GroupModal onClose={() => setShowGroupModal(false)} />}
        </>
    );
};

export default ChatSidebar;
