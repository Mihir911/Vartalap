import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        chatName: { type: String, trim: true, default: "Direct Message" },
        isGroupChat: { type: Boolean, default: false },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        groupAvatar: { type: String, default: "" },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
