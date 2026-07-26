import ffmpeg from "fluent-ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

// Point fluent-ffmpeg at the prebuilt ffprobe binary that ships with the
// @ffprobe-installer/ffprobe package. This means we don't need ffmpeg
// installed on the Render host itself — it's bundled via npm.
ffmpeg.setFfprobePath(ffprobeInstaller.path);

export interface VideoProbeResult {
  durationSec: number;
  width?: number;
  height?: number;
}

/**
 * Reads basic metadata (duration, dimensions) from a video file on disk
 * using ffprobe. Throws if the file isn't a readable media file.
 */
export function probeVideo(filePath: string): Promise<VideoProbeResult> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const durationSec = data.format.duration ? Math.round(data.format.duration) : 0;
      const videoStream = data.streams.find((s) => s.codec_type === "video");

      resolve({
        durationSec,
        width: videoStream?.width,
        height: videoStream?.height
      });
    });
  });
}
