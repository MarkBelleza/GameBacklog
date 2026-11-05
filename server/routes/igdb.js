import express from 'express';
import { makeIGDBRequest } from '../services/igdbService.js';

const router = express.Router();

//GET /api/igdb/recently-released
router.get('/recently-released', async (req, res) => {
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000);

        const games = await makeIGDBRequest(
            'games',
            `
                fields id, name, first_release_date, cover.url;
                where first_release_date != null
                    & first_release_date <= ${currentTimestamp};
                sort first_release_date desc;
                limit 30;
            `
        );

        return res.status(200).json(games);
    } catch (error) {
        console.error('Error fetching recently released games:', error);
        return res.status(500).json({ message: 'Error fetching recently released games' });
    }
});


// GET /api/igdb/search?query=gameName
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({
                message: 'Query parameter is required and must be a non-empty string.'
            });
        }

        const games = await makeIGDBRequest(
            'games',
            `
                fields id, name, first_release_date, cover.url;
                search "${query.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";
                limit 20;
            `
        );
        return res.status(200).json(games);
    } catch (error) {
        console.error('Error searching IGDB games:', error);

        return res.status(500).json({
            message: 'Error searching games'
        });
    }
})

export default router;