import { createContext, useState, useContext, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { getSavedGames, saveGame, updateSavedGame, deleteSavedGame } from '../services/api';

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);


export const GameProvider = ({ children }) => {
    const { token } = useAuthContext();

    // Guest backlog (initialized from localStorage)
    const [guestFavourites, setGuestFavourites] = useState(() =>
        JSON.parse(localStorage.getItem('favourites') || '[]')
    );
    const [guestGameStatuses, setGuestGameStatuses] = useState(() =>
        JSON.parse(localStorage.getItem('gameStatuses') || '{}')
    );
    const [guestGameNotes, setGuestGameNotes] = useState(() =>
        JSON.parse(localStorage.getItem('gameNotes') || '{}')
    );
    const [guestGameScores, setGuestGameScores] = useState(() =>
        JSON.parse(localStorage.getItem('gameScores') || '{}')
    );
    const [guestGamePlatforms, setGuestGamePlatforms] = useState(() =>
        JSON.parse(localStorage.getItem('gamePlatforms') || '{}')
    );

    // Logged-in user backlog (fetched from MongoDB)
    const [favourites, setFavourites] = useState([]);
    const [gameStatuses, setGameStatuses] = useState({});
    const [gameNotes, setGameNotes] = useState({});
    const [gameScores, setGameScores] = useState({});
    const [gamePlatforms, setGamePlatforms] = useState({});

    // Display the database backlog when logged in,
    // or the localStorage backlog when logged out.
    const visibleFavourites = token ? favourites : guestFavourites;
    const visibleGameStatuses = token ? gameStatuses : guestGameStatuses;
    const visibleGameNotes = token ? gameNotes : guestGameNotes;
    const visibleGameScores = token ? gameScores : guestGameScores;
    const visibleGamePlatforms = token ? gamePlatforms : guestGamePlatforms;

    const setVisibleFavourites = token ? setFavourites : setGuestFavourites;
    const setVisibleGameStatuses = token ? setGameStatuses : setGuestGameStatuses;
    const setVisibleGameNotes = token ? setGameNotes : setGuestGameNotes;
    const setVisibleGameScores = token ? setGameScores : setGuestGameScores;
    const setVisibleGamePlatforms = token ? setGamePlatforms : setGuestGamePlatforms;

    useEffect(() => {

        if (!token) {
            return;
        }

        let cancelled = false;
        // This variable is used to prevent state updates if the 
        // component unmounts (user logged in <--> logged out), before the async operation completes.

        // If the user is logged in, fetch their saved games from the backend
        const loadSavedGames = async () => {
            try {
                // Get saved games and their details directly from MongoDB
                const data = await getSavedGames(token);

                //prevents a request that was already running from updating the backlog after logout or another token change.
                if (cancelled) return;

                // Convert MongoDB records into the game object shape used by the frontend
                const savedGames = data.map((savedGame) => ({
                    id: savedGame.gameId,
                    name: savedGame.name,
                    cover: savedGame.coverUrl
                        ? { url: savedGame.coverUrl }
                        : null,
                    first_release_date: savedGame.releaseDate
                        ? Math.floor(new Date(savedGame.releaseDate).getTime() / 1000)
                        : null,
                    dateAdded: savedGame.dateAdded,
                    platform: savedGame.platform,
                    status: savedGame.status,
                    score: savedGame.score,
                    note: savedGame.note,
                }));

                setFavourites(savedGames);
                //Note: savedGames is a list of objects (games with its attributes/details)

                const statuses = {};
                const notes = {};
                const scores = {};
                const platforms = {};

                savedGames.forEach((game) => {
                    /* MongoDB's gameId property is mapped to game.id above.
                        We use game.id to keep our frontend game references consistent. */

                    if (game.status) {
                        statuses[game.id] = game.status;
                    }

                    if (game.note) {
                        notes[game.id] = game.note;
                    }

                    if (game.score !== null && game.score !== undefined) {
                        scores[game.id] = String(game.score);
                    }

                    if (game.platform) {
                        platforms[game.id] = game.platform;
                    }
                })

                setGameStatuses(statuses);
                setGameNotes(notes);
                setGameScores(scores);
                setGamePlatforms(platforms);

            } catch (error) {
                console.log('Failed to load saved games', error);
            }
        };

        loadSavedGames();

        // Clean up function to prevent state updates if the component unmounts before the 
        // async operation (getSavedGames(token)) completes.
        return () => {
            cancelled = true;
        };
    }, [token]); // when token changes (logged in <--> logged out), run this useEfect()


    // Save the guest backlog to localStorage
    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(guestFavourites));
        localStorage.setItem('gameStatuses', JSON.stringify(guestGameStatuses));
        localStorage.setItem('gameNotes', JSON.stringify(guestGameNotes));
        localStorage.setItem('gameScores', JSON.stringify(guestGameScores));
        localStorage.setItem('gamePlatforms', JSON.stringify(guestGamePlatforms));
    }, [
        guestFavourites,
        guestGameStatuses,
        guestGameNotes,
        guestGameScores,
        guestGamePlatforms
    ]);

    // Add a game to favourites
    const addFavourite = async (game) => {

        // Prevent adding the same game twice
        if (isFavourite(game.id)) {
            return;
        }

        // If the user is logged out, save the game locally
        if (!token) {
            const newGame = {
                ...game,
                dateAdded: new Date().toISOString()
            };

            setGuestFavourites((prevFavourites) => [...prevFavourites, newGame]);
            return;
        }

        // If the user is logged in, save the game to the backend
        try {
            // Save the game to MongoDB
            await saveGame(game, token);

            //Update UI after saving succeeds
            setFavourites((prevFavourites) => [...prevFavourites, game]);
        } catch (error) {
            console.error("Failed to add game to backlog", error)
        }

    };

    // Remove a game from favourites
    const removeFavourite = async (gameId) => {
        // If the user is logged in, delete the game from MongoDB
        if (token) {
            try {
                await deleteSavedGame(gameId, token);
            } catch (error) {
                console.error("Failed to remove game from backlog", error);
                return;
            }
        }

        //Update UI after deleting succeeds (delete game from list of games)
        setVisibleFavourites((prevFavourites) =>
            prevFavourites.filter((game) => game.id !== gameId)
        );

        //Remove the game status/notes/score states   
        setVisibleGameStatuses((previousStatuses) => {
            const nextStatuses = { ...previousStatuses };
            delete nextStatuses[gameId];
            return nextStatuses;
        });

        setVisibleGameNotes((previousNotes) => {
            const nextNotes = { ...previousNotes };
            delete nextNotes[gameId];
            return nextNotes;
        });

        setVisibleGameScores((previousScores) => {
            const nextScores = { ...previousScores };
            delete nextScores[gameId];
            return nextScores;
        });

        setVisibleGamePlatforms((previousPlatforms) => {
            const nextPlatforms = { ...previousPlatforms };
            delete nextPlatforms[gameId];
            return nextPlatforms;
        });
    }

    // Check if a game is already in favourites
    const isFavourite = (gameId) =>
        visibleFavourites.some((game) => game.id === gameId);

    // Get the status of a game (Playing, Finished, Dropped)
    const getGameStatus = (gameId) => visibleGameStatuses[gameId] || null;

    // Toggle the status of a game (Playing, Finished, Dropped)
    const toggleGameStatus = async (gameId, status) => {
        const currentStatus = visibleGameStatuses[gameId];
        const newStatus = currentStatus === status ? null : status;

        //Update UI
        setVisibleGameStatuses((previousStatuses) => {
            const nextStatuses = { ...previousStatuses };

            if (newStatus === null) {
                delete nextStatuses[gameId];
            } else {
                nextStatuses[gameId] = newStatus;
            }

            return nextStatuses;
        });

        //Save changes to MongoDB if the user is logged in
        if (token) {
            try {
                await updateSavedGame(gameId, { status: newStatus }, token);
            } catch (error) {
                console.error("Failed to update game status", error);
            }
        }
    };

    const getGameNote = (gameId) => visibleGameNotes[gameId] || '';

    const updateGameNote = (gameId, note) => {
        //Update UI
        setVisibleGameNotes((previousNotes) => ({
            ...previousNotes,
            [gameId]: note
        }));
    };

    const saveGameNote = async (gameId, note) => {
        // Save the note to MongoDB only if the user is logged in
        if (token) {
            try {
                await updateSavedGame(gameId, { note }, token);
            } catch (error) {
                console.error("Failed to update note", error);
            }
        }
    }

    const getGameScore = (gameId) => visibleGameScores[gameId] ?? '';

    const updateGameScore = async (gameId, score) => {
        // newScore needs to be a number to work with db schema
        const newScore = score === '' || score === null ? null : Number(score)

        // Update UI
        setVisibleGameScores((previousScores) => {
            const nextScores = { ...previousScores };

            if (score === '' || score === null) {
                delete nextScores[gameId];
            } else {
                nextScores[gameId] = String(score); //needs to be a string to work with UI
            }

            return nextScores;
        });

        //Update change to mongoDB if the user is logged in
        if (token) {

            try {
                await updateSavedGame(gameId, { score: newScore }, token);
            } catch (error) {
                console.log("Failed to update game score", error)
            }
        }
    };

    const getGamePlatform = (gameId) => visibleGamePlatforms[gameId] ?? '';

    const updateGamePlatform = async (gameId, platform) => {
        const newPlatform = platform || null;

        //Update UI
        setVisibleGamePlatforms((previousPlatforms) => {

            const nextPlatforms = { ...previousPlatforms };

            if (newPlatform === null) {
                delete nextPlatforms[gameId];
            } else {
                nextPlatforms[gameId] = newPlatform;
            }

            return nextPlatforms;
        })

        // Update change to MongoDB if the user is logged in
        if (token) {
            try {
                await updateSavedGame(gameId, { platform: newPlatform }, token)
            } catch (error) {
                console.log("Failed to update game platform", error);
            }
        }
    }

    // value provided specifies what data and functions are available to children
    return (
        <GameContext.Provider value={{
            favourites: visibleFavourites, setFavourites: setVisibleFavourites,
            addFavourite, removeFavourite, isFavourite,
            getGamePlatform, updateGamePlatform,
            getGameStatus, toggleGameStatus,
            getGameNote, updateGameNote, saveGameNote,
            getGameScore, updateGameScore
        }}>
            {children}
        </GameContext.Provider>
    );
};