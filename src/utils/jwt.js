const jwt = require("jsonwebtoken");

exports.signToken = payload => {
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.verifyToken = token => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		throw new Error("Invalid Token");
	}
};
