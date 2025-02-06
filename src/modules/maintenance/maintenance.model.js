const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema(
	{
		enabled: { type: Boolean, default: false },
		message: { type: String, default: "" },
		password: { type: String },
		mailbox: { type: String },
		tempmail: { type: Boolean },
		mailboxToggle: { type: Boolean },
		embedMailToggle: { type: Boolean },
		embedmail: { type: String },
	},
	{ timestamps: true },
);

const Maintenance = mongoose.model("Maintenance", MaintenanceSchema);

module.exports = Maintenance;
