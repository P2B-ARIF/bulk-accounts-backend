const { verifyToken } = require("../utils/jwt");

const isAdmin = (req, res, next) => {
	const token = JSON.parse(req.headers.authorization?.split(" ")[1]);

	if (!token) {
		return res
			.status(401)
			.json({ access: false, message: "Access denied. No token provided." });
	}

	try {
		const decoded = verifyToken(token);
		if (decoded.role !== "admin") {
			return res.status(403).json({
				access: false,
				message: "Forbidden: You do not have permission",
			});
		}
		req.user = decoded;
		next();
	} catch (error) {
		res.status(400).json({ access: false, message: "Invalid token" });
	}
};

module.exports = isAdmin;
