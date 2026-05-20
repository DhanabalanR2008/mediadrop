import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mediaRouter from "./media";
import downloadsRouter from "./downloads";
import statsRouter from "./stats";
import downloadProxyRouter from "./download-proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mediaRouter);
router.use(downloadsRouter);
router.use(statsRouter);
router.use(downloadProxyRouter);

export default router;
