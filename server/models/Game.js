import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    gameId: {
        type: Number,
        required: true
    },

    platform: {
        type: String,
        enum: ['Steam', 'Epic Games', 'GOG', 'PlayStation', 'Xbox', 'Nintendo', 'Other', null],
        default: null
    },

    status: {
        type: String,
        enum: ['Finished', 'Playing', 'Dropped', null],
        default: null
    },

    score: {
        type: Number,
        min: 1,
        max: 10,
        default: null
    },

    note: {
        type: String,
        default: ''
    },
});

gameSchema.index({ userId: 1, gameId: 1 }, { unique: true });

const Game = mongoose.model("Game", gameSchema);

export default Game;

/* 
    Intead of creating a schema 
    where the games are embedded in the user document,
    ie.
    {
        _id: userId,
        username: "user1",
        games: [
            {
            gameId: 3498,
            status: "Playing",
            score: 9,
            note: "Great game"
            },
            {
            gameId: 3328,
            status: "Finished",
            score: 10,
            note: "Amazing"
            }
        ]
    }
    we create a separate Game model to store the game data.

    MongoDB has a maximum BSON document size of 16 MB. 
    With an embedded games array, all of a user's games have to 
    fit inside that one user document.

    This also allows for more flexibility and scalability,
    as we can easily query and manipulate the game data without
    affecting the user data. It also allows for better indexing 
    and performance when querying the games collection.

    NOTE: that we also have a USER model that stores the user data, 
        and the Game model stores the game data.
*/