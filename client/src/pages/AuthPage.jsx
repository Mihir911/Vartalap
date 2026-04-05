import { useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore.js";
import { HiEnvelope, HiLockClosed, HiUser } from "react-icons/hi2";

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
        <div className="auth-page" style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Mesh Gradient Orbs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

            <div className="auth-card glass-container animate-up" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '48px',
                borderRadius: '32px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1,
                border: '1px solid var(--border-glass)'
            }}>
                <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ marginBottom: "16px", display: 'inline-block' }}>
                        <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                            <defs>
                                <linearGradient id="authLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            <rect width="48" height="48" rx="14" fill="url(#authLogoGrad)" />
                            <path
                                d="M14 16C14 14.8954 14.8954 14 16 14H32C33.1046 14 34 14.8954 34 16V28C34 29.1046 33.1046 30 32 30H22L17 34V30H16C14.8954 30 14 29.1046 14 28V16Z"
                                fill="white"
                                fillOpacity="0.95"
                            />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' }}>Vartalap</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Connect, Chat, Converse</p>
                </div>

                <div className="auth-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '32px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '16px' }}>
                    <button
                        className={`auth-tab ${isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(true)}
                        style={{ flex: 1, border: 'none', background: isLogin ? 'var(--primary-glow)' : 'transparent', color: isLogin ? 'white' : 'var(--text-dim)', padding: '10px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)' }}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(false)}
                        style={{ flex: 1, border: 'none', background: !isLogin ? 'var(--primary-glow)' : 'transparent', color: !isLogin ? 'white' : 'var(--text-dim)', padding: '10px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)' }}
                    >
                        Sign Up
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {!isLogin && (
                        <div className="input-group animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', paddingLeft: '4px' }}>Full Name</label>
                            <div className="search-input-wrapper" style={{ height: '52px' }}>
                                <HiUser className="search-icon" style={{ left: '16px' }} />
                                <input
                                    type="text"
                                    name="name"
                                    className="search-input"
                                    placeholder="John Doe"
                                    style={{ paddingLeft: '48px', height: '100%', borderRadius: '14px' }}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', paddingLeft: '4px' }}>Email Address</label>
                        <div className="search-input-wrapper" style={{ height: '52px' }}>
                            <HiEnvelope className="search-icon" style={{ left: '16px' }} />
                            <input
                                type="email"
                                name="email"
                                className="search-input"
                                placeholder="john@example.com"
                                style={{ paddingLeft: '48px', height: '100%', borderRadius: '14px' }}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', paddingLeft: '4px' }}>Password</label>
                        <div className="search-input-wrapper" style={{ height: '52px' }}>
                            <HiLockClosed className="search-icon" style={{ left: '16px' }} />
                            <input
                                type="password"
                                name="password"
                                className="search-input"
                                placeholder="••••••••"
                                style={{ paddingLeft: '48px', height: '100%', borderRadius: '14px' }}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', height: '52px', justifyContent: 'center', marginTop: '12px', borderRadius: '14px' }}>
                        {loading ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: '2px' }}></div>
                                {isLogin ? "Signing in..." : "Creating account..."}
                            </span>
                        ) : isLogin ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-dim)" }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: "var(--primary-glow)", cursor: "pointer", fontWeight: "700" }}
                    >
                        {isLogin ? "Create one" : "Sign in here"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
