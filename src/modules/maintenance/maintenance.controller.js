const Maintenance = require("./maintenance.model");

// Get current maintenance status
exports.currentMaintenance = async (req, res) => {
	try {
		const maintenance = await Maintenance.findOne().sort({ createdAt: -1 }); // Fetch the latest entry
		const isActive =
			maintenance?.enabled && Date.now() < new Date(maintenance.endTime);
		res.json({ ...maintenance?._doc, isActive });
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
		const { enabled, message, duration } = req.body;

		// Calculate new end time
		const endTime = enabled ? new Date(Date.now() + duration * 60000) : null;

		// Update existing maintenance document or create it if none exists
		const maintenance = await Maintenance.findOneAndUpdate(
			{}, // Find the first document (can add filters if needed)
			{ enabled, message, endTime }, // Fields to update
			{ new: true, upsert: true }, // Return the updated document; create it if not found
		);

		res.json({
			success: true,
			maintenance: { ...maintenance._doc, isActive: enabled },
		});
	} catch (err) {
		res.status(500).json({
			message: "Error updating maintenance status",
			error: err.message,
		});
	}
};
