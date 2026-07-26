import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Video } from "@prisma/client";
import { ArrowLeft, Scissors, Clock, FileVideo } from "lucide-react";
import AddVideoForm from "@/components/AddVideoForm";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  DOWNLOADING: "Downloading",
  TRANSCRIBING: "Transcribing",
  ANALYZING: "Analyzing",
  RENDERING: "Rendering",
  READY: "Ready",
  FAILED: "Failed"
};

export default async function ProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { videos: { orderBy: { createdAt: "desc" } } }
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ink text-paper">
      <header className="border-b border-ink-line/60">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-6 py-5">
          <Link href="/dashboard" className="text-muted hover:text-paper transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Scissors className="h-5 w-5 text-signal" />
          <span className="font-display font-bold text-lg">Clippers Creator</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div>
          <h1 className="font-display font-bold text-2xl">{project.name}</h1>
          <p className="text-xs text-muted font-mono mt-1">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>

        <AddVideoForm projectId={project.id} />

        <div className="flex flex-col gap-3">
          <h2 className="font-display font-bold text-sm text-muted tracking-wide uppercase">
            Videos
          </h2>

          {project.videos.length === 0 ? (
            <div className="border border-dashed border-ink-line rounded-xl p-10 text-center">
              <p className="text-muted text-sm">No videos yet. Add one above to get started.</p>
            </div>
          ) : (
            project.videos.map((v: Video) => (
              <div
                key={v.id}
                className="flex items-center justify-between border border-ink-line rounded-xl px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <FileVideo className="h-4 w-4 text-muted shrink-0" />
                  <div>
                    <p className="text-sm">
                      {v.sourceUrl ?? v.storageKey ?? "Untitled video"}
                    </p>
                    {v.statusDetail && (
                      <p className="text-xs text-muted mt-0.5">{v.statusDetail}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-muted shrink-0">
                  {v.durationSec ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(v.durationSec / 60)}:{String(v.durationSec % 60).padStart(2, "0")}
                    </span>
                  ) : null}
                  <span
                    className={
                      v.status === "READY"
                        ? "text-wave"
                        : v.status === "FAILED"
                          ? "text-signal"
                          : "text-muted"
                    }
                  >
                    {STATUS_LABEL[v.status] ?? v.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
