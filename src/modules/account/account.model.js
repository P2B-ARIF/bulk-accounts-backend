const { format } = require("date-fns/format");
const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
	uid: { type: String, required: [true, "UID is required"], trim: true },
	password: { type: String, required: [true, "Password is required"] },
	email: { type: String, required: [true, "Email is required"] },
	key: { type: String },
	cookie: { type: String },

	// account information
	accountType: { type: String, required: [true, "Account type is required"] },
	accountFormat: {
		type: String,
		required: [true, "Account format is required"],
		set: value => value.toLowerCase(),
	},
	rate: { type: Number, required: [true, "Rate is required"] },

	// user information
	userID: { type: String, required: [true, "User ID is required"] },
	userEmail: { type: String, required: [true, "User email is required"] },

	// account status
	approved: { type: Boolean },
	downloaded: { type: Boolean },
	correction: { type: Boolean },
	resolved: { type: Boolean },
	attempt: { type: Number, default: 0 },
	die: { type: Boolean, default: false },
	createdAt: {
		date: { type: Date, default: Date.now },
		date_fns: { type: String },
	},
});

// Pre-save hook to set the `date_fns` field
AccountSchema.pre("save", function (next) {
	this.createdAt.date_fns = format(new Date(), "dd-MM-yyyy");
	next();
});

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
