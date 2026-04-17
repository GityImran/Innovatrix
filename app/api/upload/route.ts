import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

/**
 * POST /api/upload
 * Accepts an array of base64 data-URLs, writes them as real files to
 * public/uploads/, and returns their public URL paths.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await req.json();

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const savedPaths: string[] = [];

    for (const dataUrl of images) {
      if (!dataUrl || typeof dataUrl !== "string") continue;

      // Skip if it's already a real URL (e.g. already uploaded)
      if (dataUrl.startsWith("/uploads/") || dataUrl.startsWith("http")) {
        savedPaths.push(dataUrl);
        continue;
      }

      // Parse  data:<mime>;base64,<data>
      const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) continue;

      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      const base64Data = match[2];
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, Buffer.from(base64Data, "base64"));
      savedPaths.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ paths: savedPaths });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
