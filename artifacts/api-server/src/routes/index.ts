import { Router, type IRouter } from "express";
import healthRouter from "./health";
import imagesRouter from "./images";
import settingsRouter from "./settings";
import siteImagesRouter from "./siteImages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(imagesRouter);
router.use(settingsRouter);
router.use(siteImagesRouter);

export default router;
