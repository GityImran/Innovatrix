import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("🔑 Initializing Gemini 2.5 Flash...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default genAI;
