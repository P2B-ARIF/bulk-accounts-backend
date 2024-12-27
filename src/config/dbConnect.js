const mongoose = require("mongoose");

const dbConnect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL, {
			dbName: "bulk_accounts",
		});
		console.log("Database connection established");
	} catch (error) {
		console.error("Database connection failed:", error.message);
		process.exit(1); // Exit the process with failure code
	}
};

module.exports = dbConnect;
