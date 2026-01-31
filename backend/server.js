require('dotenv').config(); // MUST be at the very top to read the .env file
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors()); // Allows your React frontend to communicate with this server

// --- DATABASE CONNECTION ---
// We use process.env.MONGO_URI so your password is hidden from GitHub
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ ERROR: MONGO_URI is not defined in the .env file!");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas Cloud"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- USER SCHEMA ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'researcher'], required: true }
});
const User = mongoose.model('User', UserSchema);

// --- ROUTES ---

// 1. Registration Route
app.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("User already exists");

    // Securely hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();
    
    console.log(`New user registered: ${email} (${role})`);
    res.status(201).send("Account created successfully!");
  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
});

// 2. Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    // Generate a secure JWT token
    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET || 'fallback_secret', 
        { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));