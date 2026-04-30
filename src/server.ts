import express from "express";
import { env } from "./config/env";
import healthRoutes from "./routes/health.routes";
import webhookRoutes from "./routes/webhook.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use("/webhook", webhookRoutes);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
