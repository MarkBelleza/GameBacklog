import 'dotenv/config'; //This is important so that we can use the environment variables in our .env file. It loads the environment variables from the .env file into process.env.
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/authMiddleware.js';
import gameRoutes from './routes/games.js';
import igdbRoutes from './routes/igdb.js';


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL
    //Allows request only from our vercel frontend or our local
}));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/games', gameRoutes);

app.use('/api/igdb', igdbRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        commit: process.env.RENDER_GIT_COMMIT || 'local' //RENDER_GIT_COMMIT is an environment variable Render automatically provides.
    });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route.', user: req.user });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});