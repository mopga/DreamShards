import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { saveRouter } from "./routes/save";
import { contentRouter } from "./routes/content";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

app.use("/api/save", saveRouter);
app.use("/api/content", contentRouter);

(async () => {
  const server = createServer(app);

  const runningInPkg = typeof process.pkg !== "undefined";
  const isDevelopment = app.get("env") === "development" && !runningInPkg;

  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use(errorHandler);

  const port = Number(process.env.PORT ?? 5000);
  const host = process.env.HOST ?? "0.0.0.0";

  server.listen({ port, host }, () => {
    log(`serving on port ${port}`);
  });
})();

