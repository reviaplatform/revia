import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

if (ffmpegInstaller) {
  // On some Linux hosts (e.g. Hostinger), npm install does not preserve the
  // executable bit on binary files, causing EACCES when spawning ffmpeg.
  // Ensure the binary is executable before setting the path.
  try {
    fsSync.chmodSync(ffmpegInstaller, 0o755);
  } catch (_) {
    // Ignore — if we can't chmod (e.g. read-only FS), ffmpeg will fail later
    // with a clear error rather than silently.
  }
  ffmpeg.setFfmpegPath(ffmpegInstaller);
}

export interface ProcessedVideo {
  videoBuffer: Buffer;
  thumbnailBuffer: Buffer;
}

export async function processReelVideo(videoBuffer: Buffer): Promise<ProcessedVideo> {
  const tempId = uuidv4();
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `${tempId}-input.mp4`);
  const outputPath = path.join(tempDir, `${tempId}-output.mp4`);
  const thumbPath = path.join(tempDir, `${tempId}-thumb.jpg`);

  try {
    // Write input buffer to temp file
    await fs.writeFile(inputPath, videoBuffer);

    // 1. Process Video (Aspect Ratio 9:16)
    // We use crop and scale to ensure 9:16
    // Formula: crop=w=ih*9/16:h=ih,scale=720:1280 (or similar)
    // We'll target 720x1280 for reels/tiktok
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions(['-hwaccel', 'none'])
        .videoFilters([
          {
            filter: 'scale',
            options: '720:1280:force_original_aspect_ratio=increase',
          },
          {
            filter: 'crop',
            options: '720:1280',
          },
          {
            filter: 'format',
            options: 'yuv420p',
          },
          {
            filter: 'setsar',
            options: '1',
          },
        ])
        .outputOptions(
          '-c:v', 'libx264',
          '-crf', '28',
          '-preset', 'ultrafast',
          '-threads', '1',
          '-max_muxing_queue_size', '1024',
          '-c:a', 'aac',
          '-b:a', '128k'
        )
        .save(outputPath)
        .on('end', resolve)
        .on('error', (err, _stdout, stderr) => {
          console.error('FFmpeg stderr:', stderr);
          reject(err);
        });
    });

    // 2. Extract Thumbnail
    await new Promise((resolve, reject) => {
      ffmpeg(outputPath)
        .inputOptions(['-hwaccel', 'none'])
        .outputOptions(['-threads', '1'])
        .screenshots({
          timestamps: [1], // Take at 1 second
          filename: path.basename(thumbPath),
          folder: path.dirname(thumbPath),
          size: '720x1280',
        })
        .on('end', resolve)
        .on('error', (err, _stdout, stderr) => {
          console.error('FFmpeg thumbnail stderr:', stderr);
          reject(err);
        });
    });

    // Read processed files
    const [processedVideo, thumbnail] = await Promise.all([
      fs.readFile(outputPath),
      fs.readFile(thumbPath),
    ]);

    return {
      videoBuffer: processedVideo,
      thumbnailBuffer: thumbnail,
    };
  } finally {
    // Cleanup temp files
    await Promise.all([
      fs.unlink(inputPath).catch(() => { }),
      fs.unlink(outputPath).catch(() => { }),
      fs.unlink(thumbPath).catch(() => { }),
    ]);
  }
}
