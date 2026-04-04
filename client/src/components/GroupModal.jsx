import { useState, useEffect } from "react";
import { HiXMark, HiMagnifyingGlass } from "react-icons/hi2";
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
            try {
                const { data } = await API.get(`/users?search=${search}`);
                setResults(data);
            } catch (err) {
                // silent
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const handleAddUser = (user) => {
        if (selectedUsers.find((u) => u._id === user._id)) {
            toast.error("User already added");
            return;
        }
        setSelectedUsers([...selectedUsers, user]);
        setSearch("");
        setResults([]);
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
    };

    const handleCreate = async () => {
        if (!groupName.trim()) {
            toast.error("Group name is required");
            return;
        }
        if (selectedUsers.length < 2) {
            toast.error("Add at least 2 members");
            return;
        }

        setLoading(true);
        try {
            await createGroup(
                groupName,
                selectedUsers.map((u) => u._id)
            );
            toast.success("Group created! 🎉");
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create Group Chat</h3>
                    <button className="modal-close" onClick={onClose}>
                        <HiXMark />
                    </button>
                </div>

                <div className="auth-form">
                    <div className="form-group">
                        <label>Group Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Project Team"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Add Members</label>
                        <div className="search-input-wrapper">
                            <HiMagnifyingGlass className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search users to add..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="user-tags">
                            {selectedUsers.map((u) => (
                                <div key={u._id} className="user-tag">
                                    {u.name}
                                    <button onClick={() => handleRemoveUser(u._id)}>
                                        <HiXMark />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                            {results.map((u) => (
                                <div
                                    key={u._id}
                                    className="search-result-item"
                                    onClick={() => handleAddUser(u)}
                                >
                                    {u.avatar ? (
                                        <img src={u.avatar} alt="" className="avatar-img" style={{ width: "36px", height: "36px" }} />
                                    ) : (
                                        <div className="avatar-placeholder small">
                                            {getInitials(u.name)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="name">{u.name}</div>
                                        <div className="email">{u.email}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Group"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupModal;
