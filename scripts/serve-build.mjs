import { createServer } from "node:http";
import { URL } from "node:url";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";
const root = resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
};
createServer(async (request, response) => {
  let file;
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep))
      throw new Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    if (pathname === "/404/") response.statusCode = 404;
  } catch {
    file = resolve(root, "404.html");
    response.statusCode = 404;
  }
  try {
    const extension = extname(file);
    let body = await readFile(file);
    response.setHeader(
      "Content-Type",
      types[extension] ?? "application/octet-stream",
    );
    if (
      /html|js|css|svg|xml|txt/.test(extension) &&
      request.headers["accept-encoding"]?.includes("gzip")
    ) {
      body = gzipSync(body);
      response.setHeader("Content-Encoding", "gzip");
    }
    response.end(body);
  } catch {
    response.statusCode = 500;
    response.end("Build the portfolio first.");
  }
}).listen(4322, "127.0.0.1");
