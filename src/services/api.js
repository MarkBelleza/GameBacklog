const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

//For Home Page and Search Results
export const getPopularGames = async () => {
    const response = await fetch(`${BACKEND_URL}/igdb/popular`);
    if (!response.ok) {
        throw new Error('Failed to fetch popular games');
    }
    return response.json();
}

export const searchGames = async (query) => {
    const response = await fetch(`${BACKEND_URL}/igdb/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch search results');
    }
    return response.json();
}

//For the Backlog Page
export const getSavedGames = async (token) => {
    const response = await fetch(`${BACKEND_URL}/games`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch saved games');
    }

    return response.json();
};

export const saveGame = async (game, token) => {
    const releaseDate = game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString()
        : null;

    const coverUrl = game.cover?.url
        ? game.cover.url.startsWith('//')
            ? `https:${game.cover.url}`
            : game.cover.url
        : null;

    const response = await fetch(`${BACKEND_URL}/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            gameId: game.id,
            name: game.name,
            coverUrl,
            releaseDate,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to save game');
    }

    return data.game;
};

export const updateSavedGame = async (gameId, updates, token) => {
    const response = await fetch(`${BACKEND_URL}/games/${gameId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update game');
    }

    return data.game;
}

export const deleteSavedGame = async (gameId, token) => {
    const response = await fetch(`${BACKEND_URL}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete game');
    }

    return data.game;
}

//For Authentication
export const registerUser = async (username, email, password) => {
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to register user');
    }

    return data;
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to login');
    }

    return data;
};
