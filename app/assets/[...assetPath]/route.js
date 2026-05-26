import path from "node:path";
import { readFile } from "node:fs/promises";

const ASSETS_ROOT = path.join(process.cwd(), "assets");
const CONTENT_TYPES = new Map([
  [".avif", "image/avif"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"],
]);

export async function GET(_request, { params }) {
  const { assetPath = [] } = await params;
  const filePath = path.join(ASSETS_ROOT, ...assetPath);
  const relativePath = path.relative(ASSETS_ROOT, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const body = await readFile(filePath);
    const contentType = CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
