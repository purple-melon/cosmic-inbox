import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface RouteContext {
  params: { id: string };
}

export async function POST(_req: Request, context: RouteContext) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data: spark, error: fetchError } = await supabase
    .from("sparks")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !spark) {
    console.error("Error fetching spark for post draft", fetchError);
    return NextResponse.json(
      { error: "Spark not found" },
      { status: 404 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const baseText =
    spark.summary ||
    spark.core_idea ||
    spark.raw_text ||
    "An idea about entrepreneurship.";

  const prompt = `
Turn the following idea into a short, high-signal social post suitable for LinkedIn or X.

Constraints:
- 2-4 short sentences
- Clear, direct, and practical
- No hashtags, no emojis
- Do not mention that you are an AI.

Idea:
---
${baseText}
---
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You help creators turn clarified ideas into concise social media posts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6
    });

    const body = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!body) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 500 }
      );
    }

    const { data: draft, error: insertError } = await supabase
      .from("post_drafts")
      .insert([{ spark_id: id, body }])
      .select("*")
      .single();

    if (insertError || !draft) {
      console.error("Error saving post draft", insertError);
      return NextResponse.json(
        { error: "Failed to save post draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ draft });
  } catch (err) {
    console.error("Error calling OpenAI for post draft", err);
    return NextResponse.json(
      { error: "AI post draft failed" },
      { status: 500 }
    );
  }
}

