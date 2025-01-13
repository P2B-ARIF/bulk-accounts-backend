const Maintenance = require("./maintenance.model");

// Get current maintenance status
exports.currentMaintenance = async (req, res) => {
	try {
		const maintenance = await Maintenance.findOne();
		res.status(200).json(maintenance);
	} catch (err) {
		res.status(500).json({
			message: "Error fetching maintenance status",
			error: err.message,
		});
	}
};

// Update maintenance status
exports.updateMaintenance = async (req, res) => {
	try {
		const { enabled, message } = req.body;
		const maintenance = await Maintenance.findOneAndUpdate(
			{},
			{ enabled, message },
			{ new: true, upsert: true },
		);
		res.status(200).json(maintenance);
	} catch (err) {
		res.status(500).json({
			message: "Error updating maintenance status",
			error: err.message,
		});
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { password } = req.body;
		const result = await Maintenance.findOneAndUpdate(
			{},
			{ password: password },
		);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({
			message: "Error updating change password",
			error: err.message,
		});
	}
};

exports.updateMailBox = async (req, res) => {
	try {
		const { mailbox } = req.body;

		// Validate input
		if (!mailbox) {
			return res.status(400).json({ message: "Mailbox value is required" });
		}

		// Update the document
		const result = await Maintenance.findOneAndUpdate(
			{},
			{ mailbox }, // Directly using the mailbox value instead of wrapping it in an object
			{ new: true, upsert: true }, // Create a new document if it doesn't exist
		);

		return res.status(200).json({
			result,
			message: "Mailbox updated successfully",
		});
	} catch (err) {
		console.error("Error updating mailbox:", err); // Log the full error object for easier debugging
		return res.status(500).json({
			message: "Failed to update mailbox",
			error: err.message,
		});
	}
};
