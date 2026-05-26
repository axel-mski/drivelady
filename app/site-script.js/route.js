import path from "node:path";
import { readFile } from "node:fs/promises";

export async function GET() {
  try {
    const body = await readFile(path.join(process.cwd(), "script.js"));

    return new Response(body, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
