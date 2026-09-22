import { createContext, useState, useContext, useEffect } from 'react';

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);


export const GameProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);
    const [gameStatuses, setGameStatuses] = useState({});
    const [gameNotes, setGameNotes] = useState({});
    const [gameScores, setGameScores] = useState({});

    useEffect(() => {
        const storedFavourites = localStorage.getItem('favourites');
        if (storedFavourites) {
            setFavourites(JSON.parse(storedFavourites));
        }

        const storedGameStatuses = localStorage.getItem('gameStatuses');
        if (storedGameStatuses) {
            setGameStatuses(JSON.parse(storedGameStatuses));
        }

        const storedGameNotes = localStorage.getItem('gameNotes');
        if (storedGameNotes) {
            setGameNotes(JSON.parse(storedGameNotes));
        }

        const storedGameScores = localStorage.getItem('gameScores');
        if (storedGameScores) {
            setGameScores(JSON.parse(storedGameScores));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favourites));
    }, [favourites]);

    useEffect(() => {
        localStorage.setItem('gameStatuses', JSON.stringify(gameStatuses));
    }, [gameStatuses]);

    useEffect(() => {
        localStorage.setItem('gameNotes', JSON.stringify(gameNotes));
    }, [gameNotes]);

    useEffect(() => {
        localStorage.setItem('gameScores', JSON.stringify(gameScores));
    }, [gameScores]);

    // Add a game to favourites
    const addFavourite = (game) => {
        setFavourites((prevFavourites) => [...prevFavourites, game]);
    };

    // Remove a game from favourites
    const removeFavourite = (gameId) => {
        setFavourites((prevFavourites) => prevFavourites.filter((game) => game.id !== gameId));
    }

    // Check if a game is already in favourites
    const isFavourite = (gameId) => {
        return favourites.some((game) => game.id === gameId);
    }

    // Get the status of a game (Playing, Finished, Dropped)
    const getGameStatus = (gameId) => gameStatuses[gameId] || null;

    // Toggle the status of a game (Playing, Finished, Dropped)
    const toggleGameStatus = (gameId, status) => {
        setGameStatuses((previousStatuses) => {
            const nextStatuses = { ...previousStatuses };

            if (nextStatuses[gameId] === status) {
                delete nextStatuses[gameId];
            } else {
                nextStatuses[gameId] = status;
            }

            return nextStatuses;
        });
    };

    const getGameNote = (gameId) => gameNotes[gameId] || '';

    const updateGameNote = (gameId, note) => {
        setGameNotes((previousNotes) => ({
            ...previousNotes,
            [gameId]: note,
        }));
    };

    const getGameScore = (gameId) => gameScores[gameId] ?? '';

    const updateGameScore = (gameId, score) => {
        setGameScores((previousScores) => {
            const nextScores = { ...previousScores };

            if (score === '') {
                delete nextScores[gameId];
            } else {
                nextScores[gameId] = score;
            }

            return nextScores;
        });
    };

    // value provided specifies what data and functions are available to children
    return (
        <GameContext.Provider value={{ favourites, setFavourites, addFavourite, removeFavourite, isFavourite, getGameStatus, toggleGameStatus, getGameNote, updateGameNote, getGameScore, updateGameScore }}>
            {children}
        </GameContext.Provider>
    );
};