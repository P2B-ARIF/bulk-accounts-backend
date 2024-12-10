const Account = require("../modules/account/account.model");

const deleteDieAccount = async () => {
	try {
		// Calculate the date 10 days ago
		const tenDaysAgo = new Date();
		tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

		const result = await Account.deleteMany({
			$and: [{ "createdAt.date": { $lt: tenDaysAgo } }, { die: true }],
		});

		console.log(`${result.deletedCount} accounts deleted.`);
	} catch (err) {
		console.error("Error deleting accounts:", err.message);
	}
};

module.exports = { deleteDieAccount };
