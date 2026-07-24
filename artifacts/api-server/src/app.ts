import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// CORS_ORIGIN: comma-separated list of allowed origins (e.g. your Vercel URL).
// If not set, all origins are allowed (fine for development; set it on Render).
const rawCorsOrigin = process.env.CORS_ORIGIN;
const corsOrigin: string | string[] | boolean = rawCorsOrigin
  ? rawCorsOrigin.split(",").map((s) => s.trim())
  : true;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
