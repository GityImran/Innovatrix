import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { extractKeywords } from "@/lib/utils/extractKeywords";
import { getSimilarItems } from "@/lib/services/getSimilarItems";
import { calculatePriceStats } from "@/lib/utils/calculatePriceStats";
import { IProduct } from "@/models/Product";

/**
 * POST /api/products/similar
 * 
 * Request: { title: string, category: string, condition: string, price: number, excludeId?: string }
 * Response: { 
 *   hasData: boolean, 
 *   lowData: boolean, 
 *   count: number,
 *   avgPrice?: number, 
 *   medianPrice?: number, 
 *   minPrice?: number, 
 *   maxPrice?: number, 
 *   recommendedRange?: [number, number], 
 *   priceDifferencePercent?: number, 
 *   priceDifferenceAmount?: number,
 *   recommendation: string,
 *   similarItems: Product[] 
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { title, category, condition, price, excludeId } = await req.json();

    if (!title || !category || !condition) {
      return NextResponse.json(
        { error: "Title, category, and condition are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Extract keywords
    const keywords = extractKeywords(title);

    // 2. Get similar items (all conditions for the list) - Pass excludeId to filter current product
    const similarItems = await getSimilarItems(category, keywords, excludeId) as unknown as IProduct[];

    if (similarItems.length === 0) {
      return NextResponse.json({
        hasData: false,
        lowData: true,
        count: 0,
        recommendation: "Not enough data to analyze price",
        similarItems: [],
      });
    }

    // 3. Filter for stats based on the SAME condition
    const sameConditionItems = similarItems.filter(
      (item: IProduct) => item.condition.toLowerCase() === condition.toLowerCase()
    );

    if (sameConditionItems.length === 0) {
      return NextResponse.json({
        hasData: false,
        lowData: true,
        count: 0,
        recommendation: "Not enough data for this condition",
        similarItems, // Return all items for the buyer's list
      });
    }

    const prices = sameConditionItems.map((item: IProduct) => item.expectedPrice);
    const stats = calculatePriceStats(prices);

    if (!stats) {
      return NextResponse.json({
        hasData: false,
        lowData: true,
        count: sameConditionItems.length,
        recommendation: "Not enough data to provide price insights",
        similarItems,
      });
    }

    // Advanced Recommendation Logic
    let priceDifferencePercent = 0;
    let priceDifferenceAmount = 0;
    let recommendation = "";

    if (price && stats.medianPrice > 0) {
      priceDifferenceAmount = price - stats.medianPrice;
      priceDifferencePercent = Math.round((priceDifferenceAmount / stats.medianPrice) * 100);

      if (priceDifferencePercent < 0) {
        recommendation = "Good deal — priced lower than similar items";
      } else if (priceDifferencePercent <= 10) {
        recommendation = "Fair price";
      } else if (priceDifferencePercent <= 25) {
        recommendation = "Slightly overpriced";
      } else {
        recommendation = "Overpriced — consider other options";
      }
    }

    // Special message for very low data
    if (sameConditionItems.length === 1) {
      recommendation = "Only one similar item found — use as reference";
    }

    return NextResponse.json({
      hasData: true,
      lowData: stats.lowData,
      count: sameConditionItems.length,
      avgPrice: stats.avgPrice,
      medianPrice: stats.medianPrice,
      minPrice: stats.minPrice,
      maxPrice: stats.maxPrice,
      recommendedRange: stats.recommendedRange,
      priceDifferencePercent,
      priceDifferenceAmount,
      recommendation,
      similarItems,
    });
  } catch (error: any) {
    console.error("Similar products API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
