import { useState, useEffect } from "react";
import { HiXMark, HiMagnifyingGlass, HiUserPlus, HiPencil, HiCheck, HiUserMinus } from "react-icons/hi2";
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
            toast.success("Group renamed! ✏️");
        } catch (err) {
            toast.error("Failed to rename group");
        }
    };

    const handleAdd = async (userId) => {
        try {
            await addToGroup(chat._id, userId);
            setSearch("");
            setResults([]);
            toast.success("New member added! 👤");
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
                toast.success("You left the sanctuary. 🚪");
            } else {
                toast.success("Member removed. 💨");
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
        <>
            <div className="drawer-overlay" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}></div>
            <div className="search-drawer glass-container animate-up" style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '460px',
                maxHeight: '80vh',
                borderRadius: '32px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div className="drawer-header" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Group Sanctuary</h3>
                    <button className="icon-btn" onClick={onClose}>
                        <HiXMark />
                    </button>
                </div>

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <div className="profile-section" style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div className="avatar" style={{ margin: '0 auto 16px', width: '80px', height: '80px' }}>
                            <div className="avatar-wrapper" style={{ width: '100%', height: '100%' }}>
                                <div className="avatar-placeholder" style={{ fontSize: "32px", borderRadius: '24px' }}>
                                    G
                                </div>
                            </div>
                        </div>

                        {editingName ? (
                            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                                <div className="search-input-wrapper" style={{ width: '240px', height: '44px' }}>
                                    <input
                                        type="text"
                                        className="search-input"
                                        style={{ height: '100%', borderRadius: '12px' }}
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                                    />
                                </div>
                                <button className="primary-btn" style={{ padding: "0 16px", borderRadius: '12px' }} onClick={handleRename}>
                                    <HiCheck />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "4px" }}>
                                <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{chat.chatName}</h2>
                                {isAdmin && (
                                    <button
                                        className="icon-btn"
                                        style={{ width: "32px", height: "32px", fontSize: "16px" }}
                                        onClick={() => setEditingName(true)}
                                    >
                                        <HiPencil />
                                    </button>
                                )}
                            </div>
                        )}
                        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>{chat.users.length} spirits in harmony</p>
                    </div>

                    <div className="members-section" style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <span style={{ fontWeight: "700", fontSize: "15px", color: 'var(--text-white)' }}>Members</span>
                            {isAdmin && (
                                <button
                                    className="icon-btn"
                                    style={{ width: "36px", height: "36px", fontSize: "18px" }}
                                    onClick={() => setShowAddUser(!showAddUser)}
                                >
                                    <HiUserPlus />
                                </button>
                            )}
                        </div>

                        {showAddUser && (
                            <div className="animate-fade-in" style={{ marginBottom: "20px" }}>
                                <div className="search-input-wrapper" style={{ height: '48px' }}>
                                    <HiMagnifyingGlass className="search-icon" />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Invoke new spirits..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                {results.length > 0 && (
                                    <div style={{ maxHeight: "150px", overflowY: "auto", marginTop: "12px", background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '8px' }}>
                                        {results.map((u) => (
                                            <div
                                                key={u._id}
                                                className="chat-item"
                                                onClick={() => handleAdd(u._id)}
                                                style={{ padding: '8px 12px' }}
                                            >
                                                <div className="avatar" style={{ width: '36px', height: '36px', marginRight: '12px' }}>
                                                    <div className="avatar-wrapper" style={{ width: '100%', height: '100%' }}>
                                                        <div className="avatar-placeholder" style={{ fontSize: '13px' }}>{getInitials(u.name)}</div>
                                                    </div>
                                                </div>
                                                <div className="chat-info">
                                                    <div className="chat-name" style={{ fontSize: '14px' }}>{u.name}</div>
                                                </div>
                                                <HiUserPlus style={{ marginLeft: 'auto', color: 'var(--primary-glow)' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="group-members-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {chat.users.map((member) => (
                                <div key={member._id} className="chat-item" style={{ cursor: 'default' }}>
                                    <div className="avatar" style={{ width: '40px', height: '40px', marginRight: '14px' }}>
                                        <div className="avatar-wrapper" style={{ width: '100%', height: '100%' }}>
                                            {member.avatar ? (
                                                <img src={member.avatar} alt="" className="avatar-img" />
                                            ) : (
                                                <div className="avatar-placeholder" style={{ fontSize: '14px' }}>{getInitials(member.name)}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="chat-info">
                                        <div className="chat-name" style={{ fontSize: '15px' }}>
                                            {member.name}
                                            {member._id === user._id && <span style={{ color: 'var(--text-dim)', fontWeight: '400', fontSize: '13px', marginLeft: '6px' }}>(You)</span>}
                                        </div>
                                        {chat.groupAdmin?._id === member._id && (
                                            <div style={{ fontSize: '11px', color: 'var(--primary-glow)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</div>
                                        )}
                                    </div>
                                    {isAdmin && member._id !== user._id && (
                                        <button
                                            className="icon-btn"
                                            style={{ width: "32px", height: "32px", fontSize: "16px", background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                            onClick={() => handleRemove(member._id)}
                                            title="Banish Member"
                                        >
                                            <HiUserMinus />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ padding: '24px 32px', background: 'rgba(0,0,0,0.2)' }}>
                    <button
                        className="primary-btn"
                        style={{
                            width: "100%",
                            height: '52px',
                            justifyContent: 'center',
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: '16px'
                        }}
                        onClick={() => handleRemove(user._id)}
                    >
                        Leave Sanctuary
                    </button>
                </div>
            </div>
        </>
    );
};

export default GroupInfoModal;
