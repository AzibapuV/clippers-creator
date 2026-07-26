"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Link as LinkIcon } from "lucide-react";

export default function AddVideoForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitFile(file: File) {
    setError(null);
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`/api/projects/${projectId}/videos`, {
        method: "POST",
        body: form
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.refresh();
    } catch {
      setError("Upload failed. Try again.");
      setLoading(false);
    }
  }

  async function submitUrl(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Import failed");
        setLoading(false);
        return;
      }

      setUrl("");
      setLoading(false);
      router.refresh();
    } catch {
      setError("Import failed. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="border border-ink-line rounded-xl p-5">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("upload")}
          className={`text-xs font-mono px-3 py-1.5 rounded-md transition-colors ${
            mode === "upload" ? "bg-signal text-ink" : "bg-ink border border-ink-line text-muted"
          }`}
        >
          UPLOAD FILE
        </button>
        <button
          onClick={() => setMode("url")}
          className={`text-xs font-mono px-3 py-1.5 rounded-md transition-colors ${
            mode === "url" ? "bg-signal text-ink" : "bg-ink border border-ink-line text-muted"
          }`}
        >
          PASTE LINK
        </button>
      </div>

      {mode === "upload" ? (
        <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-ink-line rounded-lg py-10 cursor-pointer hover:border-wave/50 transition-colors">
          <UploadCloud className="h-6 w-6 text-muted" />
          <span className="text-sm text-muted">
            {loading ? "Uploading…" : "Tap to choose a video file"}
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) submitFile(file);
            }}
          />
        </label>
      ) : (
        <form onSubmit={submitUrl} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-ink border border-ink-line rounded-md px-3 py-2.5">
            <LinkIcon className="h-4 w-4 text-muted shrink-0" />
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-signal text-ink font-medium py-2.5 rounded-md hover:bg-signal/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Importing…" : "Add video"}
          </button>
        </form>
      )}

      {error && <p className="text-signal text-sm mt-3">{error}</p>}
    </div>
  );
}
