import { useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore.js";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const { login, register } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                toast.success("Welcome back! 👋");
            } else {
                if (!formData.name.trim()) {
                    toast.error("Name is required");
                    setLoading(false);
                    return;
                }
                await register(formData.name, formData.email, formData.password);
                toast.success("Account created! 🎉");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div style={{ marginBottom: "8px" }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <defs>
                                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            <rect width="48" height="48" rx="14" fill="url(#logoGrad)" />
                            <path
                                d="M14 16C14 14.8954 14.8954 14 16 14H32C33.1046 14 34 14.8954 34 16V28C34 29.1046 33.1046 30 32 30H22L17 34V30H16C14.8954 30 14 29.1046 14 28V16Z"
                                fill="white"
                                fillOpacity="0.9"
                            />
                            <circle cx="21" cy="22" r="1.5" fill="#8b5cf6" />
                            <circle cx="27" cy="22" r="1.5" fill="#8b5cf6" />
                        </svg>
                    </div>
                    <h1>Vartalap</h1>
                    <p>Connect, Chat, Converse</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group animate-fade-in">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <span className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                                {isLogin ? "Signing in..." : "Creating account..."}
                            </span>
                        ) : isLogin ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                        fontSize: "13px",
                        color: "var(--text-muted)",
                    }}
                >
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: "var(--accent-secondary)", cursor: "pointer", fontWeight: "500" }}
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
