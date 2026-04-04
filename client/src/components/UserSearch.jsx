import { useState, useEffect } from "react";
import { HiXMark, HiMagnifyingGlass } from "react-icons/hi2";
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
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose}></div>
            <div className="search-drawer">
                <div className="drawer-header">
                    <button className="icon-btn" onClick={onClose}>
                        <HiXMark />
                    </button>
                    <h3>New Chat</h3>
                </div>
                <div className="sidebar-search">
                    <div className="search-input-wrapper">
                        <HiMagnifyingGlass className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="search-results">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : results.length === 0 && search.trim() ? (
                        <div className="no-chats">
                            <p>No users found</p>
                        </div>
                    ) : (
                        results.map((u) => (
                            <div
                                key={u._id}
                                className="search-result-item"
                                onClick={() => handleAccessChat(u._id)}
                            >
                                {u.avatar ? (
                                    <img src={u.avatar} alt="" className="avatar-img" style={{ width: "42px", height: "42px" }} />
                                ) : (
                                    <div className="avatar-placeholder" style={{ width: "42px", height: "42px", fontSize: "15px" }}>
                                        {getInitials(u.name)}
                                    </div>
                                )}
                                <div>
                                    <div className="name">{u.name}</div>
                                    <div className="email">{u.email}</div>
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
