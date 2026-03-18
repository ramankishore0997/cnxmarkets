import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";

const app: Express = express();

app.set("trust proxy", 1);

const ALLOWED_ORIGINS = [
  "https://ecmarketsindia.com",
  "https://www.ecmarketsindia.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith(".replit.dev") ||
        origin.endsWith(".replit.app") ||
        origin.endsWith(".kirk.replit.dev") ||
        origin.endsWith(".picard.replit.dev")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const uploadsDir = path.resolve(process.cwd(), "uploads");
app.use("/api/uploads", express.static(uploadsDir));

app.use("/api", router);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
