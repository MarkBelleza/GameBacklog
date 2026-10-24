import express from 'express';
import Game from '../models/Game.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/games (Note: This route is protected and requires authentication from the JWT token)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const games = await Game.find({
            userId: req.user.userId
            //req.user is the decoded JWT payload attached by the authMiddleware
            //We need to specify the "userId" property to fetch only the games that belong to the authenticated user
        });

        return res.status(200).json(games);


    } catch (error) {
        console.error('Error fetching games:', error);

        return res.status(500).json({ message: 'Error fetching games' });
    }
})

// POST /api/games (Note: This route is protected and requires authentication from the JWT token)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { gameId } = req.body;


        // Validate the RAWG gameId input
        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({
                message: "A valid game ID is required."
            });
        }

        //Check whether this user has already saved this game
        const existingGame = await Game.findOne({
            userId: req.user.userId,
            gameId: gameId
        });

        if (existingGame) {
            return res.status(409).json({
                message: "This game is already in your backlog."
            });
        }


        // Create the user's game record
        const game = new Game({
            userId: req.user.userId,
            gameId: gameId
        });

        await game.save();

        return res.status(201).json({
            game
        });
    } catch (error) {
        console.error('Error saving game:', error);

        return res.status(500).json({ message: 'Error saving game' });
    }

});

router.patch('/:gameId', authMiddleware, async (req, res) => {
    try {
        const gameId = Number(req.params.gameId);
        const { platform, status, score, note } = req.body;

        // Validate the RAWG gameId input
        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({
                message: "A valid game ID is required."
            });
        }

        const allowedFields = ['platform', 'status', 'score', 'note'];
        const updateData = {};
        const suppliedFields = Object.keys(req.body);

        if (
            suppliedFields.length === 0 ||
            suppliedFields.some(field => !allowedFields.includes(field))
        ) {
            return res.status(400).json({
                message: "Invalid fields in request body. Allowed fields are: platform, status, score, note."
            });
        }

        const allowedPlatforms = ['Steam', 'Epic Games', 'GOG', 'PlayStation', 'Xbox', 'Nintendo', 'Other', null];

        if (
            'platform' in req.body &&
            platform !== null &&
            !allowedPlatforms.includes(platform)
        ) {
            return res.status(400).json({
                message: "Invalid platform. Allowed values are: Steam, Epic Games, GOG, PlayStation, Xbox, Nintendo, Other, or null."
            });
        }

        const allowedStatuses = ['Finished', 'Playing', 'Dropped', null];

        if (
            'status' in req.body &&
            status !== null &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status. Allowed values are: Finished, Playing, Dropped, or null."
            });
        }

        if (
            'score' in req.body &&
            score !== null &&
            (typeof score !== 'number' || score < 1 || score > 10)
        ) {
            return res.status(400).json({
                message: "Invalid score. Score must be a number between 1 and 10, or null."
            });
        }

        if ('note' in req.body && typeof note !== 'string') {
            return res.status(400).json({
                message: "Invalid note. Note must be a string."
            });
        }

        for (const field of suppliedFields) {
            updateData[field] = req.body[field];
        }

        const game = await Game.findOneAndUpdate(
            {
                userId: req.user.userId,
                gameId: gameId
            },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!game) {
            return res.status(404).json({
                message: "Game not found in your backlog"
            })
        }

        return res.status(200).json({ game });

    } catch (error) {
        console.error("Error updating game: ", error);
        return res.status(500).json({
            message: "Error updating game."
        })
    }
})

router.delete('/:gameId', authMiddleware, async (req, res) => {
    try {
        const gameId = Number(req.params.gameId);

        if (!Number.isInteger(gameId) || gameId <= 0) {
            return res.status(400).json({
                message: "Invalid Game ID."
            });
        };

        const deletedGame = await Game.findOneAndDelete({
            userId: req.user.userId,
            gameId: gameId
        });

        if (!deletedGame) {
            return res.status(404).json({
                message: "Game not found in your backlog."
            });
        }

        return res.status(200).json({
            message: "Game removed from backlog.",
            game: deletedGame
        })

    } catch (error) {
        console.error("Failed to remove game", error);
        return res.status(500).json({
            message: "Failed to remove game."
        })
    }
})

export default router;