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
    console.error("Error fetching spark for clarification", fetchError);
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

  const prompt = `
You are helping a creator clarify their thinking.

Given the raw spark text, respond strictly in JSON with:
- summary: 1-2 sentence summary of the idea
- core_idea: a single clear sentence capturing the core insight
- category: one of ["Insight","Lesson","Quote","Content Idea","Story Seed","Business Idea","Task"]

Raw spark:
---
${spark.raw_text}
---

Return ONLY JSON.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You clarify and categorize short ideas for a thinking tool."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: {
      summary?: string;
      core_idea?: string;
      category?: string;
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      // Best-effort: if the model didn't return valid JSON, just bail
      console.error("Failed to parse OpenAI clarify JSON", raw);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const { summary, core_idea, category } = parsed;

    const { data: updated, error: updateError } = await supabase
      .from("sparks")
      .update({
        summary: summary ?? spark.summary,
        core_idea: core_idea ?? spark.core_idea,
        category: category ?? spark.category,
        status: "clarified"
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("Error updating clarified spark", updateError);
      return NextResponse.json(
        { error: "Failed to update spark" },
        { status: 500 }
      );
    }

    return NextResponse.json({ spark: updated });
  } catch (err) {
    console.error("Error calling OpenAI for clarify", err);
    return NextResponse.json(
      { error: "AI clarify failed" },
      { status: 500 }
    );
  }
}

