const { format } = require("date-fns/format");
const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
	accountType: { type: String, required: [true, "Account type is required"] },
	accountFormat: {
		type: String,
		required: [true, "Account format is required"],
	},
	rate: { type: Number, required: [true, "Rate is required"] },
	time: { type: Number, required: [true, "Time is required"] },
	active: { type: Boolean, default: true },
	message: { type: String, required: [true, "Message is required"] },
	fileUrl: { type: String, required: [true, "File URL is required"] },

	createdAt: {
		date: { type: Date, default: new Date() },
		date_fns: { type: String },
	},
});

// Pre-save hook to set the `date_fns` field
PackageSchema.pre("save", function (next) {
	this.createdAt.date_fns = format(new Date(), "dd-MM-yyyy");
	next();
});

const Package = mongoose.model("Package", PackageSchema);

module.exports = Package;
