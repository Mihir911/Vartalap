import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, trim: true },
        image: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
        fileType: { type: String, enum: ["image", "video", "audio", "doc", ""], default: "" },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
