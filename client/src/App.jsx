import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import useAuthStore from "./store/useAuthStore.js";

function App() {
    const { user } = useAuthStore();

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "rgba(30, 30, 50, 0.95)",
                        color: "#e2e8f0",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "12px",
                        backdropFilter: "blur(10px)",
                    },
                }}
            />
            <Routes>
                <Route path="/" element={user ? <Navigate to="/chats" /> : <AuthPage />} />
                <Route path="/chats" element={user ? <ChatPage /> : <Navigate to="/" />} />
            </Routes>
        </>
    );
}

export default App;
