const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const { port } = require("./config/env");
const helmet = require("helmet");

const authRoutes = require("./modules/auth/auth.routes");
const packageRoutes = require("./modules/package/package.routes");
const Message = require("./modules/message/message.routes");
const accountRoutes = require("./modules/account/account.routes");
const withdrawRoutes = require("./modules/withdraw/withdraw.routes");
const maintenanceRoutes = require("./modules/maintenance/maintenance.routes");
const { default: rateLimit } = require("express-rate-limit");
const { deleteDieAccount } = require("./middlewares/deleteDieAccount");
const cron = require("node-cron");

// const userDailyStats = require("./modules/userDailyStats/dailyStats.routes");

// const { checkBlockStatus } = require("./middlewares/checkBlockStatus");

// const corsOptions = {
// 	origin: "https://gametopup.vercel.app",
// 	methods: ["GET", "POST", "PUT", "DELETE"],
// 	credentials: true,
// };

// Rate limiter (60 requests per minute)
const limiter = rateLimit({
	windowMs: 5 * 1000,
	max: 150,
	message: {
		status: 429,
		error: "Too many requests, please try again after a minute.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// app.use(cors(corsOptions));

dbConnect();

// Schedule the job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
	try {
		console.log("Running scheduled task: deleteDieAccount");
		await deleteDieAccount();
	} catch (err) {
		console.error("Error running scheduled task:", err.message);
	}
});

// deleteDieAccount();
// checkBlockStatus();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/messages", Message);
app.use("/api/accounts", accountRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// app.use("/api/dailyStats", userDailyStats);

// Start the server
app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
