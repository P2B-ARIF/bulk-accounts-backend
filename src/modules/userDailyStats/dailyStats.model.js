const { default: mongoose } = require("mongoose");

const UserDailyStatsSchema = new mongoose.Schema({
	// Reference to the user
	userID: { type: String, required: true }, // Link to the user

	// Date-specific stats
	date: { type: Date, required: true }, // Unique per user and day
	date_fns: { type: String }, // Readable date (e.g., "2024-11-18")

	// Aggregated data for each account type
	accounts: [
		{
			accountType: { type: String, required: true }, // e.g., "facebook"
			accountFormat: { type: String }, // e.g., "premium", "standard"
			totalRate: { type: Number, default: 0 }, // Sum of rates for the day
			count: { type: Number, default: 0 }, // Number of accounts for this type
		},
	],
});

const UserDailyStats = mongoose.model("UserDailyStats", UserDailyStatsSchema);

module.exports = UserDailyStats;
