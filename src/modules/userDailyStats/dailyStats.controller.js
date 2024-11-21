const UserDailyStats = require("./dailyStats.model");
const { format } = require("date-fns");

exports.updateUserDailyStats = async (account, userID) => {
	const { accountType, accountFormat, rate } = account;

	// Get the current date
	const today = new Date();
	const dateString = today.toISOString().split("T")[0]; // e.g., "2024-11-18"

	try {
		// Check if stats for today already exist for the user
		let userDailyStats = await UserDailyStats.findOne({
			userID,
			date: dateString,
		});

		if (!userDailyStats) {
			// If no stats exist for today, create a new document
			userDailyStats = new UserDailyStats({
				userID,
				date: dateString,
				date_fns: today.toLocaleDateString(), // Human-readable date
				accounts: [],
			});
		}

		// Find the accountType within today's stats
		const accountIndex = userDailyStats.accounts.findIndex(
			a => a.accountType === accountType && a.accountFormat === accountFormat,
		);
		// console.log(accountIndex, "accountIndex");
		// console.log(userDailyStats, "userDailyStats");

		if (accountIndex > -1) {
			// If accountType exists, update the count and totalRate
			userDailyStats.accounts[accountIndex].count += 1;
			userDailyStats.accounts[accountIndex].totalRate += rate;
		} else {
			// Otherwise, add a new accountType entry
			userDailyStats.accounts.push({
				accountType,
				accountFormat,
				totalRate: rate,
				count: 1,
			});
		}

		// Save the updated stats
		await userDailyStats.save();
		console.log("User daily stats updated successfully!");
	} catch (error) {
		console.error("Error updating user daily stats:", error);
	}
};

exports.getUserStats = async userID => {
	const today = new Date();
	const todayDate = today.toISOString().split("T")[0]; // ISO format "2024-11-21"

	// Get the last 7 days and 30 days
	const last7Days = new Date();
	last7Days.setDate(today.getDate() - 7); // 7 days ago

	const last30Days = new Date();
	last30Days.setDate(today.getDate() - 30); // 30 days ago

	// Format date ranges for 7 and 30 days in MM/dd/yyyy format
	const last7DaysFormatted = format(last7Days, "MM/dd/yyyy");
	const last30DaysFormatted = format(last30Days, "MM/dd/yyyy");
	const todayFormatted = format(today, "MM/dd/yyyy");

	try {
		// Ensure userID is valid
		if (!userID) {
			console.error("UserID is missing or invalid.");
			return null;
		}

		// Fetch Today Stats (check if there are stats for today)
		const todayStats = await UserDailyStats.findOne({
			userID,
			date: todayDate, // Match today's date in ISO format
		});
		// console.log("Today Stats:", todayStats); // Debugging line to check if data exists for today

		// Fetch Yesterday Stats (using the separate variable for yesterday date)
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1); // 1 day before today
		const yesterdayDate = yesterday.toISOString().split("T")[0]; // Date for yesterday
		const yesterdayStats = await UserDailyStats.findOne({
			userID,
			date: yesterdayDate,
		});
		// console.log("Yesterday Stats:", yesterdayStats); // Debugging line to check if data exists for yesterday

		// Get all data within the date range for the last 7 and 30 days
		const last7DaysStats = await UserDailyStats.aggregate([
			{
				$match: {
					userID,
					date_fns: {
						$gte: last7DaysFormatted,
						$lte: todayFormatted,
					},
				},
			},
			{
				$unwind: "$accounts", // Unwind the accounts array
			},
			{
				$group: {
					_id: {
						accountType: "$accounts.accountType",
						accountFormat: "$accounts.accountFormat",
					},
					totalRate: { $sum: "$accounts.totalRate" },
					totalCount: { $sum: "$accounts.count" },
				},
			},
		]);
		console.log("Last 7 Days Stats:", last7DaysStats); // Debugging line to check if stats exist for the last 7 days

		const last30DaysStats = await UserDailyStats.aggregate([
			{
				$match: {
					userID,
					date_fns: {
						$gte: last30DaysFormatted,
						$lte: todayFormatted,
					},
				},
			},
			{
				$unwind: "$accounts", // Unwind the accounts array
			},
			{
				$group: {
					_id: {
						accountType: "$accounts.accountType",
						accountFormat: "$accounts.accountFormat",
					},
					totalRate: { $sum: "$accounts.totalRate" },
					totalCount: { $sum: "$accounts.count" },
				},
			},
		]);
		console.log("Last 30 Days Stats:", last30DaysStats); // Debugging line to check if stats exist for the last 30 days

		const totalStats = await UserDailyStats.aggregate([
			{
				$match: { userID },
			},
			{
				$unwind: "$accounts", // Unwind the accounts array
			},
			{
				$group: {
					_id: {
						accountType: "$accounts.accountType",
						accountFormat: "$accounts.accountFormat",
					},
					totalRate: { $sum: "$accounts.totalRate" },
					totalCount: { $sum: "$accounts.count" },
				},
			},
		]);
		console.log("Total Stats:", totalStats); // Debugging line to check total stats

		// Return the aggregated stats
		return {
			today: todayStats ? todayStats.accounts : [],
			lastDay: yesterdayStats ? yesterdayStats.accounts : [],
			last7Days: last7DaysStats,
			last30Days: last30DaysStats,
			total: totalStats,
		};
	} catch (error) {
		console.error("Error fetching user stats:", error);
		return null;
	}
};

exports.getUserStatsCharts = async userID => {
	const today = new Date();
	const todayDate = today.toISOString().split("T")[0]; // e.g., "2024-11-19"

	// Get the last 30 days
	const last30Days = new Date(today);
	last30Days.setDate(today.getDate() - 30);

	try {
		// Fetch data for the last 30 days
		const last30DaysChartData = await UserDailyStats.aggregate([
			{
				$match: {
					userID,
					date: {
						$gte: last30Days.toISOString().split("T")[0],
						$lte: todayDate,
					},
				},
			},
			{
				$unwind: "$accounts", // Flatten the accounts array
			},
			{
				$group: {
					_id: {
						date: "$date",
						accountType: "$accounts.accountType",
						accountFormat: "$accounts.accountFormat",
					},
					totalRate: { $sum: "$accounts.totalRate" },
					totalCount: { $sum: "$accounts.count" },
				},
			},
			{
				$sort: { "_id.date": 1 }, // Sort by date in ascending order
			},
		]);

		// Transform data into a chart-friendly format
		const chartData = {};
		last30DaysChartData.forEach(item => {
			const date = item._id.date;
			if (!chartData[date]) {
				chartData[date] = {
					date,
					stats: [],
				};
			}
			chartData[date].stats.push({
				accountType: item._id.accountType,
				accountFormat: item._id.accountFormat,
				totalRate: item.totalRate,
				totalCount: item.totalCount,
			});
		});

		// Convert object to sorted array for the chart
		const formattedChartData = Object.values(chartData).map(entry => ({
			date: entry.date,
			stats: entry.stats,
		}));

		// Return data including the chart statistics
		return {
			last30DaysChartData: formattedChartData,
		};
	} catch (error) {
		console.error("Error fetching 30-day stats for chart:", error);
		return null;
	}
};
