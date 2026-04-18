/**
 * Extract top 2-3 keywords from a title.
 * 
 * Rules:
 * - Convert title to lowercase
 * - Remove stopwords: ["for", "the", "and", "with", "a", "an"]
 * - Split words
 * - Return top 2-3 keywords
 */
export const extractKeywords = (title: string): string[] => {
  const stopwords = ["for", "the", "and", "with", "a", "an"];
  
  const keywords = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopwords.includes(word));
    
  return keywords.slice(0, 3);
};
