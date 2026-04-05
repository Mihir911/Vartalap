import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiCamera, HiUser, HiIdentification, HiHashtag, HiInformationCircle } from "react-icons/hi2";
import useAuthStore from "../store/useAuthStore.js";
import API from "../config/api.js";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { user, updateProfile } = useAuthStore();
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [gender, setGender] = useState(user?.gender || "");
    const [preview, setPreview] = useState(user?.avatar || "");
    const [loading, setLoading] = useState(false);

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
            const formData = new FormData();
            formData.append("name", name);
            formData.append("bio", bio);
            formData.append("gender", gender);
            if (fileInputRef.current.files[0]) {
                formData.append("avatar", fileInputRef.current.files[0]);
            }

            const { data } = await API.put("/users/profile", formData);
            updateProfile(data);
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page animate-fade-in">
            <div className="profile-header">
                <button className="icon-btn" onClick={() => navigate("/chats")}>
                    <HiArrowLeft />
                </button>
                <h2>My Profile</h2>
            </div>

            <div className="profile-container">
                <form className="profile-form" onSubmit={handleUpdate}>
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            {preview ? (
                                <img src={preview} alt="Avatar" className="profile-avatar" />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                type="button"
                                className="camera-btn"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <HiCamera />
                            </button>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>
                        <p className="avatar-hint">Click the camera icon to update your photo</p>
                    </div>

                    <div className="form-group">
                        <label>
                            <HiUser /> Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <HiIdentification /> Email Address
                        </label>
                        <input type="email" value={user?.email} className="form-input" disabled />
                    </div>

                    <div className="form-group">
                        <label>
                            <HiHashtag /> Gender
                        </label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            <HiInformationCircle /> Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="form-input"
                            placeholder="Tell us something about yourself..."
                            rows="4"
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Updating..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
