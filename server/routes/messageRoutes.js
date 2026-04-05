import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Send a message
router.post("/", protect, upload.single("file"), async (req, res) => {
    try {
        const { content, chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ message: "ChatId is required" });
        }

        let fileUrl = "";
        let fileType = "";

        if (req.file) {
            try {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;

                let resourceType = "auto";
                if (req.file.mimetype.startsWith("image/")) resourceType = "image";
                else if (req.file.mimetype.startsWith("video/")) resourceType = "video";
                else resourceType = "raw";

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: "vartalap/messages",
                    resource_type: resourceType,
                });

                fileUrl = result.secure_url;

                if (req.file.mimetype.startsWith("image/")) fileType = "image";
                else if (req.file.mimetype.startsWith("video/")) fileType = "video";
                else if (req.file.mimetype.startsWith("audio/")) fileType = "audio";
                else fileType = "doc";
            } catch (uploadErr) {
                console.log("File upload failed", uploadErr);
            }
        }

        if (!content && !fileUrl) {
            return res.status(400).json({ message: "Message content or file required" });
        }

        let message = await Message.create({
            sender: req.user._id,
            content: content || "",
            fileUrl: fileUrl,
            fileType: fileType,
            chat: chatId,
            readBy: [req.user._id],
        });

        message = await message.populate("sender", "name avatar");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name email avatar",
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all messages for a chat
router.get("/:chatId", protect, async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name avatar email")
            .populate("chat");

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
