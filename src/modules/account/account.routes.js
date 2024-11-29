const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
	createAccount,
	everyThings,
	resolvedAccount,
	listAccounts,
	actionAccounts,
	approvedAccounts,
	norApprovedAccounts,
} = require("./account.controller");
const router = express.Router();

// POST: Create a new account
router.post("/create", authMiddleware, createAccount);

// GET: Fetch all accounts
// router.get("/", getAllAccounts);

// // GET: Fetch a single account by ID
// router.get("/:id", getAccountById);

// PUT: Update an account by ID
// router.put("/:id", updateAccount);

// DELETE: Remove an account by ID
// router.delete("/:id", deleteAccount);

router.put("/:id", authMiddleware, resolvedAccount);

// user all data fetching routes
router.get("/everything", authMiddleware, everyThings);

// admin routes
router.get("/all", authMiddleware, listAccounts);
router.get("/nor-approved", authMiddleware, norApprovedAccounts);
router.get("/approved", authMiddleware, approvedAccounts);

router.put("/", authMiddleware, actionAccounts);

module.exports = router;
