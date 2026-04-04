import express from "express";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Access or create 1-on-1 chat
router.post("/", protect, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "UserId required" });
        }

        let chat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email avatar",
        });

        if (chat.length > 0) {
            return res.json(chat[0]);
        }

        const newChat = await Chat.create({
            chatName: "Direct Message",
            isGroupChat: false,
            users: [req.user._id, userId],
        });

        const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
            "users",
            "-password"
        );

        res.status(201).json(fullChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all chats for logged-in user
router.get("/", protect, async (req, res) => {
    try {
        let chats = await Chat.find({
            users: { $elemMatch: { $eq: req.user._id } },
        })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        chats = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name email avatar",
        });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create group chat
router.post("/group", protect, async (req, res) => {
    try {
        const { name, users } = req.body;

        if (!name || !users || users.length < 2) {
            return res
                .status(400)
                .json({ message: "Group needs a name and at least 2 other members" });
        }

        const groupUsers = [...users, req.user._id];

        const groupChat = await Chat.create({
            chatName: name,
            isGroupChat: true,
            users: groupUsers,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(201).json(fullGroupChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rename group
router.put("/group/rename", protect, async (req, res) => {
    try {
        const { chatId, chatName } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add user to group
router.put("/group/add", protect, async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const added = await Chat.findByIdAndUpdate(
            chatId,
            { $addToSet: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.json(added);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove user from group
router.put("/group/remove", protect, async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const removed = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.json(removed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
