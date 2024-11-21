const { format } = require("date-fns/format");
const mongoose = require("mongoose");

const BlackHoleSchema = new mongoose.Schema({
	uid: { type: String },
	password: { type: String },
	email: { type: String },
	key: { type: String },
	cookie: { type: String },

	// account information
	accountType: { type: String },
	accountFormat: {
		type: String,

		set: value => value.toLowerCase(),
	},
	rate: { type: Number },

	// user information
	userID: { type: String },
	userEmail: { type: String },

	// account status
	approved: { type: Boolean },
	correction: { type: Boolean },
	resolved: { type: Boolean },
	attempt: { type: Number, default: 0 },
	die: { type: Boolean, default: false },
	createdAt: {
		date: { type: Date, default: new Date() },
		date_fns: { type: String },
	},
});

// Pre-save hook to set the `date_fns` field
BlackHoleSchema.pre("save", function (next) {
	this.createdAt.date_fns = format(new Date(), "dd-MM-yyyy");
	next();
});

const BlackHole = mongoose.model("BlackHole", BlackHoleSchema);

module.exports = BlackHole;
