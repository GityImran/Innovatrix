import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import RentItem from "@/models/RentItem";
import { auth } from "@/lib/auth";

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

    const { image, ...rest } = body;

    const item = await RentItem.create({
      ...rest,
      pricing,
      availability,
      image,
      sellerId: session.user.id,
      sellerDomain,
      status: body.status || "active",
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
