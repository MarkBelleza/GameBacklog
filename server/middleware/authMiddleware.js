import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        // Read the token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization header missing or malformed." });
        }

        const token = authHeader.split(" ")[1];

        // Verify the token using the server's secret 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Attach the decoded user information to the request object for further use in the route handlers
        req.user = decoded;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }

};

export default authMiddleware;

