import { spawn } from "child_process";
import ffprobeStatic from "ffprobe-static";

export interface VideoProbeResult {
  durationSec: number;
  width?: number;
  height?: number;
}

/**
 * Reads basic metadata (duration, dimensions) from a video file on disk by
 * spawning the ffprobe binary (bundled by ffprobe-static) directly and
 * parsing its JSON output. Throws if the file isn't a readable media file.
 */
export function probeVideo(filePath: string): Promise<VideoProbeResult> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath
    ];

    const proc = spawn(ffprobeStatic.path, args);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    proc.on("error", reject);

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `ffprobe exited with code ${code}`));
        return;
      }

      try {
        const data = JSON.parse(stdout);
        const durationSec = data.format?.duration ? Math.round(parseFloat(data.format.duration)) : 0;
        const videoStream = (data.streams ?? []).find(
          (s: { codec_type?: string }) => s.codec_type === "video"
        );

        resolve({
          durationSec,
          width: videoStream?.width,
          height: videoStream?.height
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
