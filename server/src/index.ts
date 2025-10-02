import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { saveRouter } from "./routes/save";
import { contentRouter } from "./routes/content";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown;

  const originalJson = res.json.bind(res);
  res.json = ((body: any) => {
    capturedJsonResponse = body;
    return originalJson(body);
  }) as typeof res.json;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const serialised = JSON.stringify(capturedJsonResponse);
        line += ` :: ${serialised}`;
      }
      if (line.length > 160) {
        line = `${line.slice(0, 157)}...`;
      }
      log(line);
    }
  });

  next();
});

app.use("/api/save", saveRouter);
app.use("/api/content", contentRouter);

function registerErrorHandler() {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`${status} ${message}`, "error");
    res.status(status).json({ ok: false, message });
  });
}

(async () => {
  const server = createServer(app);

  const runningInPkg = typeof process.pkg !== "undefined";
  const isDevelopment = app.get("env") === "development" && !runningInPkg;

  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  registerErrorHandler();

  const port = Number(process.env.PORT ?? 5000);
  const host = process.env.HOST ?? "0.0.0.0";

  server.listen({ port, host }, () => {
    log(`serving on port ${port}`);
  });
})();
