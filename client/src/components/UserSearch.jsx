import { useState, useEffect } from "react";
import { HiXMark, HiMagnifyingGlass, HiUser } from "react-icons/hi2";
import API from "../config/api.js";
import useChatStore from "../store/useChatStore.js";
import toast from "react-hot-toast";

const UserSearch = ({ onClose }) => {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { accessChat } = useChatStore();

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

    const handleAccessChat = async (userId) => {
        try {
            await accessChat(userId);
            onClose();
        } catch (err) {
            toast.error("Failed to access chat");
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
                width: '450px',
                maxHeight: '600px',
                borderRadius: '24px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div className="drawer-header" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)' }}>
                    <h3>Start a New Convo</h3>
                    <button className="icon-btn" onClick={onClose}>
                        <HiXMark />
                    </button>
                </div>

                <div className="sidebar-search" style={{ padding: '20px' }}>
                    <div className="search-input-wrapper">
                        <HiMagnifyingGlass className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Type a name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="search-results" style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : results.length === 0 && search.trim() ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <p>No spirits found with that name.</p>
                        </div>
                    ) : (
                        results.map((u) => (
                            <div
                                key={u._id}
                                className="chat-item"
                                onClick={() => handleAccessChat(u._id)}
                            >
                                <div className="avatar">
                                    <div className="avatar-wrapper" style={{ width: '48px', height: '48px' }}>
                                        {u.avatar ? (
                                            <img src={u.avatar} alt="" className="avatar-img" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {getInitials(u.name)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="chat-info">
                                    <div className="chat-name">{u.name}</div>
                                    <div className="chat-preview">{u.email}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default UserSearch;
