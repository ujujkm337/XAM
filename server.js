const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/telegram-clone', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch(err => console.log(err));

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User created');
});

// Вход в систему
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid password');
    const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});

// Получение сообщений
app.get('/api/messages', async (req, res) => {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
});

// Отправка сообщения
app.post('/api/messages', async (req, res) => {
    const { text } = req.body;
    const newMessage = new Message({ text });
    await newMessage.save();
    res.status(201).json(newMessage);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
