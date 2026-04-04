import { HiXMark } from "react-icons/hi2";

const ProfileModal = ({ user, onClose }) => {
    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>My Profile</h3>
                    <button className="modal-close" onClick={onClose}>
                        <HiXMark />
                    </button>
                </div>

                <div className="profile-section">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="" className="profile-avatar-large" />
                    ) : (
                        <div className="profile-avatar-placeholder-large">
                            {getInitials(user?.name)}
                        </div>
                    )}
                    <div className="profile-name">{user?.name}</div>
                    <div className="profile-email">{user?.email}</div>
                </div>

                <div style={{ padding: "12px 0", borderTop: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Member since</span>
                        <span style={{ fontSize: "13px" }}>
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })
                                : "—"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
