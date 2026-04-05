import { useState, useEffect } from "react";
import { HiXMark, HiMagnifyingGlass, HiUserPlus, HiUserMinus, HiCheck } from "react-icons/hi2";
import API from "../config/api.js";
import useChatStore from "../store/useChatStore.js";
import toast from "react-hot-toast";

const GroupModal = ({ onClose }) => {
    const [groupName, setGroupName] = useState("");
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { createGroup } = useChatStore();

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/users?search=${search}`);
                setResults(data);
            } catch (err) {
                toast.error("Failed to search users");
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSelect = (user) => {
        if (selectedUsers.find((u) => u._id === user._id)) {
            setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) {
            toast.error("Please provide a name and at least 2 members");
            return;
        }

        try {
            await createGroup(groupName, selectedUsers.map((u) => u._id));
            toast.success("Group created! 🚀");
            onClose();
        } catch (err) {
            toast.error("Failed to create group");
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
                width: '500px',
                height: '700px',
                borderRadius: '32px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div className="drawer-header" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Create Group</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>Bring your squad together</p>
                    </div>
                    <button className="icon-btn" onClick={onClose}>
                        <HiXMark />
                    </button>
                </div>

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <div className="input-group" style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', paddingLeft: '4px', marginBottom: '8px', display: 'block' }}>Group Name</label>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="e.g. The Avengers"
                            style={{ width: '100%', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0 20px', color: 'white' }}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', paddingLeft: '4px', marginBottom: '8px', display: 'block' }}>Add Members ({selectedUsers.length})</label>
                        <div className="search-input-wrapper" style={{ height: '52px' }}>
                            <HiMagnifyingGlass className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                            {selectedUsers.map((u) => (
                                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-glow)', color: 'white', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                    <span>{u.name.split(" ")[0]}</span>
                                    <HiXMark style={{ cursor: 'pointer' }} onClick={() => handleSelect(u)} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="search-results">
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            results.map((u) => {
                                const isSelected = selectedUsers.find((user) => user._id === u._id);
                                return (
                                    <div
                                        key={u._id}
                                        className={`chat-item ${isSelected ? 'active' : ''}`}
                                        onClick={() => handleSelect(u)}
                                        style={{ marginBottom: '8px' }}
                                    >
                                        <div className="avatar">
                                            <div className="avatar-wrapper" style={{ width: '42px', height: '42px' }}>
                                                {u.avatar ? (
                                                    <img src={u.avatar} alt="" className="avatar-img" />
                                                ) : (
                                                    <div className="avatar-placeholder" style={{ fontSize: '14px' }}>
                                                        {getInitials(u.name)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="chat-info">
                                            <div className="chat-name">{u.name}</div>
                                            <div className="chat-preview">{u.email}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}>
                                            {isSelected ? (
                                                <HiUserMinus style={{ color: '#ef4444', fontSize: '20px' }} />
                                            ) : (
                                                <HiUserPlus style={{ color: 'var(--primary-glow)', fontSize: '20px' }} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="modal-footer" style={{ padding: '24px 32px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="primary-btn" onClick={handleCreate} style={{ width: '100%', height: '52px', justifyContent: 'center', borderRadius: '16px' }}>
                        <HiCheck style={{ fontSize: '20px' }} />
                        Create Group Workspace
                    </button>
                </div>
            </div>
        </>
    );
};

export default GroupModal;
