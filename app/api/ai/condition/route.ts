import { NextRequest, NextResponse } from "next/server";
import genAI from "@/lib/gemini";

export async function POST(req: NextRequest) {
  console.log("🚀 AI Condition API HIT");

  let selectedCondition = "Good";

  try {
    const body = await req.json();
    const { imageUrl, selectedCondition: sc } = body;

    selectedCondition = sc;

    console.log("📥 Input:", { imageUrl, selectedCondition });

    if (!imageUrl || !selectedCondition) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 🔹 STEP 1: Fetch image
    console.log("🖼 Fetching image...");
    const imageRes = await fetch(imageUrl);
    console.log("🖼 Status:", imageRes.status);

    const buffer = await imageRes.arrayBuffer();

    // 🔹 STEP 2: Convert to base64
    const base64Image = Buffer.from(buffer).toString("base64");
    console.log("📦 Base64 length:", base64Image.length);

    // 🔹 STEP 3: Initialize model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // 🔹 STEP 4: Prompt (STRICT)
    const prompt = `
Classify the product condition from the image into ONE of:

- New
- Good
- Used

Rules:
- New = unused, clean, no damage
- Good = slightly used, minor wear
- Used = visible wear, scratches, damage

Return ONLY valid JSON:
{
  "detectedCondition": "New | Good | Used"
}
`;

    console.log("🤖 Calling Gemini...");

    // 🔹 STEP 5: Gemini call
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    console.log("✅ Gemini response received");

    const text = result.response.text();
    console.log("🧠 Raw Response:", text);

    // 🔹 STEP 6: Safe parse
    let detected = selectedCondition;

    try {
      // Handle potential markdown formatting from Gemini
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(jsonStr);
      if (parsed.detectedCondition) {
        detected = parsed.detectedCondition;
      }
      console.log("✅ Parsed Condition:", detected);
    } catch {
      console.log("⚠️ JSON parse failed, using fallback");
    }

    // 🔹 STEP 7: Compare
    const mismatch =
      detected.toLowerCase() !== selectedCondition.toLowerCase();

    console.log("📊 Final:", { detected, selectedCondition, mismatch });

    return NextResponse.json({
      detectedCondition: detected,
      mismatch,
      aiFailed: false,
    });

  } catch (error: any) {
    console.error("❌ Gemini Error:", error);

    // 🔥 FALLBACK (CRITICAL)
    return NextResponse.json({
      detectedCondition: selectedCondition,
      mismatch: false,
      aiFailed: true,
    });
  }
}
