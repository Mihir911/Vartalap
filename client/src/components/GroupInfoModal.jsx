import { useState, useEffect } from "react";
import { HiXMark, HiMagnifyingGlass, HiUserPlus, HiPencil } from "react-icons/hi2";
import useChatStore from "../store/useChatStore.js";
import useAuthStore from "../store/useAuthStore.js";
import API from "../config/api.js";
import toast from "react-hot-toast";

const GroupInfoModal = ({ chat, onClose }) => {
    const { user } = useAuthStore();
    const { renameGroup, addToGroup, removeFromGroup, setSelectedChat } = useChatStore();
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState(chat.chatName);
    const [showAddUser, setShowAddUser] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);

    const isAdmin = chat.groupAdmin?._id === user._id;

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const { data } = await API.get(`/users?search=${search}`);
                // Filter out users already in group
                const filtered = data.filter(
                    (u) => !chat.users.find((cu) => cu._id === u._id)
                );
                setResults(filtered);
            } catch (err) {
                // silent
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search, chat.users]);

    const handleRename = async () => {
        if (!newName.trim() || newName === chat.chatName) {
            setEditingName(false);
            return;
        }
        try {
            await renameGroup(chat._id, newName);
            setEditingName(false);
            toast.success("Group renamed");
        } catch (err) {
            toast.error("Failed to rename group");
        }
    };

    const handleAdd = async (userId) => {
        try {
            await addToGroup(chat._id, userId);
            setSearch("");
            setResults([]);
            toast.success("Member added");
        } catch (err) {
            toast.error("Failed to add member");
        }
    };

    const handleRemove = async (userId) => {
        try {
            await removeFromGroup(chat._id, userId);
            if (userId === user._id) {
                setSelectedChat(null);
                onClose();
                toast.success("You left the group");
            } else {
                toast.success("Member removed");
            }
        } catch (err) {
            toast.error("Failed to remove member");
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Group Info</h3>
                    <button className="modal-close" onClick={onClose}>
                        <HiXMark />
                    </button>
                </div>

                <div className="profile-section">
                    <div className="profile-avatar-placeholder-large" style={{ fontSize: "32px" }}>
                        G
                    </div>
                    {editingName ? (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
                            <input
                                type="text"
                                className="form-input"
                                style={{ width: "200px", padding: "8px 12px" }}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            />
                            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={handleRename}>
                                Save
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" }}>
                            <span className="profile-name">{chat.chatName}</span>
                            {isAdmin && (
                                <button
                                    className="icon-btn"
                                    style={{ width: "28px", height: "28px", fontSize: "14px" }}
                                    onClick={() => setEditingName(true)}
                                >
                                    <HiPencil />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="profile-email" style={{ marginTop: "4px" }}>
                        {chat.users.length} members
                    </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>Members</span>
                        {isAdmin && (
                            <button
                                className="icon-btn"
                                style={{ width: "30px", height: "30px", fontSize: "16px" }}
                                onClick={() => setShowAddUser(!showAddUser)}
                            >
                                <HiUserPlus />
                            </button>
                        )}
                    </div>

                    {showAddUser && (
                        <div style={{ marginBottom: "12px" }}>
                            <div className="search-input-wrapper">
                                <HiMagnifyingGlass className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search users to add..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {results.length > 0 && (
                                <div style={{ maxHeight: "120px", overflowY: "auto", marginTop: "8px" }}>
                                    {results.map((u) => (
                                        <div
                                            key={u._id}
                                            className="search-result-item"
                                            onClick={() => handleAdd(u._id)}
                                        >
                                            <div className="avatar-placeholder small">{getInitials(u.name)}</div>
                                            <div>
                                                <div className="name">{u.name}</div>
                                                <div className="email">{u.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="group-members-list">
                        {chat.users.map((member) => (
                            <div key={member._id} className="group-member-item">
                                {member.avatar ? (
                                    <img src={member.avatar} alt="" className="avatar-img" style={{ width: "36px", height: "36px" }} />
                                ) : (
                                    <div className="avatar-placeholder small">{getInitials(member.name)}</div>
                                )}
                                <div className="member-info">
                                    <span className="member-name">
                                        {member.name}
                                        {member._id === user._id && " (You)"}
                                    </span>
                                </div>
                                {chat.groupAdmin?._id === member._id && (
                                    <span className="admin-badge">Admin</span>
                                )}
                                {isAdmin && member._id !== user._id && (
                                    <button
                                        className="remove-member-btn"
                                        onClick={() => handleRemove(member._id)}
                                        title="Remove"
                                    >
                                        <HiXMark />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn-primary"
                        style={{
                            width: "100%",
                            marginTop: "16px",
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "var(--danger)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                        onClick={() => handleRemove(user._id)}
                    >
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupInfoModal;
