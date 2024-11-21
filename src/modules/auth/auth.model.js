const mongoose = require("mongoose");
const { format } = require("date-fns");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Name is required"],
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		lowercase: true,
		trim: true,
		unique: true,
		match: [/.+@.+\..+/, "Please enter a valid email address"], // Regex for email validation
	},
	gender: {
		type: String,
		enum: ["male", "female"],
		required: [true, "Gender is required"],
	},
	number: {
		type: Number,
		required: [true, "Number is required"],
	},
	role: {
		type: String,
		enum: ["admin", "user"],
		default: "user",
	},
	password: {
		type: String,
		required: [true, "Password is required"],
	},
	createdAt: {
		date: { type: Date, default: new Date() },
		date_fns: { type: String },
	},
	lastLogin: { type: Date, default: new Date() }, // Track the last login date
	isBlocked: { type: Boolean, default: false }, // Track blocked status
});

// Pre-save hook to set the `date_fns` field
userSchema.pre("save", function (next) {
	this.createdAt.date_fns = format(new Date(), "dd-MM-yyyy");
	next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
