const NodeCache = require("node-cache");
const User = require("../auth/auth.model");
const Account = require("./account.model");
// const {
// 	updateUserDailyStats,
// } = require("../userDailyStats/dailyStats.controller");
const Withdraw = require("../withdraw/withdraw.model");
const BlackHole = require("../blackHole/blackHole.model");

const dataCache = new NodeCache({ stdTTL: 600 });

//? Production

// create a facebook account
exports.createAccount = async (req, res) => {
	try {
		const body = req.body;
		const { id, email } = req.user;

		if (!body.key && !body.cookie) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(400).json({ message: "User not found!" });
		}
		const exitsEmail = await Account.findOne({ email: body.email });
		if (exitsEmail) {
			return res.status(400).json({ message: "Email already exists!" });
		}
		const result = new Account({ ...body, userID: id, userEmail: email });
		await result.save();

		dataCache.del("accounts");
		dataCache.del("everything");
		// updateUserDailyStats(
		// 	{
		// 		accountType: body.accountType,
		// 		accountFormat: body.accountFormat,
		// 		rate: body.rate,
		// 	},
		// 	id,
		// );
		res
			.status(201)
			.json({ success: true, message: "Account created successfully" });
	} catch (err) {
		console.log(err.message);
		res
			.status(500)
			.json({ message: "Error creating account", error: err.message });
	}
};

exports.everyThings = async (req, res) => {
	try {
		const { id, email } = req.user; // Get user ID and email from the authenticated user

		// Validate user ID and email
		if (!id || !email) {
			return res.status(400).json({
				success: false,
				message: "User ID or email is missing from the request.",
			});
		}

		// Retrieve accounts and approved accounts in a single query
		const [accounts, approved, withdraw, allAccounts] = await Promise.all([
			Account.find({
				userID: id,
				$nor: [{ approved: true }, { die: true }, { resolved: true }],
			}),
			Account.find({
				userID: id,
				approved: true,
			}),
			Withdraw.find({ userID: id }),
			Account.find({ userID: id }),
		]);

		// Generate summary for account rates by accountType
		const summary = accounts.reduce((acc, { accountType, rate }) => {
			acc[accountType] = acc[accountType] || { accountType, totalRate: 0 };
			acc[accountType].totalRate += rate;
			return acc;
		}, {});

		// // Fetch user stats from cache or database
		// let userStats = dataCache.get("everything");
		// if (userStats) {
		// 	userStats = JSON.parse(userStats);
		// } else {
		// 	userStats = await getUserStats(id);
		// 	if (userStats) {
		// 		dataCache.set("everything", JSON.stringify(userStats)); // Cache the stats
		// 	}
		// }

		// Handle missing user stats
		// if (!userStats) {
		// 	return res.status(404).json({
		// 		success: false,
		// 		message: "User stats not found.",
		// 	});
		// }

		// Respond with the combined data
		res.status(200).json({
			success: true,
			accounts,
			summary,
			approved,
			withdraw,
			allAccounts,
		});
	} catch (err) {
		// Log and respond to errors
		console.error("Error in everyThings:", err.message);
		res.status(500).json({
			success: false,
			message: "An error occurred while listing everything.",
			error: err.message,
		});
	}
};

exports.resolvedAccount = async (req, res) => {
	try {
		const body = req.body;
		const { id } = req.params;
		const { action } = req.query;

		// console.log(action, id, "action");

		dataCache.del("accounts");
		dataCache.del("everything");

		if (action === "approved") {
			const result = await Account.findByIdAndUpdate(id, {
				$set: { approved: true, resolved: false },
			});
			return res.status(200).json({
				success: true,
				message: "Account Approved",
				data: result,
			});
		}

		if (action === "die-move") {
			const dieAccount = await Account.findByIdAndUpdate(id, { die: true });

			if (!dieAccount) {
				return res.status(404).json({
					success: false,
					message: "Account not found",
				});
			}

			const blackHoleAccount = await BlackHole.create(dieAccount.toObject());

			return res.status(200).json({
				success: true,
				message: "Account successfully moved to BlackHole",
				data: blackHoleAccount,
			});
		}

		if (action === "permanent-die") {
			const permanentDie = await Account.findByIdAndUpdate(
				id,
				{ die: true },
				{ new: true }, // Return updated document
			);

			if (!permanentDie) {
				return res.status(404).json({
					success: false,
					message: "Account not found for permanent deletion",
				});
			}
			return res.status(200).json({
				success: true,
				message: "Account permanently deleted successfully",
				permanentDie,
			});
		}

		// Handle regular account updates
		const account = await Account.findById(id);

		if (!account) {
			return res.status(404).json({
				success: false,
				message: "Account not found",
			});
		}

		// Determine attempt logic and update accordingly
		const updatedAccount = await Account.findByIdAndUpdate(
			id,
			{
				uid: body.uid || account.uid,
				password: body.password || account.password,
				resolved: false,
				downloaded: false,
				attempt: account.attempt < 2 ? account.attempt + 1 : account.attempt,
			},
			{ new: true }, // Return updated document
		);

		res.status(200).json({
			success: true,
			message: "Account resolved successfully",
			updatedAccount,
		});
	} catch (err) {
		console.log(err.message);
		res
			.status(500)
			.json({ message: "Error creating account", error: err.message });
	}
};

exports.listAccounts = async (req, res) => {
	try {
		const accounts = await Account.find({
			$nor: [{ approved: true }, { die: true }, { resolved: true }],
		});

		res.status(200).json(accounts);
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error listing accounts", error: err.message });
	}
};

exports.approvedAccounts = async (req, res) => {
	try {
		const accounts = await Account.find({ approved: true });
		res.status(200).json(accounts);
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error listing accounts", error: err.message });
	}
};

exports.actionAccounts = async (req, res) => {
	try {
		const { action } = req.query;
		const accountUIDs = req.body;

		if (!Array.isArray(accountUIDs) || accountUIDs.length === 0) {
			return res
				.status(400)
				.json({ success: false, message: "Numbers array is required" });
		}

		let result;

		if (action === "approved") {
			result = await Account.updateMany(
				{ uid: { $in: accountUIDs } },
				{ $set: { approved: true } }, // Set `approved` to true
			);
		}
		if (action === "attempt") {
			result = await Account.updateMany(
				{ uid: { $in: accountUIDs } },
				{ $set: { resolved: true } }, // Set `approved` to true
				{ new: true },
			);
		}

		if (action === "die") {
			result = await Account.updateMany(
				{ uid: { $in: accountUIDs } },
				{ $set: { die: true } },
				// Set `approved` to true
			);
		}

		if (action === "move") {
			const accountsToMove = await Account.find({ uid: { $in: accountUIDs } });

			if (accountsToMove.length === 0) {
				return res.status(404).json({
					success: false,
					message: "No accounts found to move",
				});
			}

			// Update all matched accounts with die: true
			await Account.updateMany(
				{ uid: { $in: accountUIDs } },
				{ $set: { die: true } },
			);

			const blackHoleAccounts = accountsToMove.map(account =>
				account.toObject(),
			);
			await BlackHole.insertMany(blackHoleAccounts);

			return res.status(200).json({
				success: true,
				message: `${accountsToMove.length} accounts moved to BlackHole successfully`,
				data: blackHoleAccounts,
			});
		}

		res.status(200).json({
			success: true,
			message: `${result.modifiedCount} accounts updated successfully`,
		});
	} catch (err) {
		console.log(err.message);

		res.status(500).json({
			success: false,
			message: "Error updating accounts",
			error: err.message,
		});
	}
};

exports.norApprovedAccounts = async (req, res) => {
	try {
		const accounts = await Account.find({
			$nor: [{ approved: true }, { resolved: false }, { die: true }],
		});

		res.status(200).json(accounts);
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error listing accounts", error: err.message });
	}
};

exports.downloadedAccounts = async (req, res) => {
	try {
		const UIDs = req.body;
		const accounts = await Account.updateMany(
			{ uid: { $in: UIDs } },
			{ $set: { downloaded: true } },
			{ new: true },
		);
		return res
			.status(200)
			.json({ message: "Downloaded status updated", accounts });
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error update downloaded status", error: err.message });
	}
};

exports.listSaleAccounts = async (req, res) => {
	try {
		const accounts = await BlackHole.find({});
		res.status(200).json(accounts);
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error listing sale accounts", error: err.message });
	}
};

exports.deleteSaleAccounts = async (req, res) => {
	try {
		const accountUIDs = req.body;

		if (!accountUIDs || accountUIDs.length === 0) {
			return res.status(400).json({ message: "No account IDs provided" });
		}

		const result = await BlackHole.deleteMany({ uid: { $in: accountUIDs } });

		if (result.deletedCount > 0) {
			res.status(200).json({
				message: `${result.deletedCount} accounts successfully deleted.`,
			});
		} else {
			res.status(404).json({ message: "No accounts found to delete." });
		}
	} catch (err) {
		res.status(500).json({
			message: "Error deleting sale accounts.",
			error: err.message,
		});
	}
};

exports.deleteAccount = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ message: "No account IDs provided" });
		}
		await Account.findByIdAndDelete(id);
		res.status(200).json({
			message: `Account successfully deleted.`,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error deleting sale accounts.",
			error: err.message,
		});
	}
};

exports.getAllAccounts = async (req, res) => {
	try {
		// Fetch accounts with better performance using `lean()`
		const accounts = await Account.find({}).lean();

		// Respond with the retrieved accounts
		res.status(200).json({
			success: true,
			message: "Accounts retrieved successfully",
			data: accounts,
		});
	} catch (err) {
		// Handle errors
		console.error("Error fetching accounts:", err.message);
		res.status(500).json({
			success: false,
			message: "Error fetching accounts",
			error: err.message,
		});
	}
};
