import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {

        // Validate input fields -------------
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long." });
        }

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail }
            ]
        });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }
        // *End* ------------- 

        // Hash the password and create a new user -------------

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(201).json({
            message: "User registered successfully.",
            token,
            user: {
                id: newUser._id.toString(),
                username: newUser.username,
                email: newUser.email
            }
        });
        // *End* ------------- 

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email is already registered."
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong during registration."
        });
    }
});

export default router;

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json(
                { message: "Please provide both email and password." }
            );
        }

        //Find the user by email
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        //Compare the submitted password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        //Create an authentication token
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Something went wrong during login."
        });
    }
});