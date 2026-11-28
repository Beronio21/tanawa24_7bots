import { createRig, listRigPresets } from "./CharacterRig.js";

/**
 * Pure 2D HTML5 Canvas multi-cam CCTV virtual office.
 *
 * Ported from docs/references/multi_cam_cctv.html: illustrated 2D rooms,
 * seated cel-shaded anime bots drawn behind foreground desks, monitors with
 * live-typed code streams, floating holographic code callouts, and a
 * grid / iso-overview / single-room camera mode. Restyled to Morning Light.
 */

const INK = "#1f1a17";

export const OFFICE_ROOMS = [
  { key: "animation", label: "Animation Studio", camIndex: 1 },
  { key: "writer", label: "Writer's Desk & Planning Wall", camIndex: 2 },
  { key: "manager", label: "Manager's Office", camIndex: 3 },
  { key: "editing", label: "Editing Suite", camIndex: 4 },
  { key: "coffee", label: "Coffee Area", camIndex: 5 },
  { key: "broadcast", label: "Broadcast Room", camIndex: 6 },
];

const BOT_STAGE = [
  { id: "animator", presetId: "animator_bot", cam: "animation" },
  { id: "editor", presetId: "editor_bot", cam: "editing" },
  { id: "writer", presetId: "seo_writer_bot", cam: "writer" },
  { id: "scheduler", presetId: "scheduler_bot", cam: "writer" },
  { id: "manager", presetId: "manager_bot", cam: "manager" },
  { id: "poster", presetId: "posting_bot", cam: "broadcast" },
  { id: "offduty", presetId: "offduty_bot", cam: "coffee" },
];

export function listOfficeBots() {
  const presets = new Map(listRigPresets().map((preset) => [preset.id, preset]));
  return BOT_STAGE.map((bot) => ({
    ...bot,
    rig: createRig({ presetId: bot.presetId, facing: 1, expression: "smile" }),
    label: presets.get(bot.presetId)?.label ?? "Studio Bot",
  }));
}

// ---------------------------------------------------------------------------
// Live code streams each bot types on its monitor + hologram callout
// ---------------------------------------------------------------------------
const LIVE_CODE_STREAMS = {
  animator: {
    lang: "stage_scene.js",
    accent: "#f472b6",
    lines: [
      "const world = build2DStage('meadow');",
      "sprite.magFilter = NearestFilter;",
      "bot.setPose('talk', { beat: 4 });",
      "camera.panTo({ x: 1.4, z: 3.2 });",
      "window.renderFrame(t => step(t));",
      "pipeToFFmpeg({ fps: 60, crf: 18 });",
    ],
  },
  editor: {
    lang: "batch_edit_video.py",
    accent: "#fbbf24",
    lines: [
      "ffmpeg -i raw_clip.mp4 -vf",
      "  'crop=ih*9/16:ih,scale=1080:1920'",
      "  -af loudnorm=I=-14:TP=-1.5",
      "  -c:v h264_nvenc -preset p4",
      "  -subtitles captions.srt",
      "  ready_cut_01.mp4 # $0 local",
    ],
  },
  writer: {
    lang: "story_script.json",
    accent: "#38bdf8",
    lines: [
      '{ "hook": "Stop paying $99/mo...",',
      '  "principle": "SpeedToValue<5s",',
      '  "speaker": "left_cast",',
      '  "sfx": "assets/sfx/reveal.mp3",',
      '  "cta": "https://tanawa.app" }',
    ],
  },
  scheduler: {
    lang: "batch_schedule.py",
    accent: "#34d399",
    lines: [
      "tz = ZoneInfo('Asia/Manila')",
      "slot = next_open_slot(tz, +8)",
      "assert slot > datetime.now(tz)",
      "db.enqueue(video_id, slot)",
      "# 14 posts locked for tonight",
    ],
  },
  manager: {
    lang: "scene_manifest.json",
    accent: "#fb7185",
    lines: [
      '{ "lock_world": true,',
      '  "lock_sprites": true,',
      '  "hwid_license": "VERIFIED",',
      '  "token_cost": "$0.00",',
      '  "qa_status": "APPROVED" }',
    ],
  },
  poster: {
    lang: "batch_post_social.py",
    accent: "#c084fc",
    lines: [
      "ctx = playwright.chromium",
      "  .launch_persistent_context(",
      "    user_data_dir=CHROME_DIR)",
      "page.set_input_files(mp4_path)",
      "page.fill('#desc', caption_cta)",
      "await page.click('button.post')",
    ],
  },
  offduty: {
    lang: "idle_status.log",
    accent: "#fcd34d",
    lines: [
      "[09:42] Brewed Barako espresso",
      "[09:43] GPU temp: 54C (nominal)",
      "[09:44] Standing by for batch...",
    ],
  },
};

// Character rigs for the 2D canvas (reference palette, Morning Light restyle)
const CANVAS_CHARS = {
  animator: {
    id: "animator",
    name: "Animator Bot",
    status: "CODING",
    hair: "#db2777",
    hairShade: "#9d174d",
    hairShine: "#fbcfe8",
    eye: "#be185d",
    outfit: "#9d174d",
    accessory: "beret",
  },
  editor: {
    id: "editor",
    name: "Video Editor Bot",
    status: "TRIM",
    hair: "#ea580c",
    hairShade: "#9a3412",
    hairShine: "#fed7aa",
    eye: "#b45309",
    outfit: "#1e293b",
    accessory: "headset",
  },
  writer: {
    id: "writer",
    name: "SEO Writer Bot",
    status: "JSON",
    hair: "#0284c7",
    hairShade: "#075985",
    hairShine: "#bae6fd",
    eye: "#1d4ed8",
    outfit: "#0369a1",
    accessory: "glasses",
  },
  scheduler: {
    id: "scheduler",
    name: "Scheduler Bot",
    status: "SYNC",
    hair: "#10b981",
    hairShade: "#065f46",
    hairShine: "#a7f3d0",
    eye: "#047857",
    outfit: "#065f46",
    accessory: "visor",
  },
  manager: {
    id: "manager",
    name: "Manager Bot",
    status: "QA",
    hair: "#cbd5e1",
    hairShade: "#64748b",
    hairShine: "#ffffff",
    eye: "#be123c",
    outfit: "#be123c",
    accessory: "buns",
  },
  poster: {
    id: "poster",
    name: "Posting Bot",
    status: "LIVE",
    hair: "#8b5cf6",
    hairShade: "#5b21b6",
    hairShine: "#ddd6fe",
    eye: "#5b21b6",
    outfit: "#6d28d9",
    accessory: "cap",
  },
  offduty: {
    id: "offduty",
    name: "Off-duty Bot",
    status: "REST",
    hair: "#78350f",
    hairShade: "#451a03",
    hairShine: "#fde68a",
    eye: "#78350f",
    outfit: "#334155",
    accessory: "cap",
  },
};

const STREAM_FOR_CHAR = {
  animator: LIVE_CODE_STREAMS.animator,
  editor: LIVE_CODE_STREAMS.editor,
  writer: LIVE_CODE_STREAMS.writer,
  scheduler: LIVE_CODE_STREAMS.scheduler,
  manager: LIVE_CODE_STREAMS.manager,
  poster: LIVE_CODE_STREAMS.poster,
  offduty: LIVE_CODE_STREAMS.offduty,
};

// ---------------------------------------------------------------------------
// 2D drawing helpers (ported verbatim from the reference)
// ---------------------------------------------------------------------------
function roundRect(ctx, x, y, w, h, r, fill, stroke = INK, lw = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

// Seated 2D cel-shaded anime character, drawn BEFORE the desk so the desk
// occludes the lower body (true foreground depth ordering).
function draw2DAnimeCharacter(ctx, bot, x, y, scale, facing, timeTick, isIdleCoffee = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);

  const bob = Math.sin(timeTick * 0.1 + x) * 1.8;
  const typeL = isIdleCoffee ? 0 : Math.sin(timeTick * 0.42) * 3.2;
  const typeR = isIdleCoffee ? 0 : Math.cos(timeTick * 0.42) * 3.2;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // 1. Swivel chair backrest behind character
  roundRect(ctx, -26, -54 + bob * 0.3, 52, 46, 10, "#334155", INK, 2.4);
  roundRect(ctx, -20, -48 + bob * 0.3, 40, 34, 7, "#475569", null);

  // 2. Long back hair
  ctx.beginPath();
  ctx.moveTo(-24, -76 + bob);
  ctx.quadraticCurveTo(-34, -36 + bob, -28, -4 + bob);
  ctx.lineTo(28, -4 + bob);
  ctx.quadraticCurveTo(34, -36 + bob, 24, -76 + bob);
  ctx.closePath();
  ctx.fillStyle = bot.hair;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // 3. Torso (crisp white blouse + ribbon + pleated skirt)
  roundRect(ctx, -18, -44 + bob * 0.5, 36, 34, 8, "#ffffff", INK, 2.3);
  ctx.beginPath();
  ctx.moveTo(-12, -44 + bob * 0.5);
  ctx.lineTo(0, -32 + bob * 0.5);
  ctx.lineTo(12, -44 + bob * 0.5);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -34 + bob * 0.5);
  ctx.lineTo(-5, -20 + bob * 0.5);
  ctx.lineTo(5, -20 + bob * 0.5);
  ctx.closePath();
  ctx.fillStyle = bot.outfit;
  ctx.fill();
  ctx.stroke();

  roundRect(ctx, -21, -14 + bob * 0.3, 42, 18, 5, bot.outfit, INK, 2.3);

  // 4. Arms typing forward (or holding a coffee mug)
  if (isIdleCoffee) {
    roundRect(ctx, -23, -36 + bob * 0.5, 11, 22, 5, "#fff0e6", INK, 2.1);
    roundRect(ctx, 10, -36 + bob * 0.5, 11, 22, 5, "#fff0e6", INK, 2.1);
    roundRect(ctx, -7, -26 + bob * 0.5, 14, 15, 3, "#d96b43", INK, 2);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 1.6;
    const steam = Math.sin(timeTick * 0.12) * 3;
    ctx.beginPath();
    ctx.moveTo(-2, -30);
    ctx.quadraticCurveTo(-5 + steam, -38, -1, -44);
    ctx.moveTo(3, -30);
    ctx.quadraticCurveTo(6 - steam, -38, 2, -44);
    ctx.stroke();
  } else {
    roundRect(ctx, -24, -38 + typeL, 11, 24, 5, "#fff0e6", INK, 2.1);
    roundRect(ctx, 13, -38 + typeR, 11, 24, 5, "#fff0e6", INK, 2.1);
  }

  // 5. Anime head
  ctx.save();
  ctx.translate(0, -68 + bob);

  if (bot.accessory === "buns") {
    ctx.fillStyle = bot.hair;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-22, -16, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22, -16, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(-21, -12);
  ctx.quadraticCurveTo(-22, 16, 2, 22);
  ctx.quadraticCurveTo(23, 16, 21, -12);
  ctx.quadraticCurveTo(18, -26, 0, -26);
  ctx.quadraticCurveTo(-18, -26, -21, -12);
  ctx.fillStyle = "#fff0e6";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  const drawEye = (ex, ey, rx) => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = bot.eye;
    ctx.beginPath();
    ctx.ellipse(ex + 0.8, ey + 0.3, rx * 0.58, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ex - 0.6, ey - 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  };
  drawEye(-6, 2, 5.4);
  drawEye(12, 2, 4.5);

  ctx.fillStyle = "rgba(251, 113, 133, 0.38)";
  ctx.beginPath();
  ctx.ellipse(-9, 9, 4.5, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(14, 9, 3.8, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(4, 11, 3.5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = bot.hair;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-23, -6);
  ctx.quadraticCurveTo(-24, -28, 0, -28);
  ctx.quadraticCurveTo(24, -28, 23, -6);
  ctx.lineTo(18, 12);
  ctx.lineTo(14, -8);
  ctx.lineTo(6, -3);
  ctx.lineTo(2, -10);
  ctx.lineTo(-4, -3);
  ctx.lineTo(-12, -9);
  ctx.lineTo(-17, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = bot.hairShine;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-12, -16);
  ctx.lineTo(-3, -18);
  ctx.lineTo(5, -16);
  ctx.lineTo(13, -18);
  ctx.stroke();

  if (bot.accessory === "beret") {
    ctx.save();
    ctx.rotate(-0.18);
    roundRect(ctx, -18, -32, 38, 13, 7, bot.outfit, INK, 2.2);
    ctx.restore();
  } else if (bot.accessory === "glasses") {
    roundRect(ctx, -13, -4, 13, 10, 2, "rgba(56,189,248,0.18)", "#0284c7", 1.8);
    roundRect(ctx, 6, -4, 11, 10, 2, "rgba(56,189,248,0.18)", "#0284c7", 1.8);
  } else if (bot.accessory === "visor") {
    roundRect(ctx, -14, -5, 34, 12, 4, "rgba(16,185,129,0.85)", INK, 2);
  } else if (bot.accessory === "headset") {
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -4, 23, Math.PI, 0);
    ctx.stroke();
    roundRect(ctx, -26, -6, 7, 14, 3, "#f97316", INK, 2);
  } else if (bot.accessory === "cap") {
    roundRect(ctx, -18, -29, 36, 11, 6, bot.outfit, INK, 2.2);
    roundRect(ctx, -4, -22, 28, 5, 2, "#94a3b8", INK, 1.8);
  }

  ctx.restore();
  ctx.restore();
}

// Foreground desk + monitor(s) with live code, drawn AFTER the character so
// it occludes the bot's lower body.
function draw2DForegroundWorkstation(ctx, x, y, w, h, codeStream, timeTick, dual = true, flipSide = false) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(31, 26, 23, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, h * 0.48, w * 0.54, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  roundRect(ctx, -w / 2, -h / 2, w, h, 6, "#8c5828", INK, 2.5);
  roundRect(ctx, -w / 2, -h / 2, w, 14, 5, "#b57941", INK, 2.2);
  roundRect(ctx, -w / 2 + 12, -h / 2 + 18, w - 24, h - 24, 4, "#6f421b", INK, 1.8);

  roundRect(ctx, w / 2 - 28, -h / 2 - 8, 12, 14, 2, "#faf6f0", INK, 1.8);
  roundRect(ctx, -w / 2 + 14, -h / 2 - 4, 22, 8, 2, "#fef3c7", INK, 1.6);

  const monY = -h / 2 - 44;
  if (dual) {
    roundRect(ctx, -w * 0.42, monY, w * 0.40, 44, 5, "#1e293b", INK, 2.4);
    roundRect(ctx, -w * 0.42 + 4, monY + 4, w * 0.40 - 8, 34, 3, "#0f172a", null);
    roundRect(ctx, w * 0.02, monY, w * 0.40, 44, 5, "#1e293b", INK, 2.4);
    roundRect(ctx, w * 0.02 + 4, monY + 4, w * 0.40 - 8, 34, 3, "#172033", null);

    roundRect(ctx, -w * 0.24, monY + 44, 12, 8, 2, "#475569", INK, 1.8);
    roundRect(ctx, w * 0.20, monY + 44, 12, 8, 2, "#475569", INK, 1.8);

    drawLiveCodeInsideScreen(ctx, -w * 0.42 + 7, monY + 7, w * 0.40 - 14, 28, codeStream, timeTick);
    drawLivePreviewInsideScreen(ctx, w * 0.02 + 7, monY + 7, w * 0.40 - 14, 28, codeStream.accent, timeTick);
  } else {
    const mw = w * 0.56;
    roundRect(ctx, -mw / 2, monY - 2, mw, 46, 5, "#1e293b", INK, 2.4);
    roundRect(ctx, -mw / 2 + 4, monY + 2, mw - 8, 36, 3, "#0f172a", null);
    roundRect(ctx, -8, monY + 44, 16, 8, 2, "#475569", INK, 1.8);
    drawLiveCodeInsideScreen(ctx, -mw / 2 + 8, monY + 6, mw - 16, 30, codeStream, timeTick);
  }

  const holoX = flipSide ? -w * 0.54 - 58 : w * 0.54 + 58;
  const holoY = monY + 12 + Math.sin(timeTick * 0.08) * 3;
  drawFloatingCodeHolo(ctx, holoX, holoY, codeStream, timeTick);

  ctx.restore();
}

function drawLiveCodeInsideScreen(ctx, sx, sy, sw, sh, stream, timeTick) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(sx, sy, sw, sh);
  ctx.clip();

  const lineH = 5.5;
  const totalLines = stream.lines.length;
  const charProgress = Math.floor(timeTick * 0.65);

  for (let i = 0; i < 5; i++) {
    const lineIdx = (Math.floor(charProgress / 24) + i) % totalLines;
    const txt = stream.lines[lineIdx];
    const visibleChars = i === 4 ? charProgress % 24 : txt.length;
    const barW = Math.min(sw - 4, Math.max(6, (visibleChars / 26) * (sw - 4)));

    ctx.fillStyle = i % 2 === 0 ? stream.accent : "#e2e8f0";
    ctx.fillRect(sx + 2, sy + 2 + i * lineH, barW, 3);

    if (i === 4 && Math.floor(timeTick / 10) % 2 === 0) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(sx + 3 + barW, sy + 1.5 + i * lineH, 2.5, 4);
    }
  }
  ctx.restore();
}

function drawLivePreviewInsideScreen(ctx, sx, sy, sw, sh, accent, timeTick) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(sx, sy, sw, sh);
  ctx.clip();

  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(sx, sy, sw, sh * 0.55);
  ctx.fillStyle = "#86efac";
  ctx.fillRect(sx, sy + sh * 0.55, sw, sh * 0.45);

  const bx = sx + sw * 0.5 + Math.sin(timeTick * 0.12) * (sw * 0.25);
  const by = sy + sh * 0.52 - Math.abs(Math.sin(timeTick * 0.2)) * 5;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(bx, by, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFloatingCodeHolo(ctx, cx, cy, stream, timeTick) {
  const boxW = 128;
  const boxH = 54;
  const x = cx - boxW / 2;
  const y = cy - boxH / 2;

  ctx.save();
  ctx.strokeStyle = stream.accent;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(cx < 0 ? x + boxW : x, cy);
  ctx.lineTo(cx < 0 ? x + boxW + 14 : x - 14, cy + 6);
  ctx.stroke();
  ctx.setLineDash([]);

  roundRect(ctx, x, y, boxW, boxH, 6, "rgba(24, 21, 19, 0.90)", stream.accent, 1.6);

  ctx.fillStyle = stream.accent;
  ctx.font = "bold 8px ui-monospace, monospace";
  ctx.fillText(`⚡ ${stream.lang}`, x + 6, y + 11);

  ctx.font = "7.5px ui-monospace, monospace";
  const totalChars = Math.floor(timeTick * 0.55);
  const startLine = Math.floor(totalChars / 26) % stream.lines.length;

  for (let row = 0; row < 3; row++) {
    const line = stream.lines[(startLine + row) % stream.lines.length];
    const isLast = row === 2;
    const sliceLen = isLast ? totalChars % 26 : line.length;
    const shown = line.slice(0, sliceLen);
    const cursor = isLast && Math.floor(timeTick / 8) % 2 === 0 ? "▌" : "";

    ctx.fillStyle = row === 0 ? "#fde68a" : "#f8fafc";
    ctx.fillText(shown + cursor, x + 6, y + 23 + row * 10);
  }

  ctx.restore();
}

function draw2DRoomBackdrop(ctx, w, h, options, morningSun) {
  const sunShift = morningSun ? 1 : 0.45;

  ctx.fillStyle = options.wallColor || (morningSun ? "#e9dcc9" : "#3a3532");
  ctx.fillRect(0, 0, w, h * 0.58);

  ctx.fillStyle = "#5c4938";
  ctx.fillRect(0, h * 0.56, w, 6);

  ctx.fillStyle = options.floorColor || (morningSun ? "#c89d6c" : "#4b423b");
  ctx.fillRect(0, h * 0.58, w, h * 0.42);

  ctx.strokeStyle = "rgba(31, 26, 23, 0.16)";
  ctx.lineWidth = 1.5;
  for (let py = h * 0.64; py < h; py += 18) {
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
    ctx.stroke();
  }

  if (options.windowSide) {
    const wx = options.windowSide === "left" ? 18 : w - 98;
    const wy = h * 0.14;
    const ww = 80;
    const wh = h * 0.34;

    roundRect(ctx, wx, wy, ww, wh, 4, morningSun ? "#fef9c3" : "#1e293b", INK, 2.4);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();

    if (morningSun) {
      ctx.fillStyle = `rgba(254, 249, 195, ${0.26 * sunShift})`;
      ctx.beginPath();
      if (options.windowSide === "left") {
        ctx.moveTo(wx, wy + wh);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.lineTo(wx + ww + 110, h);
        ctx.lineTo(wx + 20, h);
      } else {
        ctx.moveTo(wx, wy + wh);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.lineTo(wx + ww - 20, h);
        ctx.lineTo(wx - 110, h);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  if (options.plantX) {
    const px = options.plantX;
    const py = h * 0.57;
    roundRect(ctx, px - 11, py - 16, 22, 18, 4, "#d96b43", INK, 2);
    ctx.fillStyle = "#3f7d58";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    [
      [-10, -24, -0.4],
      [0, -30, 0],
      [10, -24, 0.4],
    ].forEach(([dx, dy, rot]) => {
      ctx.save();
      ctx.translate(px + dx, py + dy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }
}

// ---------------------------------------------------------------------------
// Per-room scene renderers (ported from the reference)
// ---------------------------------------------------------------------------
function renderCamAnimation(ctx, w, h, t, morningSun) {
  draw2DRoomBackdrop(ctx, w, h, { windowSide: "right", plantX: 30 }, morningSun);

  roundRect(ctx, 56, h * 0.16, 118, 56, 5, INK, INK, 2.2);
  roundRect(ctx, 60, h * 0.16 + 4, 52, 48, 3, "#fce7f3", null);
  roundRect(ctx, 116, h * 0.16 + 4, 54, 48, 3, "#dbeafe", null);

  const progW = Math.min(195, w - 20);
  roundRect(ctx, 10, 32, progW, 28, 6, "rgba(31, 26, 23, 0.88)", "#c88a2b", 1.5);
  ctx.fillStyle = "#fef3c7";
  ctx.font = "bold 9px system-ui, sans-serif";
  ctx.fillText(`FRAME ${t.renderFrameNum}/300 RENDER (Playwright)`, 17, 43);
  roundRect(ctx, 17, 48, progW - 14, 6, 3, "rgba(255,255,255,0.16)", null);
  roundRect(ctx, 17, 48, ((progW - 14) * t.renderFrameNum) / 300, 6, 3, "#f59e0b", null);

  const cx = w * 0.44;
  const cy = h * 0.68;
  draw2DAnimeCharacter(ctx, CANVAS_CHARS.animator, cx, cy, 1.12, 1, t.tick);
  draw2DForegroundWorkstation(ctx, cx + 6, cy + 16, 152, 54, LIVE_CODE_STREAMS.animator, t.tick, true, false);
}

function renderCamEditing(ctx, w, h, t, morningSun) {
  draw2DRoomBackdrop(
    ctx,
    w,
    h,
    {
      windowSide: "left",
      wallColor: morningSun ? "#dfd3c3" : "#2b2827",
      floorColor: morningSun ? "#9e9389" : "#3a3533",
    },
    morningSun,
  );

  roundRect(ctx, w * 0.56, h * 0.16, 92, 48, 5, INK, INK, 2);
  ctx.fillStyle = "#fbbf24";
  for (let bx = 0; bx < 12; bx++) {
    const bh = 8 + Math.abs(Math.sin(t.tick * 0.15 + bx)) * 22;
    ctx.fillRect(w * 0.56 + 10 + bx * 6, h * 0.16 + 38 - bh, 4, bh);
  }

  const cx = w * 0.54;
  const cy = h * 0.68;
  draw2DAnimeCharacter(ctx, CANVAS_CHARS.editor, cx, cy, 1.12, -1, t.tick + 12);
  draw2DForegroundWorkstation(ctx, cx - 6, cy + 16, 152, 54, LIVE_CODE_STREAMS.editor, t.tick + 12, true, true);
}

function renderCamWriter(ctx, w, h, t, morningSun) {
  draw2DRoomBackdrop(ctx, w, h, { windowSide: null, plantX: w * 0.49 }, morningSun);

  roundRect(ctx, 26, h * 0.15, 34, 42, 3, "#ffffff", INK, 2);
  roundRect(ctx, 68, h * 0.15, 34, 42, 3, "#e0f2fe", INK, 2);

  const boardX = w * 0.66;
  roundRect(ctx, boardX, h * 0.12, w * 0.28, h * 0.36, 5, "#f8fafc", INK, 2.2);
  roundRect(ctx, boardX + 6, h * 0.12 + 5, w * 0.28 - 12, 14, 3, "#2b6e68", null);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 8px system-ui, sans-serif";
  ctx.fillText("PLANNING WALL • 10 TEMPLATES", boardX + 10, h * 0.12 + 15);
  ["#fef08a", "#fed7aa", "#bbf7d0", "#bae6fd"].forEach((col, idx) => {
    roundRect(ctx, boardX + 10 + idx * 28, h * 0.12 + 24, 22, 18, 2, col, INK, 1.2);
  });

  const lx = w * 0.24;
  const ly = h * 0.72;
  draw2DAnimeCharacter(ctx, CANVAS_CHARS.writer, lx, ly, 0.96, 1, t.tick + 5);
  draw2DForegroundWorkstation(ctx, lx + 4, ly + 14, 118, 44, LIVE_CODE_STREAMS.writer, t.tick + 5, false, false);

  const rx = w * 0.74;
  const ry = h * 0.72;
  draw2DAnimeCharacter(ctx, CANVAS_CHARS.scheduler, rx, ry, 0.96, -1, t.tick + 19);
  draw2DForegroundWorkstation(ctx, rx - 4, ry + 14, 118, 44, LIVE_CODE_STREAMS.scheduler, t.tick + 19, false, true);
}

function renderCamManager(ctx, w, h, t, morningSun) {
  draw2DRoomBackdrop(ctx, w, h, { windowSide: null, plantX: w - 28 }, morningSun);

  roundRect(ctx, 16, h * 0.16, 48, h * 0.40, 4, "#6f421b", INK, 2.2);
  [0.24, 0.34, 0.44].forEach((ry, row) => {
    ctx.fillStyle = INK;
    ctx.fillRect(18, h * ry, 44, 3);
    ["#d96b43", "#2b6e68", "#c88a2b", "#38bdf8"].forEach((c, b) => {
      roundRect(ctx, 21 + b * 9, h * ry - 14, 7, 14, 1, c, INK, 1.2);
    });
  });

  const cx = w * 0.52;
  const cy = h * 0.70;
  draw2DAnimeCharacter(ctx, CANVAS_CHARS.manager, cx, cy, 1.02, 1, t.tick + 8);
  draw2DForegroundWorkstation(ctx, cx + 4, cy + 14, 124, 46, LIVE_CODE_STREAMS.manager, t.tick + 8, false, false);
}

function renderCamCoffee(ctx, w, h, t, morningSun) {
  draw2DRoomBackdrop(
    ctx,
    w,
    h,
    {
      windowSide: null,
      wallColor: morningSun ? "#e5d7c3" : "#2f2a28",
      floorColor: morningSun ? "#8c827a" : "#3b3634",
    },
    morningSun,
  );

  roundRect(ctx, 16, h * 0.44, 76, 46, 5, "#78350f", INK, 2.2);
  roundRect(ctx, 26, h * 0.26, 36, 26, 4, "#334155", INK, 2);
  roundRect(ctx, 68, h * 0.34, 16, 16, 3, "#d96b43", INK, 1.8);

  const sx = w * 0.66;
  const sy = h * 0.64;
  roundRect(ctx, sx - 58, sy - 34, 116, 36, 8, "#334155", INK, 2.2);
  draw2DAnimeCharacter(ctx, CANVAS_CHARS.offduty, sx, sy + 4, 0.94, -1, t.tick, true);
  roundRect(ctx, sx - 54, sy - 6, 108, 24, 6, "#475569", INK, 2.2);
  roundRect(ctx, sx - 64, sy - 16, 14, 34, 5, "#334155", INK, 2);
  roundRect(ctx, sx + 50, sy - 16, 14, 34, 5, "#334155", INK, 2);
}

function renderCamBroadcast(ctx, w, h, t, morningSun) {
  draw2DRoomBackdrop(ctx, w, h, { windowSide: "right", plantX: 28 }, morningSun);

  const pulse = Math.floor(t.tick / 18) % 2 === 0;
  roundRect(ctx, 44, h * 0.16, 74, 24, 5, pulse ? "#dc2626" : "#7f1d1d", INK, 2);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px system-ui, sans-serif";
  ctx.fillText("● ON AIR", 56, h * 0.16 + 16);

  const cx = w * 0.48;
  const cy = h * 0.70;
  draw2DAnimeCharacter(ctx, CANVAS_CHARS.poster, cx, cy, 1.08, -1, t.tick + 3);
  draw2DForegroundWorkstation(ctx, cx - 4, cy + 16, 144, 52, LIVE_CODE_STREAMS.poster, t.tick + 3, true, true);
}

const CAM_RENDERERS = {
  animation: renderCamAnimation,
  writer: renderCamWriter,
  manager: renderCamManager,
  editing: renderCamEditing,
  coffee: renderCamCoffee,
  broadcast: renderCamBroadcast,
};

// ---------------------------------------------------------------------------
// Engine factory
// ---------------------------------------------------------------------------
/**
 * @param {object} options
 * @param {HTMLElement} options.container grid element holding [data-cam] tiles,
 *   or a bare screen element for single-room mode
 * @param {"grid"|"iso"|"single"} [options.view]
 * @param {string|null} [options.room] room key for single-view mode
 * @param {(room: string) => void} [options.onRoomFocus]
 */
export function createVirtualOfficeEngine({
  container,
  view = "grid",
  room = null,
  onRoomFocus = () => {},
}) {
  const tiles = new Map();
  let overviewCanvas = null;
  let singleCanvas = null;

  const hasTiles = view !== "single" && container.querySelector("[data-cam]");

  if (hasTiles) {
    for (const roomConfig of OFFICE_ROOMS) {
      const feed = container.querySelector(`[data-cam="${roomConfig.key}"] [data-cam-feed]`);
      if (!feed) continue;
      const canvas = document.createElement("canvas");
      canvas.className = "office-cam-canvas";
      canvas.setAttribute("aria-hidden", "true");
      feed.appendChild(canvas);
      tiles.set(roomConfig.key, { canvas, feed });
    }

    overviewCanvas = document.createElement("canvas");
    overviewCanvas.className = "office-cam-canvas office-overview-canvas";
    overviewCanvas.setAttribute("aria-hidden", "true");
    container.appendChild(overviewCanvas);
    overviewCanvas.style.display = "none";
  } else {
    singleCanvas = document.createElement("canvas");
    singleCanvas.className = "office-cam-canvas";
    singleCanvas.setAttribute("aria-hidden", "true");
    container.appendChild(singleCanvas);
  }

  let activeRoom = room ?? OFFICE_ROOMS[0].key;
  let mode = view;
  let morningSun = true;
  let tick = 0;
  let renderFrameNum = 142;
  let frameHandle = 0;
  let disposed = false;

  const state = { tick, renderFrameNum };

  const observer = new ResizeObserver(() => {});
  observer.observe(container);

  function sizeCanvas(canvas, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.floor(w * dpr);
    const targetH = Math.floor(h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    return dpr;
  }

  function paintCanvas(canvas, w, h, renderFn) {
    const dpr = sizeCanvas(canvas, w, h);
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    renderFn(ctx, w, h);
    ctx.restore();
  }

  function paintTile(roomKey) {
    const tile = tiles.get(roomKey);
    if (!tile || tile.feed.offsetParent === null) return;
    const w = tile.feed.clientWidth;
    const h = tile.feed.clientHeight;
    if (w <= 0 || h <= 0) return;
    const renderer = CAM_RENDERERS[roomKey];
    if (!renderer) return;
    paintCanvas(tile.canvas, w, h, (ctx, cw, ch) =>
      renderer(ctx, cw, ch, state, morningSun),
    );
  }

  function paintOverview() {
    if (!overviewCanvas) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    const cols = 3;
    const rows = 2;
    const gap = 10;
    const pad = 12;
    const cellW = (w - pad * 2 - gap * (cols - 1)) / cols;
    const cellH = (h - pad * 2 - gap * (rows - 1)) / rows;

    paintCanvas(overviewCanvas, w, h, (ctx) => {
      ctx.fillStyle = "#e9dfd1";
      ctx.fillRect(0, 0, w, h);
      OFFICE_ROOMS.forEach((roomConfig, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = pad + col * (cellW + gap);
        const y = pad + row * (cellH + gap);
        const renderer = CAM_RENDERERS[roomConfig.key];
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellW, cellH);
        ctx.clip();
        ctx.translate(x, y);
        ctx.scale(cellW / 320, cellH / 200);
        if (renderer) renderer(ctx, 320, 200, state, morningSun);
        ctx.restore();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellW, cellH);
        ctx.fillStyle = INK;
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.fillText(`CAM 0${roomConfig.camIndex} · ${roomConfig.label.toUpperCase()}`, x + 6, y + cellH - 6);
      });
    });
  }

  function draw() {
    frameHandle = requestAnimationFrame(draw);
    if (disposed) return;
    tick += 1;
    state.tick = tick;
    if (tick % 16 === 0) {
      renderFrameNum = renderFrameNum >= 300 ? 1 : renderFrameNum + 1;
      state.renderFrameNum = renderFrameNum;
    }

    if (mode === "iso") {
      if (overviewCanvas) overviewCanvas.style.display = "block";
      for (const tile of tiles.values()) {
        if (tile.canvas) tile.canvas.style.display = "none";
      }
      paintOverview();
      return;
    }

    if (overviewCanvas) overviewCanvas.style.display = "none";
    for (const tile of tiles.values()) {
      if (tile.canvas) tile.canvas.style.display = "block";
    }

    if (mode === "single" && singleCanvas) {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        const renderer = CAM_RENDERERS[activeRoom];
        if (renderer) {
          paintCanvas(singleCanvas, w, h, (ctx, cw, ch) =>
            renderer(ctx, cw, ch, state, morningSun),
          );
        }
      }
      return;
    }

    for (const roomConfig of OFFICE_ROOMS) paintTile(roomConfig.key);
  }

  // Click a feed to focus its camera (grid mode only)
  const clickHandler = (event) => {
    if (mode !== "grid") return;
    const tile = event.target.closest("[data-cam]");
    if (!tile) return;
    onRoomFocus(tile.dataset.cam);
  };
  container.addEventListener("click", clickHandler);

  draw();

  return {
    rooms: OFFICE_ROOMS,
    bots: listOfficeBots().map(({ id, label, cam }) => ({ id, label, cam })),
    setView(nextView) {
      mode = nextView === "iso" ? "iso" : nextView === "single" ? "single" : "grid";
    },
    setRoom(nextRoom) {
      if (!CAM_RENDERERS[nextRoom]) return false;
      activeRoom = nextRoom;
      mode = "single";
      return true;
    },
    focusRoom(roomKey) {
      onRoomFocus(roomKey);
      return OFFICE_ROOMS.some((room) => room.key === roomKey);
    },
    setDaylight(enabled) {
      morningSun = enabled !== false;
    },
    toggleDaylight() {
      morningSun = !morningSun;
      return morningSun;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameHandle);
      observer.disconnect();
      container.removeEventListener("click", clickHandler);
      for (const tile of tiles.values()) tile.canvas?.remove();
      overviewCanvas?.remove();
      singleCanvas?.remove();
      tiles.clear();
    },
  };
}
