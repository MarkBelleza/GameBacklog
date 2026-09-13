import { createContext, useState, useContext, useEffect } from 'react';

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);


export const GameProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);

    useEffect(() => {
        const storedFavourites = localStorage.getItem('favourites');
        if (storedFavourites) {
            setFavourites(JSON.parse(storedFavourites));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favourites));
    }, [favourites]);

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

    // value provided specifies what data and functions are available to children
    return (
        <GameContext.Provider value={{ favourites, setFavourites, addFavourite, removeFavourite, isFavourite }}>
            {children}
        </GameContext.Provider>
    );
};