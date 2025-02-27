const bcrypt = require("bcrypt");
const User = require("./auth.model");
const { signToken } = require("../../utils/jwt");
const get2FACode = require("../../utils/secretkey");

// Register a new user
exports.registerUser = async (req, res) => {
	const { name, email, password, number, gender } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ ...req.body, password: hashedPassword });
		await user.save();
		res
			.status(201)
			.json({ success: true, message: "User created successfully" });
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error registering user", error: err.message });
	}
};

// Login user and generate a token
exports.loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid email or password" });
		}

		if (user.isBlocked) {
			return res
				.status(403)
				.json({ access: false, message: "Your account is blocked" });
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(400).json({ message: "Invalid email or password" });
		}
		const token = signToken({
			id: user._id,
			email: user.email,
			role: user.role,
		});

		// Update lastLogin
		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error logging in user", error: err.message });
	}
};

// forgotPassword
exports.forgotPassword = async (req, res) => {
	const { email, password } = req.body;
	try {
		if (!email || !password) {
			return res.status(400).json({ message: "Invalid email or password" });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		user.password = hashedPassword;
		const updatedUser = await user.save();

		res.status(200).json({
			success: true,
			message: "User updated successfully",
		});
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error forgot password", error: err.message });
	}
};

// user block
exports.userBlock = async (req, res) => {
	const { email, action } = req.body;
	try {
		if (!email || !action) {
			return res.status(400).json({ message: "Invalid email or password" });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.isBlocked = action;
		const updatedUser = await user.save();

		res.status(200).json({
			success: true,
			message: "User updated successfully",
		});
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error forgot password", error: err.message });
	}
};

// Get the logged-in user's details
exports.getCurrentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select(
			"-_id lastLogin name email isBlocked role nickname",
		);
		if (!user) {
			return res.status(404).json({ access: false, message: "User not found" });
		}

		if (user.isBlocked) {
			return res
				.status(403)
				.json({ access: false, message: "Your account is blocked" });
		}

		res.status(200).json(user);
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error fetching user", error: err.message });
	}
};

// Get 2FA Code Route
exports.secretVerify = async (req, res) => {
	try {
		const { key } = req.query;
		const code = await get2FACode(key);
		res.json(code);
	} catch (err) {
		res.status(500).json({ access: false, message: "Something went wrong!" });
	}
};

// get all users
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find({});
		res.json(users);
	} catch (err) {
		res.status(500).json({ access: false, message: "Something went wrong!" });
	}
};

exports.setNickname = async (req, res) => {
	try {
		const { id } = req.user;
		const { nickname } = req.body;

		const result = await User.findByIdAndUpdate(
			id,
			{ nickname: nickname },
			{ new: true },
		);
		res.status(200).json({
			success: true,
			message: "Successfully updated nickname",
			result,
		});
	} catch (err) {
		res.status(500).json({ message: "Updating field in nickname" });
	}
};

exports.deleteUser = async (req, res) => {
	try {
		const { email } = req.query;
		if (!email) {
			return res.status(400).json({ message: "Email is required!" });
		}

		const user = await User.findOneAndDelete({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		return res
			.status(200)
			.json({ user, message: "Successfully deleted user!" });
	} catch (err) {
		console.error("Error deleting user:", err);
		return res
			.status(500)
			.json({ message: "An error occurred while deleting the user." });
	}
};
