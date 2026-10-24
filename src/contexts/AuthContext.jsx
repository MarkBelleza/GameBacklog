import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // const [user, setUser] = useState(null);
    // const [token, setToken] = useState(null);

    /// Restore the user from local storage when the app loads
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch (error) {
            return null;
        }
    })

    // Restore the token from localStorage
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });


    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);

        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', authToken)
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // Handles automatic logout when token expires
    useEffect(() => {
        if (!token) return;

        try {
            // Decode the JWT payload to read the expiration timestamp (exp)
            // A JWT normally consists of three parts separated by dots (Header.Payload.Signature)
            // The Payload contains information about the user and token, including the expiration time. 
            const payload = JSON.parse(
                atob(
                    token.split('.')[1]
                        .replace(/-/g, '+')
                        .replace(/_/g, '/')
                    /*
                        JWT payloads use Base64URL encoding.
                        This converts two characters used by Base64URL 
                        into their standard Base64 equivalents so 
                        JavaScript can decode the payload. 
                        atob() decodes Base64URL encoding

                        payload result may look something like this:
                        {
                            userId: "123456789",
                            iat: 1790000000,
                            exp: 1790003600
                        }
                    */
                )
            )


            //Calculate how long until the token expires
            const expiresAt = payload.exp * 1000; //.exp is in seconds, need to convert to ms
            const timeUntilExpiry = expiresAt - Date.now();

            //Log out immediately if expired token is restored after refreshing page
            if (timeUntilExpiry <= 0) {
                logout();
                return;
            }

            //Automatically log out when the token expires
            const timeout = setTimeout(() => {
                logout();
            }, timeUntilExpiry);
            /* 
                timeout() - a built-in js function that
                schedules some code to execute after 
                a specified amount of time
            */

            return () => clearTimeout(timeout);
            /*
                clearTimeout() - It tells React to cancel the 
                previously scheduled timer when the effect 
                needs to clean up.

                For example:
                    User logs in → React runs the effect and stores clearTimeout function.
                    User's token changes → React executes the previously clearTimeout function.
                    Then React runs the effect again using the new token.
            */

        } catch (error) {
            console.error('Ivalid authentication token:', error);
            logout();
            /*
                if token can't be decoded then it must be corrupted,
                does not have the expected strucure and/or payload is
                not a valid JSON, in which case we need to log out the
                user regardless
            */
        }
    }, [token]) //Clears the timer if the token value changes or the component first mounts.

    return (
        <AuthContext.Provider
            value={{ user, token, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};