import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const products = await Product.find({ sellerId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(products);
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

    const { image, ...rest } = body;

    const product = await Product.create({
      ...rest,
      image,
      sellerId: session.user.id,
      sellerDomain,
      status: body.status || "active",
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
