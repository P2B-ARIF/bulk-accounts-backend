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
	listSaleAccounts,
	deleteSaleAccounts,
	downloadedAccounts,
	deleteAccount,
	getAllAccounts,
} = require("./account.controller");
const isAdmin = require("../../middlewares/isAdmin");
const router = express.Router();

// POST: Create a new account
router.post("/create", authMiddleware, createAccount);
router.put("/resolved/:id", authMiddleware, resolvedAccount);

router.delete("/delete/:id", authMiddleware, deleteAccount);

// user all data fetching routes
router.get("/everything", authMiddleware, everyThings);

// admin routes
router.get("/all", authMiddleware, listAccounts);
router.get("/all-accounts", authMiddleware, getAllAccounts);
router.get("/nor-approved", authMiddleware, norApprovedAccounts);
router.get("/approved", authMiddleware, approvedAccounts);
router.put("/", authMiddleware, actionAccounts);
router.put("/downloaded", authMiddleware, downloadedAccounts);

router.get("/sale", isAdmin, listSaleAccounts);
router.put("/sale/sold", deleteSaleAccounts);

module.exports = router;
