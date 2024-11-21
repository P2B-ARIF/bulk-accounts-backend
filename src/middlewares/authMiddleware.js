const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
	const token = JSON.parse(req.headers.authorization?.split(" ")[1]); // No need for JSON.parse

	if (!token) {
		return res
			.status(401)
			.json({ access: false, message: "Access denied. No token provided." });
	}

	try {
		const decoded = verifyToken(token); // Decode the token
		req.user = decoded; // Attach the decoded user to the request
		next(); // Proceed to the next middleware or route handler
	} catch (err) {
		if (err.name === "TokenExpiredError") {
			return res.status(401).json({
				access: false,
				message: "Token expired. Please log in again.",
			});
		}

		res.status(401).json({ access: false, message: "Invalid token" });
	}
};

module.exports = authMiddleware;
