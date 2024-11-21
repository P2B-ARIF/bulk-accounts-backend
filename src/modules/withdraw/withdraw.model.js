const { format } = require("date-fns/format");
const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
	userID: { type: String, required: [true, "Account type is required"] },
	userEmail: { type: String, required: [true, "Account type is required"] },
	totalAccounts: { type: Number, required: [true, "Total amount is required"] },
	accountNumber: { type: Number, required: [true, "Rate is required"] },
	accountName: { type: String, required: [true, "Rate is required"] },
	amount: { type: Number, required: [true, "Rate is required"] },
	notes: { type: String },

	payment: { type: String, enum: ["pending", "success"], default: "pending" },
	paymentProved: { type: String },

	createdAt: {
		date: { type: Date, default: new Date() },
		date_fns: { type: String },
	},
});

// Pre-save hook to set the `date_fns` field
withdrawSchema.pre("save", function (next) {
	this.createdAt.date_fns = format(new Date(), "dd-MM-yyyy");
	next();
});

const Withdraw = mongoose.model("Withdraw", withdrawSchema);

module.exports = Withdraw;
