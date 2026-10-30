import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

function paymentsApiPlugin(env) {
  return {
    name: "payments-api",
    configureServer(server) {
      // Mirror Vercel /api routes so local Pay works when PUBLIC_SITE_URL is set.
      for (const [key, value] of Object.entries(env)) {
        process.env[key] = value;
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        const isCreate = url.startsWith("/api/create-checkout");
        const isConfirm = url.startsWith("/api/confirm-checkout");
        const isImage = url.startsWith("/api/image-upload");
        if (!isCreate && !isConfirm && !isImage) return next();

        res.setHeader("Content-Type", "application/json");

        try {
          if (isImage) {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }
            const { createImageUpload } = await import(
              "./server/imageUpload.js"
            );
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString("utf8");
            const result = await createImageUpload(raw ? JSON.parse(raw) : {});
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          const { createCourseCheckout, confirmCheckout } = await import(
            "./server/createCheckout.js"
          );

          if (isCreate) {
            if (req.method === "OPTIONS") {
              res.statusCode = 204;
              res.end();
              return;
            }
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks).toString("utf8");
            const body = raw ? JSON.parse(raw) : {};
            const result = await createCourseCheckout(req, body);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            res.end();
            return;
          }
          if (req.method !== "GET") {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          const params = new URL(url, "http://localhost").searchParams;
          const reference = params.get("reference") || params.get("trxref");
          const result = await confirmCheckout(reference);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: err.message || "Request failed" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), paymentsApiPlugin(env)],
  };
});
