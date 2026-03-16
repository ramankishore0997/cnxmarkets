import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import kycRouter from "./kyc.js";
import strategiesRouter from "./strategies.js";
import accountsRouter from "./accounts.js";
import transactionsRouter from "./transactions.js";
import tradesRouter from "./trades.js";
import notificationsRouter from "./notifications.js";
import contactRouter from "./contact.js";
import usersRouter from "./users.js";
import adminRouter from "./admin.js";
import adminSettingsRouter from "./adminSettings.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/kyc", kycRouter);
router.use("/strategies", strategiesRouter);
router.use("/accounts", accountsRouter);
router.use("/transactions", transactionsRouter);
router.use("/trades", tradesRouter);
router.use("/notifications", notificationsRouter);
router.use("/contact", contactRouter);
router.use("/users", usersRouter);
router.use("/admin", adminRouter);
router.use("/admin", adminSettingsRouter);

export default router;
