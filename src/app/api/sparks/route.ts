import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/sparks - list recent sparks
export async function GET() {
  const { data, error } = await supabase
    .from("sparks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching sparks", error);
    return NextResponse.json(
      { error: "Failed to fetch sparks" },
      { status: 500 }
    );
  }

  return NextResponse.json({ sparks: data ?? [] });
}

// POST /api/sparks - create a new spark
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.rawText !== "string" || !body.rawText.trim()) {
    return NextResponse.json(
      { error: "rawText is required" },
      { status: 400 }
    );
  }

  const { rawText } = body;

  const { data, error } = await supabase
    .from("sparks")
    .insert([
      {
        raw_text: rawText,
        source_type: "text",
        status: "new"
      }
    ])
    .select("*")
    .single();

  if (error) {
    console.error("Error creating spark", error);
    return NextResponse.json(
      { error: "Failed to create spark" },
      { status: 500 }
    );
  }

  return NextResponse.json({ spark: data }, { status: 201 });
}

