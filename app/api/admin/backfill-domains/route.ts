/**
 * app/api/admin/backfill-domains/route.ts
 * One-time utility: backfills sellerDomain on all Products and RentItems
 * that were created before the sellerDomain field was added.
 *
 * Call once: GET /api/admin/backfill-domains
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import User from "@/models/User";

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch all users: build a map of userId → email domain
    const users = await User.find({}, "_id email").lean();
    const domainMap = new Map<string, string>();
    for (const u of users) {
      const domain =
        u.email?.includes("@") ? u.email.split("@")[1].toLowerCase() : "";
      domainMap.set(u._id.toString(), domain);
    }

    // Filter: items where sellerDomain is missing or empty string.
    // Using $or instead of $in to avoid TypeScript "undefined not assignable" error.
    const missingDomainFilter = {
      $or: [
        { sellerDomain: { $exists: false } },
        { sellerDomain: null },
        { sellerDomain: "" },
      ],
    };

    // Backfill Products missing sellerDomain
    const products = await Product.find(missingDomainFilter as any, "_id sellerId").lean();
    let productUpdated = 0;
    for (const p of products) {
      const domain = domainMap.get((p as any).sellerId?.toString() ?? "") ?? "";
      if (domain) {
        await Product.updateOne({ _id: p._id }, { $set: { sellerDomain: domain } });
        productUpdated++;
      }
    }

    // Backfill RentItems missing sellerDomain
    const rentItems = await RentItem.find(missingDomainFilter as any, "_id sellerId").lean();
    let rentUpdated = 0;
    for (const r of rentItems) {
      const domain = domainMap.get((r as any).sellerId?.toString() ?? "") ?? "";
      if (domain) {
        await RentItem.updateOne({ _id: r._id }, { $set: { sellerDomain: domain } });
        rentUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      productUpdated,
      rentUpdated,
      message: `Backfilled ${productUpdated} products and ${rentUpdated} rent items.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
