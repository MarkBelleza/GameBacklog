const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = "https://api.rawg.io/api";

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
