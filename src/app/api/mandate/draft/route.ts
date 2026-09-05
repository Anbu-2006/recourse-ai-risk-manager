import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { createGroqChatCompletion } from "@/lib/groqClient";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.user_prompt || "";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt string is required" },
        { status: 400 }
      );
    }

    let category = "Groceries";
    let perItemCapPaisa = 50000; // ₹500
    let allowedMerchants = ["ExaStore"];
    let scheduleDays = ["Everyday"];
    let initialHoldPaisa = 200000; // ₹2,000

    const groqKey = process.env.GROQ_API_KEY;
    const isKeyValid = groqKey && !groqKey.includes("placeholder");

    if (isKeyValid) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const systemPrompt = `You are an institutional policy compiler for NPCI UPI Reserve Pay mandates.
Extract spending rules from the user prompt into structured JSON:
{
  "category": string (e.g., "Groceries", "Electronics", "Dining", "Office Supplies"),
  "per_item_cap_inr": number (max spending per item in INR),
  "daily_hold_inr": number (initial hold/reserve cap in INR, default 2000),
  "allowed_merchants": string[] (list of approved merchant names, default ["ExaStore"]),
  "schedule_days": string[] (e.g. ["Everyday"] or ["Saturday", "Sunday", "Monday"])
}
Output ONLY the valid JSON object.`;

        const raw = await createGroqChatCompletion({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.category) category = parsed.category;
          if (parsed.per_item_cap_inr) perItemCapPaisa = Math.round(Number(parsed.per_item_cap_inr) * 100);
          if (parsed.daily_hold_inr) initialHoldPaisa = Math.round(Number(parsed.daily_hold_inr) * 100);
          if (Array.isArray(parsed.allowed_merchants) && parsed.allowed_merchants.length > 0) {
            allowedMerchants = parsed.allowed_merchants;
          }
          if (Array.isArray(parsed.schedule_days) && parsed.schedule_days.length > 0) {
            scheduleDays = parsed.schedule_days;
          }
        }
      } catch (err) {
        console.warn("Groq mandate compilation failed, falling back to deterministic extraction:", err);
      }
    } else {
      // Deterministic regex extraction
      const capMatch = prompt.match(/(?:under|max|cap|limit|below)\s*(?:₹|inr|rs\.?)?\s*(\d+)/i);
      if (capMatch) {
        perItemCapPaisa = parseInt(capMatch[1], 10) * 100;
      }
      if (/electronic|gadget|laptop|phone/i.test(prompt)) {
        category = "Electronics";
        allowedMerchants = ["ExaStore"];
      } else if (/pharmacy|medicine|health/i.test(prompt)) {
        category = "Pharmacy";
        allowedMerchants = ["ExaStore"];
      } else if (/food|dining|restaurant|lunch/i.test(prompt)) {
        category = "Dining";
        allowedMerchants = ["ExaStore"];
      }
    }

    const mandateId = `mandate_staged_${Date.now()}`;
    const userVpa = "anbuselvan@upi";
    const db = getDb();

    db.prepare(`
      INSERT INTO mandates (
        mandate_id, user_vpa, category, per_item_cap_paisa,
        allowed_merchants, schedule_days, initial_hold_paisa,
        residual_balance_paisa, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mandateId,
      userVpa,
      category,
      perItemCapPaisa,
      JSON.stringify(allowedMerchants),
      JSON.stringify(scheduleDays),
      initialHoldPaisa,
      initialHoldPaisa,
      "PENDING_APPROVAL",
      Date.now()
    );

    return NextResponse.json({
      success: true,
      mandate_id: mandateId,
      draft: {
        category,
        per_item_cap_paisa: perItemCapPaisa,
        per_item_cap_inr: perItemCapPaisa / 100,
        allowed_merchants: allowedMerchants,
        schedule_days: scheduleDays,
        initial_hold_inr: initialHoldPaisa / 100,
        status: "PENDING_APPROVAL",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to draft mandate", details: error.message },
      { status: 500 }
    );
  }
}
