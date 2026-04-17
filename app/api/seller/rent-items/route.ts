import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import RentItem from "@/models/RentItem";
import { auth } from "@/lib/auth";

/** Save base64 data-URLs as real files; return their public URL paths. */
async function persistImages(images: string[]): Promise<string[]> {
  if (!images || images.length === 0) return [];
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const paths: string[] = [];
  for (const dataUrl of images) {
    if (!dataUrl) continue;
    if (dataUrl.startsWith("/uploads/") || dataUrl.startsWith("http")) {
      paths.push(dataUrl);
      continue;
    }
    const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) continue;
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(match[2], "base64"));
    paths.push(`/uploads/${filename}`);
  }
  return paths;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const items = await RentItem.find({ sellerId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    // Extract domain from seller's verified session email (never from client input)
    const sellerEmail = session.user.email ?? "";
    const sellerDomain = sellerEmail.includes("@")
      ? sellerEmail.split("@")[1].toLowerCase()
      : "";

    // Normalise pricing field names: form sends pricePerDay/Week/Month,
    // schema stores day/week/month. Support both so nothing breaks.
    const rawPricing = body.pricing ?? {};
    const pricing = {
      day: rawPricing.day ?? rawPricing.pricePerDay,
      week: rawPricing.week ?? rawPricing.pricePerWeek,
      month: rawPricing.month ?? rawPricing.pricePerMonth,
    };

    // Normalise availability field names: form may send from/till or
    // availableFrom/availableTill.
    const rawAvail = body.availability ?? {};
    const availability = {
      from: rawAvail.from ?? rawAvail.availableFrom,
      till: rawAvail.till ?? rawAvail.availableTill,
    };

    const { images: rawImages, ...rest } = body;

    // Save images to public/uploads/ and store their URL paths in MongoDB
    const images = await persistImages(rawImages ?? []);

    const item = await RentItem.create({
      ...rest,
      pricing,
      availability,
      images,
      sellerId: session.user.id,
      sellerDomain,
      status: body.status || "active",
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
