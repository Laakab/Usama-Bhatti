/**
 * Step 1 — Video -> optimized WebP frames
 *
 * Usage:
 *   node scripts/extract-frames.mjs path/to/source.mp4
 *
 * Requirements:
 *   - ffmpeg installed and on PATH (https://ffmpeg.org/download.html)
 *   - `npm install` already run (needs the `sharp` devDependency)
 *
 * What it does:
 *   1. Uses ffmpeg to pull N evenly spaced frames from the source video as PNG
 *      (PNG first, because re-encoding straight to a lossy format from a lossy
 *      video source compounds artifacts).
 *   2. Uses sharp to resize + compress every frame to WebP, so the browser
 *      only ever downloads the small final asset.
 *   3. Writes them into /public/frames as frame_0001.webp, frame_0002.webp, ...
 *
 * Tune FRAME_COUNT, WIDTH and QUALITY below to trade off smoothness vs.
 * total payload size. As a rule of thumb for a full-bleed hero:
 *   - 120-200 frames feels smooth for a 4-8s scrub without excessive weight
 *   - 1600-1920px wide covers most desktop viewports without over-fetching
 *   - quality 68-75 is usually indistinguishable for photographic content
 */
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const FRAME_COUNT = 150;
const WIDTH = 1280;
const QUALITY = 72;

const [, , inputVideo] = process.argv;

if (!inputVideo) {
  console.error("Usage: node scripts/extract-frames.mjs <path-to-video>");
  process.exit(1);
}

const root = path.resolve(process.cwd());
const tmpDir = path.join(root, ".tmp-frames-png");
const outDir = path.join(root, "public", "frames");

if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

// Get video duration so we can compute an fps that yields exactly FRAME_COUNT frames.
const durationOut = execSync(
  `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
)
  .toString()
  .trim();
const duration = parseFloat(durationOut);
const fps = FRAME_COUNT / duration;

console.log(`Video duration: ${duration.toFixed(2)}s -> sampling at ${fps.toFixed(3)} fps`);

execSync(
  `ffmpeg -y -i "${inputVideo}" -vf "fps=${fps},scale=${WIDTH}:-1:flags=lanczos" -q:v 2 "${path.join(
    tmpDir,
    "frame_%04d.png"
  )}"`,
  { stdio: "inherit" }
);

const pngFiles = readdirSync(tmpDir)
  .filter((f) => f.endsWith(".png"))
  .sort();

console.log(`Extracted ${pngFiles.length} PNG frames, converting to WebP...`);

for (const [i, file] of pngFiles.entries()) {
  const inPath = path.join(tmpDir, file);
  const outName = `frame_${String(i + 1).padStart(4, "0")}.webp`;
  const outPath = path.join(outDir, outName);
  await sharp(inPath).webp({ quality: QUALITY }).toFile(outPath);
  process.stdout.write(`\r  ${i + 1}/${pngFiles.length} -> ${outName}`);
}

rmSync(tmpDir, { recursive: true, force: true });
console.log(`\nDone. Update FRAME_COUNT in lib/frames.ts to ${pngFiles.length} if it changed.`);
