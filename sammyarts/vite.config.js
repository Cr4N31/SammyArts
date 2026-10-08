import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { ADMIN_PASSWORD } from "./src/admin/gate.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const worksFile = path.join(root, "src/data/works.json");
const uploadDir = path.join(root, "public/uploads");

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function isImage(buf) {
  if (buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return ".png";
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return ".gif";
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return ".webp";
  }
  return false;
}

function worksApi() {
  return {
    name: "works-api",
    configureServer(server) {
      server.middlewares.use("/api/works", (req, res, next) => {
        if (req.method !== "PUT") {
          next();
          return;
        }

        if (req.headers["x-admin-key"] !== ADMIN_PASSWORD) {
          res.statusCode = 401;
          res.end("Unauthorized");
          return;
        }

        readBody(req)
          .then((buf) => {
            const raw = buf.toString("utf8");
            if (raw.length > 1_000_000) {
              res.statusCode = 413;
              res.end("Too large");
              return;
            }

            const data = JSON.parse(raw);
            if (!Array.isArray(data)) {
              res.statusCode = 400;
              res.end("Expected a list");
              return;
            }

            const works = data.map((item, index) => ({
              id: Number(item?.id) || index + 1,
              title: String(item?.title ?? "").slice(0, 140),
              desc: String(item?.desc ?? "").slice(0, 600),
              img: String(item?.img ?? "").slice(0, 2000),
            }));

            fs.writeFileSync(worksFile, `${JSON.stringify(works, null, 2)}\n`);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          })
          .catch(() => {
            res.statusCode = 400;
            res.end("Bad JSON");
          });
      });

      server.middlewares.use("/api/upload", async (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }
        if (req.headers["x-admin-key"] !== ADMIN_PASSWORD) {
          res.statusCode = 401;
          res.end("Unauthorized");
          return;
        }

        try {
          const buf = await readBody(req);
          if (buf.length > 8 * 1024 * 1024) {
            res.statusCode = 413;
            res.end("Too large");
            return;
          }
          const ext = isImage(buf);
          if (!ext) {
            res.statusCode = 400;
            res.end("Use a JPG, PNG, WEBP, or GIF.");
            return;
          }
          fs.mkdirSync(uploadDir, { recursive: true });
          const name = `${Date.now()}${ext}`;
          fs.writeFileSync(path.join(uploadDir, name), buf);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ url: `/uploads/${name}` }));
        } catch {
          res.statusCode = 400;
          res.end("Upload failed");
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), worksApi()],
});
