import { Router, type IRouter } from "express";
import { authMiddleware } from "../middlewares/auth";
import healthRouter from "./health";
import organizationsRouter from "./organizations";
import packagesRouter from "./packages";
import routersRouter from "./routers";
import ispUsersRouter from "./isp-users";
import vouchersRouter from "./vouchers";
import pppoeRouter from "./pppoe";
import paymentsRouter from "./payments";
import sessionsRouter from "./sessions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authMiddleware);
router.use(organizationsRouter);
router.use(packagesRouter);
router.use(routersRouter);
router.use(ispUsersRouter);
router.use(vouchersRouter);
router.use(pppoeRouter);
router.use(paymentsRouter);
router.use(sessionsRouter);
router.use(dashboardRouter);

export default router;
