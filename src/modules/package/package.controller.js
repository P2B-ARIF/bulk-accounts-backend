const User = require("../auth/auth.model");
const Account = require("../account/account.model");
const NodeCache = require("node-cache");
const Package = require("./package.model");

const dataCache = new NodeCache({ stdTTL: 600 });

exports.createPackage = async (req, res) => {
	try {
		const body = req.body;
		body.rate = Number(body.rate);
		body.time = Number(body.time);

		if (isNaN(body.rate) || isNaN(body.time)) {
			return res
				.status(400)
				.json({ message: "Rate and Time must be valid numbers" });
		}

		const find = await Package.findOne({
			$and: [
				{ accountType: body.accountType },
				{ accountFormat: body.accountFormat },
			],
		});

		if (find) {
			return res.status(400).json({ message: "Package already exists." });
		}

		const newPackage = new Package(body);
		await newPackage.save();

		dataCache.del("packages");

		res
			.status(201)
			.json({ success: true, message: "Package created successfully" });
	} catch (err) {
		// Catch and handle any errors
		console.error(err.message);
		res
			.status(500)
			.json({ message: "Error creating package", error: err.message });
	}
};

// package update
exports.updatePackage = async (req, res) => {
	try {
		const { packageId } = req.params; // Assuming package ID is passed in the URL
		const body = req.body;

		// Convert rate and time to numbers
		body.rate = Number(body.rate);
		body.time = Number(body.time);

		// Validate rate and time
		if (isNaN(body.rate) || isNaN(body.time)) {
			return res
				.status(400)
				.json({ message: "Rate and Time must be valid numbers" });
		}

		// Check if package exists
		const existingPackage = await Package.findById(packageId);
		if (!existingPackage) {
			return res.status(404).json({ message: "Package not found" });
		}

		// Update the package
		const updatedPackage = await Package.findByIdAndUpdate(
			packageId,
			{ $set: body },
			{ new: true }, // Return the updated document
		);

		// Clear the cache
		dataCache.del("packages");

		// Respond with success
		res.status(200).json({
			success: true,
			message: "Package updated successfully",
			data: updatedPackage,
		});
	} catch (err) {
		// Catch and handle any errors
		console.error(err.message);
		res
			.status(500)
			.json({ message: "Error updating package", error: err.message });
	}
};

// delete a package
exports.deletePackage = async (req, res) => {
	try {
		const { packageId } = req.params; // Assuming package ID is passed in the URL

		// Check if package exists
		const existingPackage = await Package.findById(packageId);
		if (!existingPackage) {
			return res.status(404).json({ message: "Package not found" });
		}

		// Update the package
		const updatedPackage = await Package.findByIdAndDelete(packageId);

		// Clear the cache
		dataCache.del("packages");

		// Respond with success
		res.status(200).json({
			success: true,
			message: "Package deleted successfully",
			data: updatedPackage,
		});
	} catch (err) {
		// Catch and handle any errors
		console.error(err.message);
		res
			.status(500)
			.json({ message: "Error updating package", error: err.message });
	}
};

// all facebook packages find
exports.listPackage = async (req, res) => {
	try {
		let packages;

		if (dataCache.has("packages")) {
			packages = JSON.parse(dataCache.get("packages"));
		} else {
			packages = await Package.find({});
		}

		dataCache.set("packages", JSON.stringify(packages));
		res.status(201).json({ success: true, packages });
	} catch (err) {
		res
			.status(500)
			.json({ message: "Error listing packages", error: err.message });
	}
};
