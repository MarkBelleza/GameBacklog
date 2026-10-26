import { createContext, useState, useContext, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { getSavedGames, saveGame, updateSavedGame, getGameById, deleteSavedGame } from '../services/api';

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);


export const GameProvider = ({ children }) => {
    const { token } = useAuthContext();


    const [favourites, setFavourites] = useState([]);
    const [gameStatuses, setGameStatuses] = useState({});
    const [gameNotes, setGameNotes] = useState({});
    const [gameScores, setGameScores] = useState({});
    const [gamePlatforms, setGamePlatforms] = useState({});

    //If the user is logged out, return an empty list
    const visibleFavourites = token ? favourites : [];

    // useEffect(() => {
    //     const storedFavourites = localStorage.getItem('favourites');
    //     if (storedFavourites) {
    //         setFavourites(JSON.parse(storedFavourites));
    //     }

    //     const storedGameStatuses = localStorage.getItem('gameStatuses');
    //     if (storedGameStatuses) {
    //         setGameStatuses(JSON.parse(storedGameStatuses));
    //     }

    //     const storedGameNotes = localStorage.getItem('gameNotes');
    //     if (storedGameNotes) {
    //         setGameNotes(JSON.parse(storedGameNotes));
    //     }

    //     const storedGameScores = localStorage.getItem('gameScores');
    //     if (storedGameScores) {
    //         setGameScores(JSON.parse(storedGameScores));
    //     }
    // }, []);
    useEffect(() => {
        if (!token) {
            return;
        }

        const loadSavedGames = async () => {
            try {
                //Get the gameIds and Statuses from MongoDB
                const data = await getSavedGames(token);

                //Use the gameIds to retrieve the game details from RAWG
                const savedGames = await Promise.all(
                    data.map(async (savedGame) => {
                        const gameDetails = await getGameById(savedGame.gameId);

                        /* return game details from RAWG combined 
                         with the status infos from MongoDB */
                        return {
                            ...gameDetails,
                            platform: savedGame.platform,
                            status: savedGame.status,
                            score: savedGame.score,
                            note: savedGame.note,
                        }
                    })
                )

                setFavourites(savedGames)
                //Note: savedGames is a list of objects (the games alongside its attributes/details)

                const statuses = {};
                const notes = {};
                const scores = {};
                const platforms = {};

                savedGames.forEach((game) => {
                    /* Note the property ".gameID" from MongoDB is no longer in 
                        savedGames. Use "game.id" which is from RAWG */

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
    }, [token]); // when token changes (logged in <--> logged out), run this useEfect()


    // useEffect(() => {
    //     localStorage.setItem('favourites', JSON.stringify(favourites));
    // }, [favourites]);

    // useEffect(() => {
    //     localStorage.setItem('gameStatuses', JSON.stringify(gameStatuses));
    // }, [gameStatuses]);

    // useEffect(() => {
    //     localStorage.setItem('gameNotes', JSON.stringify(gameNotes));
    // }, [gameNotes]);

    // useEffect(() => {
    //     localStorage.setItem('gameScores', JSON.stringify(gameScores));
    // }, [gameScores]);


    // Add a game to favourites
    const addFavourite = async (game) => {

        // Prevent adding the same game twice
        if (isFavourite(game.id)) {
            return;
        }

        try {
            // Save the game to MongoDB
            await saveGame(game.id, token);

            //Update UI after saving succeeds
            setFavourites((prevFavourites) => [...prevFavourites, game]);
        } catch (error) {
            console.error("Failed to add game to backlog", error)
        }

    };

    // Remove a game from favourites
    const removeFavourite = async (gameId) => {
        try {
            // Delete game from MongoDB
            await deleteSavedGame(gameId, token);

            //Update UI after deleting succeeds (delete game from list of games)
            setFavourites((prevFavourites) =>
                prevFavourites.filter((game) => game.id !== gameId)
            );

            //Remove the game status/notes/score states   
            setGameStatuses((previousStatuses) => {
                const nextStatuses = { ...previousStatuses }
                delete nextStatuses[gameId]
                return nextStatuses;
            });

            setGameNotes((previousNotes) => {
                const nextNotes = { ...previousNotes }
                delete nextNotes[gameId]
                return nextNotes;
            })

            setGameScores((prevScores) => {
                const nextScores = { ...prevScores }
                delete nextScores[gameId]
                return nextScores;
            })

        } catch (error) {
            console.error("Failed to remove game from backlog", error);
        }
    }

    // Check if a game is already in favourites
    const isFavourite = (gameId) => {
        return favourites.some((game) => game.id === gameId);
    }

    // Get the status of a game (Playing, Finished, Dropped)
    const getGameStatus = (gameId) => gameStatuses[gameId] || null;

    // Toggle the status of a game (Playing, Finished, Dropped)
    const toggleGameStatus = async (gameId, status) => {
        const currentStatus = gameStatuses[gameId];
        const newStatus = currentStatus === status ? null : status

        //Update UI
        setGameStatuses((previousStatuses) => {
            const nextStatuses = { ...previousStatuses };

            if (newStatus === null) {
                delete nextStatuses[gameId];
            } else {
                nextStatuses[gameId] = newStatus;
            }

            return nextStatuses;
        });

        //Save changes to MongoDB
        try {
            await updateSavedGame(gameId, { status: newStatus }, token);

        } catch (error) {
            console.error("Failed to update game status", error);
        }
    };

    const getGameNote = (gameId) => gameNotes[gameId] || '';

    const updateGameNote = (gameId, note) => {
        //Update UI
        setGameNotes((previousNotes) => ({
            ...previousNotes,
            [gameId]: note,
        }));
    };

    const saveGameNote = async (gameId, note) => {
        //Save the note to MongoDB
        try {
            await updateSavedGame(gameId, { note }, token);
        } catch (error) {
            console.error("Failed to update note", error);
        }
    }

    const getGameScore = (gameId) => gameScores[gameId] ?? '';

    const updateGameScore = async (gameId, score) => {
        // newScore needs to be a number to work with db schema
        const newScore = score === '' || score === null ? null : Number(score)

        // Update UI
        setGameScores((previousScores) => {
            const nextScores = { ...previousScores };

            if (score === null) {
                delete nextScores[gameId];
            } else {
                nextScores[gameId] = String(score); //needs to be a string to work with UI
            }

            return nextScores;
        });

        //Update change to mongoDB
        try {
            await updateSavedGame(gameId, { score: newScore }, token);
        } catch (error) {
            console.log("Failed to update game score", error)
        }
    };

    const getGamePlatform = (gameId) => gamePlatforms[gameId] ?? '';

    const updateGamePlatform = async (gameId, platform) => {
        const newPlatform = platform || null;

        //Update UI
        setGamePlatforms((previousPlatforms) => {

            const nextPlatforms = { ...previousPlatforms, [gameId]: platform }

            if (newPlatform === null) {
                delete nextPlatforms[gameId];
            } else {
                nextPlatforms[gameId] = newPlatform;
            }

            return nextPlatforms;
        })

        // Update change to MongoDB
        try {
            await updateSavedGame(gameId, { platform: newPlatform }, token)
        } catch (error) {
            console.log("Failed to update game platform", error);
        }
    }

    // value provided specifies what data and functions are available to children
    return (
        <GameContext.Provider value={{
            favourites: visibleFavourites, setFavourites, addFavourite, removeFavourite, isFavourite,
            getGamePlatform, updateGamePlatform,
            getGameStatus, toggleGameStatus,
            getGameNote, updateGameNote, saveGameNote,
            getGameScore, updateGameScore
        }}>
            {children}
        </GameContext.Provider>
    );
};