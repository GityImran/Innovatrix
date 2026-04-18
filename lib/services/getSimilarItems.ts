import Product from "@/models/Product";

/**
 * Query MongoDB Product collection for similar items.
 * 
 * - category EXACT match
 * - title using regex (from extracted keywords)
 * - Exclude current item if editing
 * - Limit results (e.g., 20 items max)
 */
export const getSimilarItems = async (
  category: string,
  keywords: string[],
  excludeId?: string
) => {
  if (keywords.length === 0) return [];

  const query: any = {
    category,
    status: "active",
    $or: keywords.map(k => ({
      title: { $regex: k, $options: "i" }
    }))
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
};
