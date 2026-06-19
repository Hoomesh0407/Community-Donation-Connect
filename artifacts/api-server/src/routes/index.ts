import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import donationsRouter from "./donations";
import requestsRouter from "./requests";
import matchesRouter from "./matches";
import reviewsRouter from "./reviews";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/donations", donationsRouter);
router.use("/requests", requestsRouter);
router.use("/matches", matchesRouter);
router.use("/reviews", reviewsRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);
router.use("/stats", statsRouter);

export default router;
