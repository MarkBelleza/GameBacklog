import axios from 'axios';

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

//Temporary token storage
let cachedAccessToken = null;
let tokenExpiryTime = 0;

// Visit IGDB documentation (https://api-docs.igdb.com) for more information on how to use the API and its endpoints.
// Function to get Twitch access token (using axios for easy HTTP requests)
export const getTwitchAccessToken = async () => {

    //Check wether we already have a valid token
    if (cachedAccessToken && Date.now() < tokenExpiryTime) {
        return cachedAccessToken;
    }

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
    });

    const response = await axios.post(TWITCH_AUTH_URL, params);

    // Cache the token and its expiry time
    cachedAccessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in - 60) * 1000; // Convert expires_in to milliseconds

    return cachedAccessToken;
};

const IGDB_BASE_URL = 'https://api.igdb.com/v4';

// Function to make authenticated requests to IGDB API
export const makeIGDBRequest = async (endpoint, query) => {
    const accessToken = await getTwitchAccessToken();

    /*
      IGDB expects the query in its request body using its own query language, called APICalypse.
      The text/plain content type tells IGDB we're sending that query as plain text.
     */
    const response = await axios.post(`${IGDB_BASE_URL}/${endpoint}`, query, {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'text/plain'
        }
    });
    return response.data;

}