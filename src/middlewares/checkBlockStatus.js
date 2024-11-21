const cron = require("node-cron");
const User = require("../modules/auth/auth.model");

const checkBlockStatus = async () => {
	try {
		const tenDaysAgo = new Date();
		tenDaysAgo.setDate(tenDaysAgo.getDate() - 7);

		// Block users with `lastLogin` older than 7 days
		const result = await User.updateMany(
			{ lastLogin: { $lt: tenDaysAgo }, isBlocked: false },
			{ $set: { isBlocked: true } },
		);

		console.log(`${result.modifiedCount} users blocked due to inactivity.`);
	} catch (err) {
		console.error("Error blocking users:", err.message);
	}
};

// Schedule the job to run at midnight every day
cron.schedule("0 0 * * *", async () => {
	console.log("Running daily block status check...");
	await checkBlockStatus();
});

module.exports = { checkBlockStatus };
