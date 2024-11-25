const { format } = require("date-fns/format");
const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
	userName: { type: String, required: [true, "User Name is required"] },
	userID: { type: String, required: [true, "User ID is required"] },
	userEmail: { type: String, required: [true, "User Email is required"] },
	totalAccounts: { type: Number, required: [true, "Total amount is required"] },
	accountNumber: {
		type: Number,
		required: [true, "Account Number is required"],
	},
	accountName: { type: String, required: [true, "Account Name is required"] },
	amount: { type: Number, required: [true, "Amount is required"] },
	notes: { type: String },

	payment: { type: String, enum: ["pending", "success"], default: "pending" },
	paymentProved: { type: String },

	url: { type: String },

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
