const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
app.use(cors());
app.use(express.json());

// Arrays to store users and messages in memory
let users = [];
let messages = [];

// User registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };
    users.push(user);
    res.status(201).send('User created');
});

// User login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).send('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid password');
    const token = jwt.sign({ username: user.username }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});

// Get messages
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// Send message
app.post('/api/messages', (req, res) => {
    const { text } = req.body;
    const message = { text };
    messages.push(message);
    res.status(201).json(message);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
