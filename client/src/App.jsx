import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import useAuthStore from "./store/useAuthStore.js";
import useThemeStore from "./store/useThemeStore.js";

function App() {
    const { user } = useAuthStore();
    const { theme } = useThemeStore();

    return (
        <div className={theme === "dark" ? "dark-theme" : "light-theme"}>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: theme === "dark" ? "rgba(30, 30, 50, 0.95)" : "#fff",
                        color: theme === "dark" ? "#e2e8f0" : "#1e293b",
                        border: theme === "dark" ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(139, 92, 246, 0.1)",
                        borderRadius: "12px",
                        backdropFilter: "blur(10px)",
                    },
                }}
            />
            <Routes>
                <Route path="/" element={user ? <Navigate to="/chats" /> : <AuthPage />} />
                <Route path="/chats" element={user ? <ChatPage /> : <Navigate to="/" />} />
                <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
