const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = "https://api.rawg.io/api";


//For the Home Page
export const getPopularGames = async () => {
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&ordering=-added`);
    const data = await response.json();
    return data.results;
}

export const searchGames = async (query) => {
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results;
}

export const getGameById = async (gameId) => {
    const response = await fetch(`${BASE_URL}/games/${gameId}?key=${API_KEY}`);

    if (!response.ok) {
        throw new Error("Failed to fetch game details");
    }

    return response.json();
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

export const saveGame = async (gameId, token) => {
    const response = await fetch(`${BACKEND_URL}/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId }),
    });

    if (!response.ok) {
        throw new Error('Failed to save game');
    }

    return response.json();
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
