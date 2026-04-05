const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const BOT_TOKEN = '8677995221:AAE9sjlttcj08hn9W3PIUeIu6lEx9C7oikg';
const CHAT_ID = '7211752234';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).send();
    next();
});

app.post('/api/telegram', upload.any(), async (req, res) => {
    try {
        const { type, text, caption } = req.body;

        if (type === 'message' && text) {
            const response = await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                { chat_id: CHAT_ID, text: text, parse_mode: 'HTML' }
            );
            return res.json({ ok: true });
        }

        if (type === 'photo' && req.files && req.files[0]) {
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('photo', req.files[0].buffer, { filename: req.files[0].originalname });
            if (caption) formData.append('caption', caption);
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, formData, {
                headers: formData.getHeaders()
            });
            return res.json({ ok: true });
        }

        if (type === 'audio' && req.files && req.files[0]) {
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('audio', req.files[0].buffer, { filename: req.files[0].originalname });
            if (caption) formData.append('caption', caption);
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, formData, {
                headers: formData.getHeaders()
            });
            return res.json({ ok: true });
        }

        res.json({ ok: false, error: 'Invalid request' });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.json({ ok: false, error: error.message });
    }
});

app.get('/', (req, res) => res.send('Telegram Bot Backend Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
