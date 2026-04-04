import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search users
router.get("/", protect, async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};

        const users = await User.find(keyword)
            .find({ _id: { $ne: req.user._id } })
            .select("-password")
            .limit(20);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.put("/profile", protect, upload.single("avatar"), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.body.name) user.name = req.body.name;

        if (req.file) {
            try {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: "vartalap/avatars",
                    width: 200,
                    height: 200,
                    crop: "fill",
                });
                user.avatar = result.secure_url;
            } catch (uploadErr) {
                // If cloudinary fails, just skip avatar update
                console.log("Avatar upload skipped (Cloudinary not configured)");
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
