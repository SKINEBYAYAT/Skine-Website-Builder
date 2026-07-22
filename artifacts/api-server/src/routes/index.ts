import { Router, type IRouter } from "express";
import healthRouter from "./health";
import imagesRouter from "./images";
import settingsRouter from "./settings";
import siteImagesRouter from "./siteImages";
import pricingRouter from "./pricing";
import beforeAfterRouter from "./beforeAfter";
import consultationRouter from "./consultation";

const router: IRouter = Router();

router.use(healthRouter);
// before-after pairs route must come before the generic images route
router.use(beforeAfterRouter);
router.use(imagesRouter);
router.use(settingsRouter);
router.use(siteImagesRouter);
router.use(pricingRouter);
router.use(consultationRouter);

export default router;
