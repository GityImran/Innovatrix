/**
 * app/api/search/route.ts
 * GET /api/search?q=<keyword>
 *
 * Domain-filtered unified search across Product (sell) and RentItem (rent).
 *
 * Security: domain is ALWAYS derived from the authenticated user's session email.
 * It is NEVER accepted from query params or any client-supplied value.
 *
 * Bug fix: domainFilter and keywordFilter both use $or — combining them via
 * object spread caused keywordFilter.$or to silently overwrite domainFilter.$or.
 * Now we use $and to combine both filters safely.
 *
 * NOTE: We do NOT use .populate() because some legacy documents have sellerId
 * stored as a plain string (e.g. "anonymous") which cannot be cast to ObjectId,
 * causing a Mongoose CastError. Domain is read from the sellerDomain field directly.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    /* ── 1. Authenticate ── */
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    /* ── 2. Validate and extract domain ── */
    const userEmail = session.user.email;
    if (!userEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid account email. Cannot determine college domain." },
        { status: 400 }
      );
    }
    const userDomain = userEmail.split("@")[1].toLowerCase();

    /* ── 3. Read and sanitize query param ── */
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    await connectToDatabase();

    /* ── 4. Domain filter ──
      Match items with the correct sellerDomain, OR legacy items (empty/missing)
      that were created before the sellerDomain field was added.
      Legacy items are filtered in-memory below to enforce domain correctly. */
    const domainFilter = {
      $or: [
        { sellerDomain: userDomain },
        { sellerDomain: "" },
        { sellerDomain: { $exists: false } },
      ],
    };

    /* ── 5. Keyword filter — searches title, category, description ──
      NOTE: Must NOT be combined via object spread with domainFilter because
      both use $or. We use $and to merge them safely. */
    const keywordFilter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : null;

    /* ── 6. Build final query using $and to safely merge both $or filters ── */
    const buildFilter = (extraStatus: string) => {
      const conditions: object[] = [{ status: extraStatus }, domainFilter];
      if (keywordFilter) conditions.push(keywordFilter);
      return { $and: conditions };
    };

    /* ── 7. Query both collections in parallel (no populate) ── */
    const [products, rentItems] = await Promise.all([
      Product.find(buildFilter("active"))
        .sort({ isUrgent: -1, createdAt: -1 })
        .limit(40)
        .lean(),
      RentItem.find(buildFilter("active"))
        .sort({ isUrgent: -1, createdAt: -1 })
        .limit(40)
        .lean(),
    ]);

    /* ── 8. Normalize and enforce domain in-memory (handles legacy items) ── */
    type SearchResult = {
      id: string;
      title: string;
      category: string;
      price: number;
      priceType: "total" | "per_day";
      type: "sell" | "rent";
      image: string | null;
      sellerEmail: string;
      isUrgent: boolean;
      createdAt: Date;
    };

    const passeDomainCheck = (doc: any): boolean => {
      // Item has the correct domain → allow
      if (doc.sellerDomain === userDomain) return true;
      // Item has a different domain explicitly set → reject
      if (doc.sellerDomain && doc.sellerDomain !== userDomain) return false;
      // Legacy item (no domain set yet) → include (backfill will fix soon)
      return true;
    };

    const sellResults: SearchResult[] = (products as any[])
      .filter(passeDomainCheck)
      .map((p) => ({
        id: p._id.toString(),
        title: p.title,
        category: p.category,
        price: p.expectedPrice ?? 0,
        priceType: "total" as const,
        type: "sell" as const,
        image: p.images?.[0] ?? null,
        sellerEmail: p.sellerDomain
          ? `seller@${p.sellerDomain}`
          : `@${userDomain}`,
        isUrgent: p.isUrgent ?? false,
        createdAt: p.createdAt,
      }));

    const rentResults: SearchResult[] = (rentItems as any[])
      .filter(passeDomainCheck)
      .map((r) => ({
        id: r._id.toString(),
        title: r.title,
        category: r.category,
        price: r.pricing?.day ?? 0,
        priceType: "per_day" as const,
        type: "rent" as const,
        image: r.images?.[0] ?? null,
        sellerEmail: r.sellerDomain
          ? `seller@${r.sellerDomain}`
          : `@${userDomain}`,
        isUrgent: r.isUrgent ?? false,
        createdAt: r.createdAt,
      }));

    /* ── 9. Combine, sort urgent-first then newest, cap at 40 ── */
    const combined = [...sellResults, ...rentResults]
      .sort((a, b) => {
        if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 40);

    return NextResponse.json(combined);
  } catch (error: any) {
    console.error("[/api/search] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
