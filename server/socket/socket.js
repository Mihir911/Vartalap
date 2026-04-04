import User from "../models/User.js";

const onlineUsers = new Map();

const initSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("⚡ Socket connected:", socket.id);

        // User setup - join personal room
        socket.on("setup", async (userId) => {
            socket.join(userId);
            onlineUsers.set(userId, socket.id);

            try {
                await User.findByIdAndUpdate(userId, { isOnline: true });
            } catch (err) {
                // silent
            }

            // Broadcast online status
            socket.broadcast.emit("user online", userId);

            // Send current online users to the newly connected user
            socket.emit("online users", Array.from(onlineUsers.keys()));
        });

        // Join a chat room
        socket.on("join chat", (chatId) => {
            socket.join(chatId);
        });

        // Typing indicators
        socket.on("typing", (chatId) => {
            socket.to(chatId).emit("typing", chatId);
        });

        socket.on("stop typing", (chatId) => {
            socket.to(chatId).emit("stop typing", chatId);
        });

        // New message
        socket.on("new message", (newMessage) => {
            const chat = newMessage.chat;

            if (!chat.users) return;

            chat.users.forEach((user) => {
                if (user._id === newMessage.sender._id) return;
                socket.to(user._id).emit("message received", newMessage);
            });
        });

        // Disconnect
        socket.on("disconnect", async () => {
            console.log("🔌 Socket disconnected:", socket.id);

            let disconnectedUserId = null;
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    break;
                }
            }

            if (disconnectedUserId) {
                onlineUsers.delete(disconnectedUserId);

                try {
                    await User.findByIdAndUpdate(disconnectedUserId, { isOnline: false });
                } catch (err) {
                    // silent
                }

                socket.broadcast.emit("user offline", disconnectedUserId);
            }
        });
    });
};

export default initSocket;
