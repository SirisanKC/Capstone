const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allows Frontend (3000) to talk to Backend (5000)

// 1. DATABASE CONNECTION
mongoose.connect('mongodb://localhost:27017/capstone_db')
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2. USER SCHEMA (The blueprint for your users)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'researcher'], required: true }
});
const User = mongoose.model('User', UserSchema);

// 3. REGISTRATION ROUTE
app.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("User already exists");

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();
    
    console.log(`New user created: ${email} as ${role}`);
    res.status(201).send("Account created successfully!");
  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
});

// 4. LOGIN ROUTE
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    // Create Token (Wristband)
    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        'YOUR_SECRET_KEY', 
        { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));