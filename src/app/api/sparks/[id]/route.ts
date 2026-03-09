import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// DELETE /api/sparks/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase.from("sparks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting spark", error);
    return NextResponse.json(
      { error: "Failed to delete spark" },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
