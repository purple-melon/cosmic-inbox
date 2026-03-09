"use client";

import { useEffect, useState } from "react";
import type { Spark } from "@/types/spark";

export default function HomePage() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clarifyingId, setClarifyingId] = useState<string | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadSparks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sparks");
      if (!res.ok) throw new Error("Failed to load sparks");
      const json = await res.json();
      setSparks(json.sparks ?? []);
    } catch (e) {
      console.error(e);
      setError("Could not load sparks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSparks();
  }, []);

  async function handleCreateSpark(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/sparks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: newText.trim() })
      });
      if (!res.ok) throw new Error("Failed to create spark");
      const json = await res.json();
      setNewText("");
      setSparks((prev) => [json.spark, ...prev]);
    } catch (e) {
      console.error(e);
      setError("Could not create spark.");
    } finally {
      setCreating(false);
    }
  }

  async function handleClarify(id: string) {
    setClarifyingId(id);
    setError(null);
    setActiveDraft(null);
    try {
      const res = await fetch(`/api/sparks/${id}/clarify`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to clarify spark");
      const json = await res.json();
      setSparks((prev) =>
        prev.map((s) => (s.id === id ? json.spark : s))
      );
    } catch (e) {
      console.error(e);
      setError("Could not clarify spark.");
    } finally {
      setClarifyingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/sparks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete spark");
      setSparks((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
      setError("Could not delete spark.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePostDraft(id: string) {
    setDraftingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/sparks/${id}/post-draft`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to generate post draft");
      const json = await res.json();
      setActiveDraft(json.draft.body as string);
    } catch (e) {
      console.error(e);
      setError("Could not generate post draft.");
    } finally {
      setDraftingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Cosmic Inbox</h1>
        <p className="text-sm text-slate-400">
          Capture messy sparks, clarify them into clear ideas, and explore
          expressions.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 uppercase tracking-[0.16em]">
          Capture
        </h2>
        <form
          onSubmit={handleCreateSpark}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
        >
          <textarea
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            rows={3}
            placeholder="Drop a messy spark here..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              This inbox is just for you. Capture first, refine later.
            </span>
            <button
              type="submit"
              disabled={creating || !newText.trim()}
              className="inline-flex items-center rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Saving..." : "Save Spark"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300 uppercase tracking-[0.16em]">
            Library
          </h2>
          <button
            onClick={() => void loadSparks()}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-md px-2 py-1">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-sm text-slate-400">Loading your sparks…</p>
        )}

        {!loading && sparks.length === 0 && (
          <p className="text-sm text-slate-500">
            No sparks yet. Capture your first messy thought above.
          </p>
        )}

        <div className="space-y-3">
          {sparks.map((spark) => (
            <div
              key={spark.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
            >
              <p className="text-sm text-slate-200 whitespace-pre-wrap">
                {spark.raw_text}
              </p>

              {spark.summary && (
                <p className="text-xs text-slate-400">
                  <span className="font-medium text-slate-300">Summary:</span>{" "}
                  {spark.summary}
                </p>
              )}

              {spark.core_idea && (
                <p className="text-xs text-slate-400">
                  <span className="font-medium text-slate-300">
                    Core idea:
                  </span>{" "}
                  {spark.core_idea}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400">
                  {spark.category ?? "Uncategorized"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {spark.status === "clarified"
                    ? "Clarified"
                    : spark.status === "archived"
                    ? "Archived"
                    : "Captured"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => void handleClarify(spark.id)}
                  disabled={clarifyingId === spark.id}
                  className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 hover:border-indigo-400 hover:text-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clarifyingId === spark.id ? "Clarifying…" : "Clarify"}
                </button>
                <button
                  type="button"
                  onClick={() => void handlePostDraft(spark.id)}
                  disabled={draftingId === spark.id}
                  className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 hover:border-emerald-400 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {draftingId === spark.id
                    ? "Generating post…"
                    : "Generate post draft"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(spark.id)}
                  disabled={deletingId === spark.id}
                  className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-400 hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60 ml-auto"
                >
                  {deletingId === spark.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeDraft && (
          <div className="mt-4 rounded-xl border border-emerald-700/70 bg-emerald-950/40 p-4 space-y-2">
            <h3 className="text-xs font-semibold tracking-[0.16em] text-emerald-200 uppercase">
              Generated Post Draft
            </h3>
            <p className="whitespace-pre-wrap text-sm text-emerald-50">
              {activeDraft}
            </p>
            <p className="text-[11px] text-emerald-200/80">
              Copy, tweak, and publish wherever you like. You stay the thinker.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}


