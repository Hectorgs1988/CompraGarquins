import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { sessionMiddleware } from "./middleware/session.js";
import authRoutes from "./routes/auth.routes.js";
import listRoutes from "./routes/list.routes.js";
import recipesRoutes from "./routes/recipes.routes.js";
import nfcRoutes from "./routes/nfc.routes.js";

const app = express();

function isPrivateLanOrigin(origin) {
    return /^http:\/\/(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(origin);
}

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }

            if (env.corsOrigins.includes(origin)) {
                return callback(null, true);
            }

            if (env.nodeEnv === "development" && isPrivateLanOrigin(origin)) {
                return callback(null, true);
            }

            return callback(new Error("CORS origin not allowed"));
        },
        credentials: true
    })
);
app.use(helmet());
app.use(express.json());
app.use(sessionMiddleware);

app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "api" });
});

app.use("/auth", authRoutes);
app.use("/list", listRoutes);
app.use("/recipes", recipesRoutes);
app.use("/nfc", nfcRoutes);

export default app;
