import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// NOTE — Phase 2 MVP storage:
// Render's free web service disk is NOT persistent across deploys or restarts.
// Files saved here will survive while the instance is running, but a redeploy
// (e.g. pushing new code) or a spin-down/spin-up cycle wipes them.
// This is fine for testing the pipeline end-to-end now. Before relying on
// this for real user content, swap this module for an S3-compatible bucket
// (Cloudflare R2 has a free tier and is a drop-in fit) — only this file
// would need to change; nothing else in the app talks to the filesystem
// directly.

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export async function saveUploadedVideo(file: File): Promise<{
  storageKey: string;
  absolutePath: string;
}> {
  await mkdir(UPLOAD_ROOT, { recursive: true });

  const ext = path.extname(file.name) || ".mp4";
  const storageKey = `${randomUUID()}${ext}`;
  const absolutePath = path.join(UPLOAD_ROOT, storageKey);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return { storageKey, absolutePath };
}

export function absolutePathForKey(storageKey: string): string {
  return path.join(UPLOAD_ROOT, storageKey);
}
