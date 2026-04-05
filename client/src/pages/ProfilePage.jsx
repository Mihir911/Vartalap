import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    HiArrowLeft,
    HiCamera,
    HiUser,
    HiIdentification,
    HiHashtag,
    HiInformationCircle,
    HiEnvelope,
    HiShieldCheck,
    HiCheckCircle
} from "react-icons/hi2";
import useAuthStore from "../store/useAuthStore.js";
import API from "../config/api.js";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { user, updateProfile } = useAuthStore();
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [formData, setFormData] = useState({
        name: user?.name || "",
        bio: user?.bio || "",
        gender: user?.gender || "",
    });
    const [preview, setPreview] = useState(user?.avatar || "");
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const changed =
            formData.name !== (user?.name || "") ||
            formData.bio !== (user?.bio || "") ||
            formData.gender !== (user?.gender || "") ||
            preview !== (user?.avatar || "");
        setHasChanges(changed);
    }, [formData, preview, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToUpload = new FormData();
            dataToUpload.append("name", formData.name);
            dataToUpload.append("bio", formData.bio);
            dataToUpload.append("gender", formData.gender);

            if (fileInputRef.current.files[0]) {
                dataToUpload.append("avatar", fileInputRef.current.files[0]);
            }

            const { data } = await API.put("/users/profile", dataToUpload);
            updateProfile(data);
            toast.success("Profile updated successfully!");
            setHasChanges(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page-wrapper">
            <header className="profile-navbar">
                <div className="navbar-container">
                    <button className="back-link" onClick={() => navigate("/chats")}>
                        <HiArrowLeft />
                        <span>Back to Chats</span>
                    </button>
                    <h1>Edit Profile</h1>
                    <div style={{ width: "100px" }}></div> {/* Spacer */}
                </div>
            </header>

            <main className="profile-main-content">
                <form className="profile-layout" onSubmit={handleUpdate}>
                    {/* Left Column: Avatar & Quick Info */}
                    <aside className="profile-sidebar">
                        <section className="glass-card avatar-card">
                            <div className="avatar-picker">
                                <div className="avatar-canvas">
                                    {preview ? (
                                        <img src={preview} alt="Avatar" className="large-avatar" />
                                    ) : (
                                        <div className="large-avatar-placeholder">
                                            {formData.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="avatar-edit-btn"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <HiCamera />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <h3>{user?.name}</h3>
                                <p className="user-email-badge">
                                    <HiShieldCheck /> Verified User
                                </p>
                            </div>
                        </section>

                        <section className="glass-card status-card">
                            <div className="status-item">
                                <span className="label">Account Status</span>
                                <span className="value success">Active</span>
                            </div>
                            <div className="status-item">
                                <span className="label">Member Since</span>
                                <span className="value">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Just now"}
                                </span>
                            </div>
                        </section>
                    </aside>

                    {/* Right Column: Detailed Settings */}
                    <div className="profile-settings-area">
                        <section className="glass-card settings-section">
                            <div className="section-header">
                                <HiUser />
                                <h2>Account Information</h2>
                            </div>

                            <div className="settings-grid">
                                <div className="input-group">
                                    <label>Display Name</label>
                                    <div className="input-wrapper">
                                        <HiIdentification />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper disabled">
                                        <HiEnvelope />
                                        <input type="email" value={user?.email} disabled />
                                    </div>
                                    <p className="field-hint">Email cannot be changed</p>
                                </div>
                            </div>
                        </section>

                        <section className="glass-card settings-section">
                            <div className="section-header">
                                <HiInformationCircle />
                                <h2>Personal Details</h2>
                            </div>

                            <div className="settings-grid">
                                <div className="input-group">
                                    <label>Gender Identity</label>
                                    <div className="input-wrapper">
                                        <HiHashtag />
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group full-width">
                                    <label>Short Bio</label>
                                    <div className="input-wrapper textarea-wrapper">
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Tell the world about yourself..."
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="profile-actions">
                            <button
                                type="submit"
                                className={`btn-primary save-btn ${hasChanges ? 'glow' : ''}`}
                                disabled={loading || !hasChanges}
                            >
                                {loading ? (
                                    <div className="btn-loader"></div>
                                ) : (
                                    <>
                                        <HiCheckCircle />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ProfilePage;
