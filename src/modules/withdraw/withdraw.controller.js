const Account = require("../account/account.model");
const BlackHole = require("../blackHole/blackHole.model");
const Withdraw = require("./withdraw.model");

exports.createWithdraw = async (req, res) => {
	try {
		const { id, email } = req.user;
		const { newData, accountIDs } = req.body; // Correctly access data from the body

		if (accountIDs.length === 0) {
			throw new Error("No accounts found for the user");
		}

		// Find the accounts from the Account collection
		const accounts = await Account.find({
			_id: { $in: accountIDs },
			userID: id,
		}).select("-_id"); // Exclude the _id field

		if (accounts.length === 0) {
			return res.status(404).json({ message: "No matching accounts found" });
		}

		// Insert the found accounts into the BlackHole collection
		// If the BlackHole model expects an array, we can use insertMany
		await BlackHole.insertMany(accounts);

		// Create a new Withdraw document
		const payment = new Withdraw({
			...newData,
			userID: id,
			userEmail: email,
			totalAccounts: accounts.length,
			profit:
				accounts.reduce((total, account) => total + account.sold, 0) -
				newData.amount,
		});
		await payment.save();

		// Optionally, delete the accounts after withdrawal
		// Uncomment this if you need to remove the accounts from the Account collection
		await Account.deleteMany({
			_id: { $in: accountIDs },
			userID: id,
		});

		res.status(201).json({ message: "Withdrawal created successfully" });
	} catch (err) {
		console.log(err, "err");
		res
			.status(500)
			.json({ message: "Error processing withdrawal", error: err.message });
	}
};

exports.allWithdrawal = async (req, res) => {
	try {
		const result = await Withdraw.find({});
		res.status(201).json({ success: true, result });
	} catch (err) {
		console.log(err, "err");
		res
			.status(500)
			.json({ message: "Error processing withdrawal", error: err.message });
	}
};

exports.confirmPayment = async (req, res) => {
	try {
		const id = req.params.id;
		const { url } = req.body;

		// console.log(url);

		const result = await Withdraw.findByIdAndUpdate(
			id,
			{
				payment: "success",
				url: url,
			},
			{ new: true },
		);
		res.status(201).json({
			success: true,
			message: "successfully confirmed payment",
			result,
		});
	} catch (err) {
		console.log(err, "err");
		res
			.status(500)
			.json({ message: "Error processing withdrawal", error: err.message });
	}
};

exports.withdrawList = async (req, res) => {
	try {
		const { limit, page } = req.query;

		// console.log("server hit ");
		const result = await Withdraw.find({})
			.select("-_id -url -userID -accountNumber")
			.limit(limit)
			.skip((page - 1) * limit);

		const total = await Withdraw.countDocuments();

		// console.log(result, limit, page, total);

		res.status(200).json({ success: true, result, total });
	} catch (err) {
		console.log(err, "err");
		res
			.status(500)
			.json({ message: "Error processing withdrawal", error: err.message });
	}
};
