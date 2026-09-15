#!/usr/bin/env node

import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const playwrightPath = process.env.PLAYWRIGHT_PATH ||
  '/Users/dnappcrp/AI/skills/run-browser-test/node_modules/playwright-core/index.mjs';
const { chromium } = await import(playwrightPath);

const manifestPath = resolve(process.env.MANIFEST || 'scene-manifest.yaml');
const manifest = loadManifest(manifestPath);
const scenes = selectScenes(manifest.scenes || []);
const demoUrl = process.env.DEMO_URL;
if (!demoUrl) throw new Error('DEMO_URL is required');

const outputRoot = resolve(process.env.OUTPUT_DIR || manifest.output_dir || '/private/tmp/browser-story-recordings');
const finalDir = resolve(outputRoot, 'final');
const rawDir = resolve(outputRoot, 'raw');
mkdirSync(finalDir, { recursive: true });
mkdirSync(rawDir, { recursive: true });

for (const scene of scenes) await recordScene(scene);

function loadManifest(path) {
  if (path.endsWith('.json')) return JSON.parse(readFileSync(path, 'utf8'));
  const result = spawnSync('python3', ['-c', [
    'import json, sys',
    'import yaml',
    'with open(sys.argv[1], encoding="utf-8") as f:',
    '    value = yaml.safe_load(f)',
    'print(json.dumps(value))',
  ].join('\n'), path], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Unable to parse manifest');
  return JSON.parse(result.stdout);
}

function selectScenes(scenes) {
  if (process.env.SCENE) {
    const wanted = Number(process.env.SCENE);
    const scene = scenes.find(item => item.number === wanted || item.id === process.env.SCENE);
    if (!scene) throw new Error(`Scene not found: ${process.env.SCENE}`);
    return [scene];
  }
  if (process.env.ALL_SCENES === '1') return scenes;
  throw new Error('Set SCENE=<number> or ALL_SCENES=1');
}

function dimensions(value, label) {
  const match = String(value || '').match(/^(\d+)x(\d+)$/);
  if (!match) throw new Error(`${label} must use WIDTHxHEIGHT`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function crop(value) {
  const match = String(value || '').match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
  if (!match) throw new Error('capture.crop must use WIDTHxHEIGHT+X+Y');
  return { width: Number(match[1]), height: Number(match[2]), x: Number(match[3]), y: Number(match[4]) };
}

function sceneUrl(scene) {
  const url = new URL(demoUrl);
  url.searchParams.set(manifest.scene_query_param || 'scene', String(scene.visual_scene ?? scene.number));
  url.searchParams.set('capture', '1');
  return url.toString();
}

function sceneName(scene) {
  return `scene-${String(scene.number).padStart(2, '0')}`;
}

async function recordScene(scene) {
  const browserConfig = manifest.browser || {};
  const captureConfig = manifest.capture || {};
  const viewport = dimensions(browserConfig.viewport || '1512x982', 'browser.viewport');
  const cropBox = crop(captureConfig.crop || `${captureConfig.output_dimensions || '3024x1700'}+0+0`);
  const duration = Number(scene.duration_seconds);
  const warmupMs = Number(process.env.CAPTURE_WARMUP_MS || 800);
  const output = resolve(finalDir, `${sceneName(scene)}.mp4`);
  const raw = resolve(rawDir, `${sceneName(scene)}.raw.mp4`);
  const ffmpeg = process.env.FFMPEG || '/opt/homebrew/bin/ffmpeg';
  const screen = process.env.SCREEN || manifest.capture?.screen || '6';
  const fps = Number(captureConfig.frame_rate || 10);
  const url = sceneUrl(scene);

  console.log(`Recording ${scene.id} (${duration}s) -> ${output}`);
  const browser = await chromium.launch({
    executablePath: process.env.BRAVE_PATH || '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: false,
    args: [
      `--window-position=${process.env.WINDOW_X || 0},${process.env.WINDOW_Y || 0}`,
      `--window-size=${viewport.width},${viewport.height}`,
    ],
  });

  try {
    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator(manifest.ready_selector || 'html[data-capture-ready="true"]')
      .waitFor({ state: 'attached', timeout: 15000 });

    const recorder = spawn(ffmpeg, [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-f', manifest.capture?.backend || 'avfoundation',
      '-capture_cursor', '1',
      '-capture_mouse_clicks', '1',
      '-framerate', String(fps),
      '-i', screen,
      '-vf', `crop=${cropBox.width}:${cropBox.height}:${cropBox.x}:${cropBox.y}`,
      '-an', '-c:v', 'libx264', '-pix_fmt', captureConfig.pixel_format || 'yuv420p', raw,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });

    await waitForSpawn(recorder);
    await sleep(warmupMs);
    await page.evaluate(() => {
      document.documentElement.dataset.captureStarted = 'true';
      delete document.documentElement.dataset.capturePaused;
    });
    await sleep(duration * 1000);
    recorder.stdin.write('q\n');
    await waitForClose(recorder);
    await trimCapture(ffmpeg, raw, output, warmupMs / 1000, duration, fps, captureConfig.pixel_format || 'yuv420p');
  } finally {
    await browser.close();
  }
}

function trimCapture(ffmpeg, input, output, offset, duration, fps, pixelFormat) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, [
      '-y', '-hide_banner', '-loglevel', 'error', '-ss', String(offset), '-i', input,
      '-t', String(duration), '-r', String(fps), '-an', '-c:v', 'libx264',
      '-pix_fmt', pixelFormat, output,
    ], { stdio: ['ignore', 'inherit', 'inherit'] });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg trim exited ${code}`)));
  });
}

function waitForSpawn(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    setTimeout(resolve, 250);
  });
}

function waitForClose(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
  });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
