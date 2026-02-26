import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const SUBJECTS = {
  Mathematics: {
    icon: "📐", color: "#FFD700",
    UCE: ["Algebra & Equations","Geometry & Mensuration","Statistics & Probability","Number Theory","Trigonometry","Coordinate Geometry","Matrices","Quadratic Functions"],
    UACE: ["Calculus (Differentiation)","Calculus (Integration)","Vectors & Matrices","Complex Numbers","Differential Equations","Sequences & Series","Numerical Methods","Probability & Statistics"]
  },
  Physics: {
    icon: "⚛️", color: "#00C8FF",
    UCE: ["Mechanics","Waves & Sound","Light & Optics","Electricity","Magnetism","Heat & Temperature","Nuclear Physics","Measurement"],
    UACE: ["Classical Mechanics","Electromagnetism","Thermodynamics","Quantum Physics","Wave Optics","Electronics","Atomic Physics","Relativity"]
  },
  Chemistry: {
    icon: "🧪", color: "#00FF88",
    UCE: ["Atomic Structure","Chemical Bonding","Acids & Bases","Redox Reactions","Organic Chemistry","Stoichiometry","Periodic Table","Gases"],
    UACE: ["Thermodynamics","Chemical Kinetics","Electrochemistry","Organic Synthesis","Coordination Chemistry","Spectroscopy","Industrial Chemistry","Equilibrium"]
  },
  Biology: {
    icon: "🧬", color: "#FF6B9D",
    UCE: ["Cell Biology","Genetics","Ecology","Human Body Systems","Plant Biology","Evolution","Microbiology","Reproduction"],
    UACE: ["Biochemistry","Physiology","Genetics & Heredity","Ecology & Environment","Biotechnology","Immunology","Neuroscience","Taxonomy"]
  }
};

const BADGES = [
  { id: "first", icon: "🎯", name: "First Shot", desc: "Answer your first question", xp: 10 },
  { id: "streak3", icon: "🔥", name: "On Fire", desc: "3 correct in a row", xp: 30 },
  { id: "streak5", icon: "⚡", name: "Lightning", desc: "5 correct in a row", xp: 50 },
  { id: "streak10", icon: "🌪️", name: "Unstoppable", desc: "10 correct in a row", xp: 100 },
  { id: "perfect", icon: "💎", name: "Diamond Mind", desc: "Score 100% in a timed exam", xp: 150 },
  { id: "speed", icon: "🚀", name: "Speed Demon", desc: "Finish timed exam with 5min to spare", xp: 80 },
  { id: "level2", icon: "🎓", name: "Apprentice", desc: "Reach Level 2", xp: 50 },
  { id: "level3", icon: "🏅", name: "Scholar", desc: "Reach Level 3", xp: 100 },
  { id: "level5", icon: "👑", name: "Master", desc: "Reach Level 5", xp: 200 },
  { id: "multisub", icon: "🌟", name: "Polymath", desc: "Practice 3 different subjects", xp: 75 },
  { id: "century", icon: "💯", name: "Centurion", desc: "Answer 100 questions total", xp: 200 },
  { id: "daily", icon: "📅", name: "Consistent", desc: "Practice 3 days in a row", xp: 60 },
];

const LEVELS = [
  { level: 1, name: "Novice", minXP: 0 },
  { level: 2, name: "Apprentice", minXP: 100 },
  { level: 3, name: "Scholar", minXP: 300 },
  { level: 4, name: "Expert", minXP: 700 },
  { level: 5, name: "Master", minXP: 1500 },
  { level: 6, name: "Legend", minXP: 3000 },
];

function getLevelInfo(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevel(xp) {
  const cur = getLevelInfo(xp);
  return LEVELS.find(l => l.level === cur.level + 1) || null;
}

function xpProgress(xp) {
  const cur = getLevelInfo(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  return Math.round(((xp - cur.minXP) / (next.minXP - cur.minXP)) * 100);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #FFD700; --orange: #FF8C00; --bg: #080810;
    --surface: rgba(255,255,255,0.03); --border: rgba(255,215,0,0.12);
    --text: #e8e8f0; --muted: #666; --font: 'Space Mono', monospace;
    --display: 'Syne', sans-serif;
  }

  html, body { height: 100%; }

  body {
    background: var(--bg); color: var(--text);
    font-family: var(--font); font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }

  #root { height: 100%; }

  /* ── Auth Screen ── */
  .auth-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); position: relative; overflow: hidden;
    padding: 20px;
  }

  .auth-bg-grid {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(255,215,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,215,0,0.04) 1px, transparent 1px);
    background-size: 50px 50px;
  }

  .auth-bg-glow {
    position: fixed; inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,180,0,0.12), transparent 70%);
  }

  .auth-card {
    background: rgba(12,12,20,0.95);
    border: 1px solid var(--border);
    border-radius: 24px; padding: 40px;
    width: 100%; max-width: 420px;
    position: relative; z-index: 1;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  }

  .auth-logo {
    font-family: var(--display); font-size: 28px; font-weight: 800;
    text-align: center; margin-bottom: 4px;
    background: linear-gradient(135deg, #FFD700, #FF8C00);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .auth-sub { text-align: center; color: var(--muted); font-size: 12px; margin-bottom: 32px; }

  .auth-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 4px; }

  .auth-tab {
    flex: 1; padding: 10px; border: none; border-radius: 9px;
    font-family: var(--font); font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; color: var(--muted); background: none;
  }

  .auth-tab.active { background: linear-gradient(135deg, #FFD700, #FF8C00); color: #000; }

  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 11px; color: var(--muted); display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }

  .form-input {
    width: 100%; padding: 12px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #fff;
    font-family: var(--font); font-size: 13px;
    transition: border-color 0.2s; outline: none;
  }

  .form-input:focus { border-color: var(--gold); }

  .form-select {
    width: 100%; padding: 12px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #fff;
    font-family: var(--font); font-size: 13px;
    cursor: pointer; outline: none;
  }

  .form-select option { background: #1a1a2e; }

  .role-select { display: flex; gap: 10px; margin-bottom: 4px; }

  .role-btn {
    flex: 1; padding: 12px 8px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: none; color: var(--muted);
    font-family: var(--font); font-size: 11px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; text-align: center;
  }

  .role-btn:hover { border-color: var(--gold); color: #fff; }
  .role-btn.sel { border-color: var(--gold); background: rgba(255,215,0,0.1); color: var(--gold); }
  .role-btn .rb-icon { font-size: 22px; display: block; margin-bottom: 4px; }

  .btn-primary {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #FFD700, #FF8C00);
    border: none; border-radius: 12px; color: #000;
    font-family: var(--font); font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,215,0,0.35); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-secondary {
    padding: 10px 20px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04); color: #aaa;
    font-family: var(--font); font-size: 13px;
    cursor: pointer; transition: all 0.2s;
  }

  .btn-secondary:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

  .btn-danger {
    padding: 10px 20px; border-radius: 10px;
    border: 1px solid rgba(255,50,50,0.3);
    background: rgba(255,50,50,0.08); color: #ff5555;
    font-family: var(--font); font-size: 13px;
    cursor: pointer; transition: all 0.2s;
  }

  .btn-danger:hover { background: rgba(255,50,50,0.15); }

  .btn-sm {
    padding: 8px 16px; border-radius: 8px;
    border: none; font-family: var(--font); font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }

  .btn-sm-gold { background: linear-gradient(135deg,#FFD700,#FF8C00); color: #000; }
  .btn-sm-ghost { background: rgba(255,255,255,0.05); color: #aaa; border: 1px solid rgba(255,255,255,0.1); }
  .btn-sm-ghost:hover { color: #fff; }

  .auth-error {
    background: rgba(255,50,50,0.1); border: 1px solid rgba(255,50,50,0.25);
    border-radius: 10px; padding: 10px 14px;
    color: #ff7070; font-size: 12px; margin-bottom: 16px;
  }

  /* ── App Shell ── */
  .app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: var(--bg); }

  .app-bg-grid {
    position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px);
    background-size: 40px 40px; pointer-events: none;
  }

  .app-bg-glow {
    position: fixed; inset: 0; z-index: 0;
    background: radial-gradient(ellipse 80% 40% at 50% -5%, rgba(255,180,0,0.1), transparent 70%);
    pointer-events: none;
  }

  /* ── Header ── */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; height: 56px;
    border-bottom: 1px solid var(--border);
    background: rgba(8,8,16,0.9); backdrop-filter: blur(16px);
    position: relative; z-index: 200; flex-shrink: 0;
  }

  .logo { font-family: var(--display); font-weight: 800; font-size: 18px; color: var(--gold); letter-spacing: -0.5px; }
  .logo span { color: #fff; }

  .hud { display: flex; gap: 10px; align-items: center; }

  .hud-chip {
    display: flex; align-items: center; gap: 5px;
    background: rgba(255,215,0,0.07); border: 1px solid rgba(255,215,0,0.18);
    border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 700;
  }

  .hud-chip .hc-val { color: var(--gold); }
  .hud-chip .hc-lbl { color: var(--muted); }

  .user-menu {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; padding: 6px 10px; border-radius: 10px;
    transition: background 0.2s;
  }

  .user-menu:hover { background: rgba(255,255,255,0.05); }

  .avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #FFD700, #FF8C00);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: #000; flex-shrink: 0;
  }

  .user-name { font-size: 13px; font-weight: 700; color: #fff; }
  .user-role { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }

  /* ── XP Bar ── */
  .xpbar {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 20px; border-bottom: 1px solid rgba(255,215,0,0.06);
    background: rgba(255,215,0,0.02); flex-shrink: 0; position: relative; z-index: 100;
  }

  .xpbar-label { font-size: 10px; color: var(--muted); white-space: nowrap; }
  .xpbar-track { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
  .xpbar-fill { height: 100%; background: linear-gradient(90deg, #FFD700, #FF8C00); border-radius: 2px; transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
  .xpbar-badge { background: linear-gradient(135deg,#FFD700,#FF8C00); color: #000; font-weight: 700; font-size: 10px; padding: 2px 10px; border-radius: 20px; white-space: nowrap; }

  /* ── Layout ── */
  .shell { display: flex; flex: 1; overflow: hidden; position: relative; z-index: 1; }

  /* ── Sidebar ── */
  .sidebar {
    width: 200px; min-width: 200px; border-right: 1px solid var(--border);
    padding: 16px 0; overflow-y: auto; flex-shrink: 0;
    background: rgba(8,8,16,0.5);
  }

  .sidebar-section { margin-bottom: 6px; }
  .sidebar-label { font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 2px; padding: 0 14px 6px; }

  .nav-btn {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 14px; border: none; background: none;
    font-family: var(--font); font-size: 12px; color: #666;
    cursor: pointer; transition: all 0.15s; text-align: left;
    border-left: 2px solid transparent;
  }

  .nav-btn:hover { color: #ccc; background: rgba(255,255,255,0.03); }
  .nav-btn.active { color: var(--gold); border-left-color: var(--gold); background: rgba(255,215,0,0.06); }
  .nav-btn .ni { font-size: 15px; }

  /* ── Panel ── */
  .panel { flex: 1; overflow-y: auto; padding: 24px; }

  /* ── Section titles ── */
  .sec-title { font-family: var(--display); font-size: 22px; font-weight: 800; margin-bottom: 6px; }
  .sec-sub { font-size: 12px; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }

  /* ── Home / Subject selection ── */
  .hero { text-align: center; padding: 32px 20px 24px; }
  .hero-title {
    font-family: var(--display); font-size: clamp(32px, 5vw, 60px); font-weight: 800; line-height: 1;
    background: linear-gradient(135deg, #FFD700, #FF8C00, #fff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;
  }
  .hero-sub { color: var(--muted); font-size: 13px; line-height: 1.7; }

  .level-row { display: flex; gap: 12px; justify-content: center; margin: 20px 0; flex-wrap: wrap; }

  .level-pill {
    border: 1px solid var(--border); border-radius: 10px; padding: 10px 20px;
    cursor: pointer; transition: all 0.2s; background: var(--surface);
    font-size: 13px; font-weight: 700; color: #888;
  }

  .level-pill:hover, .level-pill.sel {
    border-color: var(--gold); color: var(--gold);
    background: rgba(255,215,0,0.08); box-shadow: 0 4px 20px rgba(255,215,0,0.15);
  }

  .subject-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }

  .subject-card {
    border: 1px solid var(--border); border-radius: 14px; padding: 16px;
    cursor: pointer; transition: all 0.2s; background: var(--surface); position: relative; overflow: hidden;
  }

  .subject-card::before {
    content: ''; position: absolute; inset: 0;
    opacity: 0; transition: opacity 0.2s;
  }

  .subject-card:hover::before, .subject-card.sel::before { opacity: 1; }
  .subject-card:hover, .subject-card.sel { transform: translateY(-2px); }

  .sc-icon { font-size: 28px; margin-bottom: 8px; }
  .sc-name { font-family: var(--display); font-size: 16px; font-weight: 700; margin-bottom: 2px; }
  .sc-count { font-size: 11px; color: var(--muted); }
  .sc-check { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #000; font-weight: 700; opacity: 0; transition: opacity 0.2s; }
  .subject-card.sel .sc-check { opacity: 1; }

  .topic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; margin-bottom: 20px; }

  .topic-chip {
    border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px;
    cursor: pointer; transition: all 0.2s; background: var(--surface);
    font-size: 12px; color: #888; position: relative;
  }

  .topic-chip:hover, .topic-chip.sel { border-color: var(--gold); color: #fff; background: rgba(255,215,0,0.06); }

  .start-row { display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; margin-top: 8px; }

  .mode-btn {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    border: 1px solid var(--border); border-radius: 14px; padding: 16px 20px;
    cursor: pointer; transition: all 0.2s; background: var(--surface); min-width: 130px;
  }

  .mode-btn:hover, .mode-btn.sel { border-color: var(--gold); background: rgba(255,215,0,0.08); }
  .mode-btn .mb-icon { font-size: 26px; }
  .mode-btn .mb-name { font-size: 12px; font-weight: 700; color: #fff; }
  .mode-btn .mb-desc { font-size: 10px; color: var(--muted); text-align: center; }

  /* ── Quiz ── */
  .quiz-wrap { max-width: 680px; margin: 0 auto; }

  .quiz-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }

  .quiz-meta { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
  .quiz-meta strong { color: var(--gold); }

  .streak-pill {
    display: flex; align-items: center; gap: 5px;
    background: rgba(255,100,0,0.12); border: 1px solid rgba(255,100,0,0.25);
    border-radius: 20px; padding: 5px 12px; font-size: 12px; color: #FF6B00; font-weight: 700;
  }

  /* Timer */
  .timer-bar-wrap { margin-bottom: 16px; }
  .timer-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; }
  .timer-count { font-family: var(--display); font-size: 28px; font-weight: 800; color: var(--gold); }
  .timer-count.urgent { color: #FF4444; animation: pulse 1s ease infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .timer-track { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
  .timer-fill { height: 100%; border-radius: 3px; transition: width 1s linear; background: linear-gradient(90deg, #00C864, #FFD700); }
  .timer-fill.urgent { background: linear-gradient(90deg, #FF4444, #FF8C00); }

  .q-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 24px; margin-bottom: 16px; position: relative; overflow: hidden;
    animation: cardIn 0.3s ease;
  }

  @keyframes cardIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .q-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--gold), #FF8C00);
  }

  .q-meta { font-size: 10px; color: var(--gold); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
  .q-num { font-size: 10px; color: var(--muted); margin-bottom: 6px; }

  .q-text {
    font-family: var(--display); font-size: 19px; font-weight: 700;
    line-height: 1.4; color: #fff; margin-bottom: 8px;
  }

  .diff-tag { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 18px; }
  .diff-easy { background: rgba(0,200,100,0.12); color: #00C864; border: 1px solid rgba(0,200,100,0.25); }
  .diff-medium { background: rgba(255,165,0,0.12); color: #FFA500; border: 1px solid rgba(255,165,0,0.25); }
  .diff-hard { background: rgba(255,50,50,0.12); color: #FF4444; border: 1px solid rgba(255,50,50,0.25); }

  .options { display: flex; flex-direction: column; gap: 9px; }

  .opt-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02); color: #ccc;
    font-family: var(--font); font-size: 13px; cursor: pointer;
    transition: all 0.18s; text-align: left;
  }

  .opt-btn:hover:not(:disabled) { border-color: var(--gold); color: #fff; background: rgba(255,215,0,0.04); }
  .opt-btn:disabled { cursor: default; }

  .opt-btn.correct { border-color: #00C864; background: rgba(0,200,100,0.08); color: #00C864; animation: popGreen 0.35s ease; }
  .opt-btn.wrong { border-color: #FF4444; background: rgba(255,68,68,0.08); color: #FF4444; animation: shake 0.35s ease; }

  @keyframes popGreen { 0%{transform:scale(1)} 50%{transform:scale(1.02)} 100%{transform:scale(1)} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

  .opt-letter {
    width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
    background: rgba(255,255,255,0.05); display: flex; align-items: center;
    justify-content: center; font-size: 11px; font-weight: 700;
  }

  .explanation {
    background: rgba(255,215,0,0.04); border: 1px solid rgba(255,215,0,0.15);
    border-radius: 14px; padding: 16px; margin-top: 14px;
    animation: fadeUp 0.3s ease;
  }

  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .exp-title { font-size: 11px; color: var(--gold); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 7px; }
  .exp-text { font-size: 13px; color: #ccc; line-height: 1.75; }

  .xp-pop {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,215,0,0.12); border: 1px solid rgba(255,215,0,0.25);
    border-radius: 20px; padding: 5px 14px; color: var(--gold); font-size: 12px; font-weight: 700;
    margin-top: 10px; animation: bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes bounceIn { from{transform:scale(0.4);opacity:0} to{transform:scale(1);opacity:1} }

  .quiz-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }

  .loading-state { display: flex; align-items: center; gap: 10px; color: #555; font-size: 13px; padding: 32px 0; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,215,0,0.15); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .progress-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 16px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg,var(--gold),#FF8C00); transition: width 0.4s ease; }

  /* ── Results ── */
  .results-wrap { max-width: 560px; margin: 0 auto; }

  .results-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 24px; padding: 36px; text-align: center;
    animation: fadeUp 0.5s ease;
  }

  .results-emoji { font-size: 52px; margin-bottom: 10px; }

  .results-pct {
    font-family: var(--display); font-size: 72px; font-weight: 800; line-height: 1;
    background: linear-gradient(135deg, #FFD700, #FF8C00);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .results-label { color: var(--muted); font-size: 13px; margin: 6px 0 24px; }
  .results-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }

  .rg-item { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 12px; padding: 12px 8px; text-align: center; }
  .rg-val { font-family: var(--display); font-size: 24px; font-weight: 800; color: #fff; }
  .rg-key { font-size: 10px; color: var(--muted); margin-top: 2px; }

  .results-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

  /* ── Progress / Stats ── */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 28px; }

  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
  .stat-val { font-family: var(--display); font-size: 30px; font-weight: 800; color: var(--gold); }
  .stat-key { font-size: 11px; color: var(--muted); margin-top: 4px; }

  .subject-breakdown { margin-bottom: 24px; }
  .sb-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .sb-name { width: 100px; font-size: 12px; color: #aaa; flex-shrink: 0; }
  .sb-track { flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
  .sb-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
  .sb-pct { width: 36px; font-size: 12px; color: var(--gold); font-weight: 700; text-align: right; flex-shrink: 0; }

  /* ── Badges ── */
  .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }

  .badge-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 18px 12px; text-align: center;
    transition: all 0.2s;
  }

  .badge-card.earned { border-color: rgba(255,215,0,0.35); background: rgba(255,215,0,0.04); }
  .badge-card.locked { opacity: 0.28; filter: grayscale(1); }
  .badge-icon { font-size: 34px; margin-bottom: 8px; }
  .badge-name { font-size: 12px; font-weight: 700; color: var(--gold); margin-bottom: 3px; }
  .badge-desc { font-size: 11px; color: var(--muted); line-height: 1.4; }
  .badge-xp { font-size: 11px; color: #FF8C00; margin-top: 6px; font-weight: 700; }
  .badge-earned-label { font-size: 10px; color: #00C864; font-weight: 700; margin-top: 5px; }

  /* ── Leaderboard ── */
  .lb-table { width: 100%; border-collapse: collapse; }
  .lb-table th { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border); }
  .lb-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
  .lb-rank { font-family: var(--display); font-weight: 800; color: var(--muted); font-size: 14px; }
  .lb-rank.top1 { color: #FFD700; }
  .lb-rank.top2 { color: #C0C0C0; }
  .lb-rank.top3 { color: #CD7F32; }
  .lb-name { font-weight: 700; color: #fff; }
  .lb-xp { color: var(--gold); font-weight: 700; }
  .lb-you { background: rgba(255,215,0,0.04); }

  /* ── Admin Dashboard ── */
  .admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 14px; margin-bottom: 28px; }

  .admin-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
  .admin-card-icon { font-size: 28px; margin-bottom: 8px; }
  .admin-card-val { font-family: var(--display); font-size: 32px; font-weight: 800; color: var(--gold); }
  .admin-card-key { font-size: 12px; color: var(--muted); margin-top: 3px; }

  .students-table { width: 100%; border-collapse: collapse; }
  .students-table th { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border); }
  .students-table td { padding: 11px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; vertical-align: middle; }
  .students-table tr:hover td { background: rgba(255,255,255,0.02); }

  .student-info { display: flex; align-items: center; gap: 10px; }
  .student-name { font-weight: 700; color: #fff; font-size: 13px; }
  .student-level { font-size: 10px; color: var(--muted); }

  .perf-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; width: 80px; }
  .perf-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #FFD700, #FF8C00); }

  .alert-chip { font-size: 10px; padding: 3px 8px; border-radius: 20px; font-weight: 700; }
  .alert-low { background: rgba(255,50,50,0.12); color: #FF5555; border: 1px solid rgba(255,50,50,0.2); }
  .alert-ok { background: rgba(0,200,100,0.1); color: #00C864; border: 1px solid rgba(0,200,100,0.2); }
  .alert-mid { background: rgba(255,165,0,0.1); color: #FFA500; border: 1px solid rgba(255,165,0,0.2); }

  .tab-bar { display: flex; gap: 4px; margin-bottom: 20px; background: rgba(255,255,255,0.02); border-radius: 12px; padding: 4px; }
  .tab-item { flex: 1; padding: 9px; border: none; border-radius: 9px; font-family: var(--font); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; color: var(--muted); background: none; }
  .tab-item.active { background: linear-gradient(135deg,#FFD700,#FF8C00); color: #000; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 20px; right: 20px; z-index: 9999;
    background: rgba(14,14,22,0.98); border: 1px solid rgba(255,215,0,0.25);
    border-radius: 14px; padding: 14px 18px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6); max-width: 300px;
    animation: slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

  .toast-icon { font-size: 26px; }
  .toast-title { font-size: 13px; font-weight: 700; color: var(--gold); }
  .toast-desc { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── Mobile nav ── */
  .mob-nav {
    display: none; position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(8,8,16,0.97); border-top: 1px solid var(--border);
    z-index: 300; padding: 8px 4px 12px;
  }

  .mob-nav-inner { display: flex; justify-content: space-around; }

  .mob-nav-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    background: none; border: none; cursor: pointer; padding: 6px 10px;
    color: #555; font-family: var(--font); font-size: 9px; transition: color 0.15s;
    flex: 1;
  }

  .mob-nav-btn.active { color: var(--gold); }
  .mob-nav-btn .mni { font-size: 18px; }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .sidebar { display: none; }
    .mob-nav { display: block; }
    .panel { padding: 16px 14px 80px; }
    .header { padding: 0 14px; }
    .hud-chip:not(.hud-xp) { display: none; }
    .results-grid { grid-template-columns: repeat(2,1fr); }
    .admin-grid { grid-template-columns: repeat(2,1fr); }
    .quiz-header { flex-direction: column; }
    .xpbar { padding: 5px 14px; }
  }

  /* ── Misc ── */
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-state .es-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-state .es-title { font-family: var(--display); font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 6px; }

  .tag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 700; margin-right: 5px; }
  .tag-gold { background: rgba(255,215,0,0.12); color: var(--gold); border: 1px solid rgba(255,215,0,0.2); }
  .tag-blue { background: rgba(0,200,255,0.1); color: #00C8FF; border: 1px solid rgba(0,200,255,0.2); }

  .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg,#FFD700,#FF8C00); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; color: #000; flex-shrink: 0; }
  .profile-name { font-family: var(--display); font-size: 22px; font-weight: 800; }
  .profile-meta { font-size: 11px; color: var(--muted); margin-top: 3px; }

  .logout-btn { margin-top: auto; padding: 16px 0 0; border-top: 1px solid var(--border); }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function callAI(prompt) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  const text = data.text || "";
  return text.replace(/```json|```/g, "").trim();
}

function makeQuestionPrompt(level, subject, topic) {
  return `Generate 1 Uganda ${level} ${subject} exam question on: "${topic}".
Return ONLY valid JSON (no markdown):
{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0,"difficulty":"easy|medium|hard","explanation":"step-by-step solution"}
correct = 0-based index. Make it exam-quality and accurate.`;
}

function initUserState(username, role, school) {
  return {
    username, role, school: school || "",
    xp: 0, streak: 0, bestStreak: 0,
    totalAnswered: 0, totalCorrect: 0,
    earnedBadges: [],
    subjectStats: {},
    sessionHistory: [],
    subjectsPracticed: [],
    joinedAt: Date.now(),
    lastActive: Date.now(),
  };
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function MathQuestApp() {
  // Auth
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Auth form
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRole, setAuthRole] = useState("student");
  const [authSchool, setAuthSchool] = useState("");
  const [authExamLevel, setAuthExamLevel] = useState("UCE");

  // Navigation
  const [tab, setTab] = useState("home");

  // Study config
  const [examLevel, setExamLevel] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [studyMode, setStudyMode] = useState("practice"); // practice | timed

  // Quiz state
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [xpGained, setXpGained] = useState(null);
  const [error, setError] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [qNum, setQNum] = useState(0);

  // Timed exam
  const [timedSeconds, setTimedSeconds] = useState(0);
  const [timedTotal, setTimedTotal] = useState(600); // 10 min
  const [timedDone, setTimedDone] = useState(false);
  const timerRef = useRef(null);

  // Session
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  // Admin tab
  const [adminTab, setAdminTab] = useState("overview");
  const [allStudents, setAllStudents] = useState([]);

  // ── Storage helpers ──
  async function saveUser(user) {
    try {
      await window.storage.set(`user:${user.username}`, JSON.stringify(user));
    } catch(e) {}
  }

  async function loadUser(username) {
    try {
      const r = await window.storage.get(`user:${username}`);
      return r ? JSON.parse(r.value) : null;
    } catch(e) { return null; }
  }

  async function loadAllStudents() {
    try {
      const keys = await window.storage.list("user:");
      const students = [];
      for (const key of (keys.keys || [])) {
        try {
          const r = await window.storage.get(key);
          if (r) {
            const u = JSON.parse(r.value);
            if (u.role === "student") students.push(u);
          }
        } catch(e) {}
      }
      return students;
    } catch(e) { return []; }
  }

  async function saveCredentials(username, password) {
    try {
      await window.storage.set(`cred:${username}`, JSON.stringify({ username, password }));
    } catch(e) {}
  }

  async function checkCredentials(username, password) {
    try {
      const r = await window.storage.get(`cred:${username}`);
      if (!r) return false;
      const cred = JSON.parse(r.value);
      return cred.password === password;
    } catch(e) { return false; }
  }

  async function addToLeaderboard(user) {
    try {
      await window.storage.set(`lb:${user.username}`, JSON.stringify({
        username: user.username, xp: user.xp, level: getLevelInfo(user.xp).name,
        accuracy: user.totalAnswered > 0 ? Math.round((user.totalCorrect / user.totalAnswered) * 100) : 0,
        school: user.school
      }), true);
    } catch(e) {}
  }

  async function loadLeaderboard() {
    try {
      const keys = await window.storage.list("lb:", true);
      const entries = [];
      for (const key of (keys.keys || [])) {
        try {
          const r = await window.storage.get(key, true);
          if (r) entries.push(JSON.parse(r.value));
        } catch(e) {}
      }
      return entries.sort((a, b) => b.xp - a.xp);
    } catch(e) { return []; }
  }

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadLeaderboard().then(setLeaderboard);
  }, [currentUser]);

  // ── Auth handlers ──
  async function handleRegister() {
    if (!authUsername.trim() || !authPassword.trim()) { setAuthError("Please fill all fields."); return; }
    if (authPassword.length < 4) { setAuthError("Password must be at least 4 characters."); return; }
    setAuthLoading(true); setAuthError("");
    const existing = await loadUser(authUsername.trim().toLowerCase());
    if (existing) { setAuthError("Username already taken. Try another."); setAuthLoading(false); return; }
    const user = initUserState(authUsername.trim().toLowerCase(), authRole, authSchool);
    user.examLevel = authExamLevel;
    await saveCredentials(user.username, authPassword);
    await saveUser(user);
    setCurrentUser(user);
    showToast("🎉", "Welcome to MathQuest!", `Let's ace those ${authExamLevel} exams!`);
    setAuthLoading(false);
  }

  async function handleLogin() {
    if (!authUsername.trim() || !authPassword.trim()) { setAuthError("Please enter username and password."); return; }
    setAuthLoading(true); setAuthError("");
    const ok = await checkCredentials(authUsername.trim().toLowerCase(), authPassword);
    if (!ok) { setAuthError("Invalid username or password."); setAuthLoading(false); return; }
    const user = await loadUser(authUsername.trim().toLowerCase());
    if (!user) { setAuthError("Account not found."); setAuthLoading(false); return; }
    user.lastActive = Date.now();
    await saveUser(user);
    setCurrentUser(user);
    if (user.examLevel) setExamLevel(user.examLevel);
    if (user.role === "admin") {
      const students = await loadAllStudents();
      setAllStudents(students);
    }
    showToast("👋", `Welcome back, ${user.username}!`, "Ready to practice?");
    setAuthLoading(false);
  }

  function handleLogout() {
    setCurrentUser(null);
    setTab("home");
    setQuestion(null);
    setQuizActive(false);
    stopTimer();
  }

  // ── Toast ──
  function showToast(icon, title, desc) {
    setToast({ icon, title, desc });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3800);
  }

  // ── Timer ──
  function startTimer() {
    const total = 600;
    setTimedTotal(total);
    setTimedSeconds(total);
    setTimedDone(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimedSeconds(s => {
        if (s <= 1) { clearInterval(timerRef.current); setTimedDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  useEffect(() => {
    if (timedDone && quizActive) endSession();
  }, [timedDone]);

  useEffect(() => () => stopTimer(), []);

  // ── Quiz ──
  async function fetchQuestion() {
    if (!examLevel || !selectedSubject || !selectedTopic) return;
    setLoading(true); setQuestion(null); setSelected(null); setExplanation(null); setXpGained(null); setError(null);
    try {
      const raw = await callAI(makeQuestionPrompt(examLevel, selectedSubject, selectedTopic));
      const parsed = JSON.parse(raw);
      setQuestion(parsed);
      setQNum(n => n + 1);
    } catch(e) {
      setError("Failed to generate question. Check your connection and try again.");
    }
    setLoading(false);
  }

  async function handleAnswer(idx) {
    if (selected !== null || !question) return;
    setSelected(idx);
    const correct = idx === question.correct;
    const diffMult = question.difficulty === "hard" ? 3 : question.difficulty === "medium" ? 2 : 1;
    const streakBonus = correct && currentUser.streak > 0 ? Math.min(currentUser.streak * 5, 50) : 0;
    const gained = correct ? (10 * diffMult) + streakBonus : 0;

    const newStreak = correct ? currentUser.streak + 1 : 0;
    const newXp = currentUser.xp + gained;
    const newTotalAnswered = currentUser.totalAnswered + 1;
    const newTotalCorrect = currentUser.totalCorrect + (correct ? 1 : 0);
    const newSessionAnswered = sessionAnswered + 1;
    const newSessionCorrect = sessionCorrect + (correct ? 1 : 0);

    // Update subject stats
    const subStats = { ...(currentUser.subjectStats || {}) };
    if (!subStats[selectedSubject]) subStats[selectedSubject] = { answered: 0, correct: 0 };
    subStats[selectedSubject].answered++;
    if (correct) subStats[selectedSubject].correct++;

    // Subjects practiced
    const subsPracticed = [...new Set([...(currentUser.subjectsPracticed || []), selectedSubject])];

    const updatedUser = {
      ...currentUser,
      xp: newXp,
      streak: newStreak,
      bestStreak: Math.max(currentUser.bestStreak || 0, newStreak),
      totalAnswered: newTotalAnswered,
      totalCorrect: newTotalCorrect,
      subjectStats: subStats,
      subjectsPracticed: subsPracticed,
      lastActive: Date.now(),
    };

    // Badge checks
    const newBadges = checkBadgesForUser(updatedUser, newStreak, newXp, newTotalAnswered, subsPracticed);
    if (newBadges.length) updatedUser.earnedBadges = [...(updatedUser.earnedBadges || []), ...newBadges];

    setCurrentUser(updatedUser);
    setSessionAnswered(newSessionAnswered);
    setSessionCorrect(newSessionCorrect);
    if (correct && gained > 0) setXpGained(gained);
    setExplanation(question.explanation);

    await saveUser(updatedUser);
    await addToLeaderboard(updatedUser);

    if (newBadges.length) {
      const b = BADGES.find(x => x.id === newBadges[0]);
      if (b) showToast(b.icon, `Badge Unlocked: ${b.name}!`, b.desc);
    } else if (correct && newStreak > 1) {
      showToast("🔥", `${newStreak} Streak!`, `+${gained} XP`);
    }
  }

  function checkBadgesForUser(user, streak, xp, totalAnswered, subsPracticed) {
    const earned = user.earnedBadges || [];
    const newOnes = [];
    const check = (id, cond) => { if (cond && !earned.includes(id) && !newOnes.includes(id)) newOnes.push(id); };
    check("first", totalAnswered >= 1);
    check("streak3", streak >= 3);
    check("streak5", streak >= 5);
    check("streak10", streak >= 10);
    check("level2", getLevelInfo(xp).level >= 2);
    check("level3", getLevelInfo(xp).level >= 3);
    check("level5", getLevelInfo(xp).level >= 5);
    check("multisub", subsPracticed.length >= 3);
    check("century", totalAnswered >= 100);
    return newOnes;
  }

  function startSession() {
    setQuizActive(true);
    setSessionAnswered(0);
    setSessionCorrect(0);
    setSessionStartTime(Date.now());
    setQNum(0);
    setTab("quiz");
    if (studyMode === "timed") startTimer();
    else stopTimer();
    fetchQuestion();
  }

  async function endSession() {
    stopTimer();
    setQuizActive(false);
    setQuestion(null);
    setSelected(null);
    setExplanation(null);
    setXpGained(null);

    // Check perfect badge for timed
    if (studyMode === "timed" && sessionAnswered > 0 && sessionCorrect === sessionAnswered) {
      if (!currentUser.earnedBadges.includes("perfect")) {
        const updated = { ...currentUser, earnedBadges: [...currentUser.earnedBadges, "perfect"] };
        setCurrentUser(updated);
        await saveUser(updated);
        showToast("💎", "Badge Unlocked: Diamond Mind!", "Perfect score in timed exam!");
      }
    }
    // Check speed badge
    if (studyMode === "timed" && timedSeconds > 300 && sessionAnswered > 0) {
      if (!currentUser.earnedBadges.includes("speed")) {
        const updated = { ...currentUser, earnedBadges: [...currentUser.earnedBadges, "speed"] };
        setCurrentUser(updated);
        await saveUser(updated);
      }
    }
    setTab("results");
  }

  // ── Admin load ──
  useEffect(() => {
    if (currentUser?.role === "admin" && tab === "admin") {
      loadAllStudents().then(setAllStudents);
    }
  }, [tab, currentUser]);

  // ── Leaderboard refresh ──
  useEffect(() => {
    if (tab === "leaderboard") loadLeaderboard().then(setLeaderboard);
  }, [tab]);

  if (!currentUser) return <AuthScreen {...{authMode, setAuthMode, authUsername, setAuthUsername, authPassword, setAuthPassword, authRole, setAuthRole, authSchool, setAuthSchool, authExamLevel, setAuthExamLevel, authError, authLoading, handleLogin, handleRegister}} />;

  const levelInfo = getLevelInfo(currentUser.xp);
  const nextLvl = getNextLevel(currentUser.xp);
  const xpPct = xpProgress(currentUser.xp);

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "quiz", icon: "🎯", label: "Practice" },
    { id: "results", icon: "📋", label: "Results" },
    { id: "progress", icon: "📊", label: "Progress" },
    { id: "badges", icon: "🏆", label: "Badges" },
    { id: "leaderboard", icon: "🥇", label: "Rankings" },
    ...(currentUser.role === "admin" ? [{ id: "admin", icon: "👩‍💼", label: "Admin" }] : []),
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div className="app-bg-grid" />
        <div className="app-bg-glow" />

        {/* Header */}
        <header className="header">
          <div className="logo">Math<span>Quest</span> UG</div>
          <div className="hud">
            <div className="hud-chip">
              <span>⚡</span>
              <span className="hc-val">{currentUser.streak}</span>
              <span className="hc-lbl">streak</span>
            </div>
            <div className="hud-chip hud-xp">
              <span>💎</span>
              <span className="hc-val">{currentUser.xp}</span>
              <span className="hc-lbl">XP</span>
            </div>
            <div className="user-menu" onClick={() => setTab("profile")}>
              <div className="avatar">{currentUser.username[0].toUpperCase()}</div>
              <div>
                <div className="user-name">{currentUser.username}</div>
                <div className="user-role">{currentUser.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* XP Bar */}
        <div className="xpbar">
          <span className="xpbar-label">Lv {levelInfo.level} · {levelInfo.name}</span>
          <div className="xpbar-track"><div className="xpbar-fill" style={{ width: `${xpPct}%` }} /></div>
          <span className="xpbar-badge">{nextLvl ? `${currentUser.xp}/${nextLvl.minXP}` : "MAX"} XP</span>
        </div>

        <div className="shell">
          {/* Sidebar */}
          <nav className="sidebar">
            {navItems.map(n => (
              <button key={n.id} className={`nav-btn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <span className="ni">{n.icon}</span>{n.label}
              </button>
            ))}
            <div className="logout-btn" style={{padding:"12px 14px 0"}}>
              <button className="nav-btn" style={{color:"#666"}} onClick={handleLogout}>
                <span className="ni">🚪</span>Logout
              </button>
            </div>
          </nav>

          {/* Panel */}
          <main className="panel">
            {tab === "home" && <HomePanel {...{examLevel, setExamLevel, selectedSubject, setSelectedSubject, selectedTopic, setSelectedTopic, studyMode, setStudyMode, startSession, currentUser}} />}
            {tab === "quiz" && <QuizPanel {...{quizActive, loading, error, question, selected, explanation, xpGained, qNum, studyMode, timedSeconds, timedTotal, sessionAnswered, sessionCorrect, streak: currentUser.streak, handleAnswer, fetchQuestion, endSession, startSession, examLevel, selectedSubject, selectedTopic}} />}
            {tab === "results" && <ResultsPanel {...{sessionAnswered, sessionCorrect, studyMode, timedSeconds, setTab, startSession, selectedSubject}} />}
            {tab === "progress" && <ProgressPanel user={currentUser} />}
            {tab === "badges" && <BadgesPanel earned={currentUser.earnedBadges || []} />}
            {tab === "leaderboard" && <LeaderboardPanel leaderboard={leaderboard} currentUser={currentUser} />}
            {tab === "admin" && currentUser.role === "admin" && <AdminPanel students={allStudents} currentUser={currentUser} adminTab={adminTab} setAdminTab={setAdminTab} />}
            {tab === "profile" && <ProfilePanel user={currentUser} handleLogout={handleLogout} />}
          </main>
        </div>

        {/* Mobile nav */}
        <nav className="mob-nav">
          <div className="mob-nav-inner">
            {navItems.slice(0,6).map(n => (
              <button key={n.id} className={`mob-nav-btn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <span className="mni">{n.icon}</span>{n.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Toast */}
        {toast && (
          <div className="toast">
            <div className="toast-icon">{toast.icon}</div>
            <div>
              <div className="toast-title">{toast.title}</div>
              <div className="toast-desc">{toast.desc}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────

function AuthScreen({ authMode, setAuthMode, authUsername, setAuthUsername, authPassword, setAuthPassword, authRole, setAuthRole, authSchool, setAuthSchool, authExamLevel, setAuthExamLevel, authError, authLoading, handleLogin, handleRegister }) {
  return (
    <div className="auth-wrap">
      <style>{STYLES}</style>
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow" />
      <div className="auth-card">
        <div className="auth-logo">MathQuest UG</div>
        <div className="auth-sub">Uganda's AI-Powered Exam Prep Platform · UCE & UACE</div>

        <div className="auth-tabs">
          <button className={`auth-tab ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>Login</button>
          <button className={`auth-tab ${authMode === "register" ? "active" : ""}`} onClick={() => setAuthMode("register")}>Register</button>
        </div>

        {authError && <div className="auth-error">{authError}</div>}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" value={authUsername} onChange={e => setAuthUsername(e.target.value)} placeholder="e.g. john_k" onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())} />
        </div>

        {authMode === "register" && <>
          <div className="form-group">
            <label className="form-label">I am a</label>
            <div className="role-select">
              {[["student","🎓","Student"],["teacher","👩‍🏫","Teacher"],["admin","👩‍💼","Admin"]].map(([val, icon, lbl]) => (
                <button key={val} className={`role-btn ${authRole === val ? "sel" : ""}`} onClick={() => setAuthRole(val)}>
                  <span className="rb-icon">{icon}</span>{lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Exam Level</label>
            <select className="form-select" value={authExamLevel} onChange={e => setAuthExamLevel(e.target.value)}>
              <option value="UCE">UCE (O-Level)</option>
              <option value="UACE">UACE (A-Level)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">School Name (optional)</label>
            <input className="form-input" value={authSchool} onChange={e => setAuthSchool(e.target.value)} placeholder="e.g. Makerere College School" />
          </div>
        </>}

        <button className="btn-primary" onClick={authMode === "login" ? handleLogin : handleRegister} disabled={authLoading}>
          {authLoading ? <><div className="spinner" style={{borderColor:"rgba(0,0,0,0.2)",borderTopColor:"#000"}} /> Loading...</> : authMode === "login" ? "🚀 Login" : "✨ Create Account"}
        </button>

        <p style={{textAlign:"center",marginTop:16,fontSize:12,color:"#555"}}>
          {authMode === "login" ? "No account? " : "Have an account? "}
          <span style={{color:"#FFD700",cursor:"pointer"}} onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
            {authMode === "login" ? "Register here" : "Login here"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── HOME PANEL ──────────────────────────────────────────────────────────────

function HomePanel({ examLevel, setExamLevel, selectedSubject, setSelectedSubject, selectedTopic, setSelectedTopic, studyMode, setStudyMode, startSession, currentUser }) {
  const subjectData = SUBJECTS[selectedSubject];
  const topics = selectedSubject && examLevel ? SUBJECTS[selectedSubject][examLevel] : [];
  const ready = examLevel && selectedSubject && selectedTopic;

  return (
    <div>
      <div className="hero">
        <div className="hero-title">Ace Your Exams</div>
        <p className="hero-sub">AI-powered practice for UCE & UACE · Earn XP · Climb the rankings</p>
      </div>

      <div className="sec-title" style={{marginBottom:10}}>1. Exam Level</div>
      <div className="level-row" style={{justifyContent:"flex-start",marginTop:0}}>
        {["UCE","UACE"].map(l => (
          <div key={l} className={`level-pill ${examLevel === l ? "sel" : ""}`} onClick={() => { setExamLevel(l); setSelectedSubject(null); setSelectedTopic(null); }}>
            {l === "UCE" ? "📘 UCE (O-Level)" : "🎓 UACE (A-Level)"}
          </div>
        ))}
      </div>

      {examLevel && <>
        <div className="sec-title" style={{marginTop:24,marginBottom:10}}>2. Subject</div>
        <div className="subject-grid">
          {Object.entries(SUBJECTS).map(([name, data]) => (
            <div key={name} className={`subject-card ${selectedSubject === name ? "sel" : ""}`}
              style={selectedSubject === name ? {borderColor: data.color, boxShadow: `0 4px 20px ${data.color}25`} : {}}
              onClick={() => { setSelectedSubject(name); setSelectedTopic(null); }}>
              <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg, ${data.color}08, transparent)`,opacity:selectedSubject===name?1:0,transition:"opacity 0.2s",borderRadius:13}} />
              <div className="sc-check" style={{background: data.color}}>✓</div>
              <div className="sc-icon">{data.icon}</div>
              <div className="sc-name" style={selectedSubject===name?{color:data.color}:{}}>{name}</div>
              <div className="sc-count">{data[examLevel].length} topics · AI questions</div>
            </div>
          ))}
        </div>
      </>}

      {selectedSubject && examLevel && <>
        <div className="sec-title" style={{marginTop:20,marginBottom:10}}>3. Topic</div>
        <div className="topic-grid">
          {topics.map(t => (
            <div key={t} className={`topic-chip ${selectedTopic === t ? "sel" : ""}`}
              style={selectedTopic===t ? {borderColor: subjectData.color, color: subjectData.color} : {}}
              onClick={() => setSelectedTopic(t)}>
              {t}
            </div>
          ))}
        </div>
      </>}

      {selectedTopic && <>
        <div className="sec-title" style={{marginTop:20,marginBottom:10}}>4. Mode</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:24}}>
          <div className={`mode-btn ${studyMode==="practice"?"sel":""}`} onClick={() => setStudyMode("practice")}>
            <span className="mb-icon">🎯</span>
            <span className="mb-name">Practice Mode</span>
            <span className="mb-desc">Unlimited questions, see explanations</span>
          </div>
          <div className={`mode-btn ${studyMode==="timed"?"sel":""}`} onClick={() => setStudyMode("timed")}>
            <span className="mb-icon">⏱️</span>
            <span className="mb-name">Timed Exam</span>
            <span className="mb-desc">10 minutes, exam simulation</span>
          </div>
        </div>
      </>}

      <div className="start-row">
        <button className="btn-primary" style={{width:"auto",padding:"14px 36px"}} disabled={!ready} onClick={startSession}>
          🚀 Start {studyMode === "timed" ? "Timed Exam" : "Practice Session"}
        </button>
        {!ready && <span style={{fontSize:12,color:"#555"}}>Select level, subject & topic</span>}
      </div>
    </div>
  );
}

// ─── QUIZ PANEL ──────────────────────────────────────────────────────────────

function QuizPanel({ quizActive, loading, error, question, selected, explanation, xpGained, qNum, studyMode, timedSeconds, timedTotal, sessionAnswered, sessionCorrect, streak, handleAnswer, fetchQuestion, endSession, startSession, examLevel, selectedSubject, selectedTopic }) {
  const urgent = timedSeconds < 60;
  const timerPct = (timedSeconds / timedTotal) * 100;
  const subjectColor = SUBJECTS[selectedSubject]?.color || "#FFD700";

  if (!quizActive && !loading && !question) {
    return (
      <div className="empty-state">
        <div className="es-icon">🎯</div>
        <div className="es-title">Ready to Practice?</div>
        <p style={{color:"#555",fontSize:13,marginBottom:20}}>Go to Home to select your subject and topic</p>
      </div>
    );
  }

  return (
    <div className="quiz-wrap">
      <div className="quiz-header">
        <div>
          <div className="quiz-meta"><span style={{color:subjectColor}}>{selectedSubject}</span> · {examLevel} · <strong>{selectedTopic}</strong></div>
          <div className="quiz-meta" style={{marginTop:3}}>Session: <strong>{sessionCorrect}/{sessionAnswered}</strong> correct · Q #{qNum}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {streak >= 2 && <div className="streak-pill">🔥 {streak} streak</div>}
          <button className="btn-sm btn-sm-ghost" onClick={endSession}>End Session</button>
        </div>
      </div>

      {studyMode === "timed" && (
        <div className="timer-bar-wrap">
          <div className="timer-info">
            <span style={{color:"#aaa",fontSize:12}}>Time Remaining</span>
            <span className={`timer-count ${urgent?"urgent":""}`}>{Math.floor(timedSeconds/60)}:{String(timedSeconds%60).padStart(2,"0")}</span>
          </div>
          <div className="timer-track"><div className={`timer-fill ${urgent?"urgent":""}`} style={{width:`${timerPct}%`}} /></div>
        </div>
      )}

      {sessionAnswered > 0 && (
        <div className="progress-bar"><div className="progress-fill" style={{width:`${(sessionCorrect/Math.max(sessionAnswered,1))*100}%`}} /></div>
      )}

      {loading && <div className="loading-state"><div className="spinner" /> Generating AI question...</div>}
      {error && <div style={{textAlign:"center",padding:32}}>
        <p style={{color:"#ff5555",marginBottom:16}}>{error}</p>
        <button className="btn-sm btn-sm-gold" onClick={fetchQuestion}>Try Again</button>
      </div>}

      {question && !loading && (
        <div className="q-card">
          <div className="q-meta" style={{color:subjectColor}}>{SUBJECTS[selectedSubject]?.icon} {selectedTopic}</div>
          <div className="q-num">Question #{qNum}</div>
          <div className="q-text">{question.question}</div>
          <span className={`diff-tag diff-${question.difficulty}`}>{question.difficulty?.toUpperCase()}</span>

          <div className="options">
            {question.options.map((opt, i) => {
              let cls = "opt-btn";
              if (selected !== null) {
                if (i === question.correct) cls += " correct";
                else if (i === selected && i !== question.correct) cls += " wrong";
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={selected !== null}>
                  <span className="opt-letter">{["A","B","C","D"][i]}</span>
                  {opt.replace(/^[A-D]\)\s*/,"")}
                </button>
              );
            })}
          </div>

          {xpGained && <div className="xp-pop">⚡ +{xpGained} XP</div>}

          {explanation && (
            <div className="explanation">
              <div className="exp-title">💡 Step-by-Step Solution</div>
              <div className="exp-text">{explanation}</div>
            </div>
          )}

          {selected !== null && (
            <div className="quiz-actions">
              <button className="btn-sm btn-sm-gold" onClick={fetchQuestion}>Next Question →</button>
              <button className="btn-sm btn-sm-ghost" onClick={endSession}>End Session</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RESULTS PANEL ───────────────────────────────────────────────────────────

function ResultsPanel({ sessionAnswered, sessionCorrect, studyMode, timedSeconds, setTab, startSession, selectedSubject }) {
  const pct = sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;
  const emoji = sessionAnswered === 0 ? "😴" : pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "💪";
  const msg = pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great work!" : pct >= 50 ? "Good effort!" : "Keep practicing!";
  const timeLeft = studyMode === "timed" ? `${Math.floor(timedSeconds/60)}:${String(timedSeconds%60).padStart(2,"0")}` : "–";

  return (
    <div className="results-wrap">
      <div className="results-card">
        <div className="results-emoji">{emoji}</div>
        <div className="results-pct">{pct}%</div>
        <div className="results-label">{msg} · {selectedSubject || "Session"} complete</div>

        <div className="results-grid">
          <div className="rg-item"><div className="rg-val">{sessionCorrect}</div><div className="rg-key">Correct</div></div>
          <div className="rg-item"><div className="rg-val">{sessionAnswered - sessionCorrect}</div><div className="rg-key">Wrong</div></div>
          <div className="rg-item"><div className="rg-val">{sessionAnswered}</div><div className="rg-key">Total</div></div>
          <div className="rg-item"><div className="rg-val">{timeLeft}</div><div className="rg-key">{studyMode === "timed" ? "Time Left" : "Mode"}</div></div>
        </div>

        <div className="results-actions">
          <button className="btn-sm btn-sm-gold" onClick={() => setTab("home")}>🔄 New Session</button>
          <button className="btn-sm btn-sm-ghost" onClick={() => setTab("progress")}>📊 Progress</button>
          <button className="btn-sm btn-sm-ghost" onClick={() => setTab("badges")}>🏆 Badges</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROGRESS PANEL ──────────────────────────────────────────────────────────

function ProgressPanel({ user }) {
  const levelInfo = getLevelInfo(user.xp);
  const acc = user.totalAnswered > 0 ? Math.round((user.totalCorrect / user.totalAnswered) * 100) : 0;

  return (
    <div>
      <div className="sec-title">Your Progress</div>
      <p className="sec-sub">Track your performance across all subjects and topics.</p>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-val">{user.xp}</div><div className="stat-key">Total XP</div></div>
        <div className="stat-card"><div className="stat-val">Lv {levelInfo.level}</div><div className="stat-key">{levelInfo.name}</div></div>
        <div className="stat-card"><div className="stat-val">{user.bestStreak || 0}🔥</div><div className="stat-key">Best Streak</div></div>
        <div className="stat-card"><div className="stat-val">{user.totalAnswered}</div><div className="stat-key">Questions Answered</div></div>
        <div className="stat-card"><div className="stat-val">{user.totalCorrect}</div><div className="stat-key">Correct Answers</div></div>
        <div className="stat-card"><div className="stat-val">{acc}%</div><div className="stat-key">Overall Accuracy</div></div>
        <div className="stat-card"><div className="stat-val">{(user.earnedBadges || []).length}</div><div className="stat-key">Badges Earned</div></div>
        <div className="stat-card"><div className="stat-val">{(user.subjectsPracticed || []).length}</div><div className="stat-key">Subjects Practiced</div></div>
      </div>

      <div className="sec-title" style={{marginBottom:14}}>Subject Breakdown</div>
      <div className="subject-breakdown">
        {Object.keys(SUBJECTS).map(subj => {
          const stats = (user.subjectStats || {})[subj] || { answered: 0, correct: 0 };
          const pct = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
          const color = SUBJECTS[subj].color;
          return (
            <div key={subj} className="sb-row">
              <div className="sb-name">{SUBJECTS[subj].icon} {subj}</div>
              <div className="sb-track"><div className="sb-fill" style={{width:`${pct}%`,background:color}} /></div>
              <div className="sb-pct" style={{color}}>{stats.answered > 0 ? pct + "%" : "–"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BADGES PANEL ────────────────────────────────────────────────────────────

function BadgesPanel({ earned }) {
  const earnedCount = earned.length;
  return (
    <div>
      <div className="sec-title">Badges & Achievements</div>
      <p className="sec-sub">{earnedCount} of {BADGES.length} badges unlocked. Keep practicing to earn them all!</p>
      <div className="badges-grid">
        {BADGES.map(b => {
          const isEarned = earned.includes(b.id);
          return (
            <div key={b.id} className={`badge-card ${isEarned ? "earned" : "locked"}`}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
              <div className="badge-xp">+{b.xp} XP</div>
              {isEarned && <div className="badge-earned-label">✓ EARNED</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LEADERBOARD PANEL ───────────────────────────────────────────────────────

function LeaderboardPanel({ leaderboard, currentUser }) {
  return (
    <div>
      <div className="sec-title">🥇 Global Rankings</div>
      <p className="sec-sub">Top students across all schools. Shared leaderboard — compete with everyone!</p>
      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">🏅</div>
          <div className="es-title">No rankings yet</div>
          <p style={{color:"#555",fontSize:13}}>Be the first to appear by completing a practice session!</p>
        </div>
      ) : (
        <table className="lb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>School</th>
              <th>Level</th>
              <th>Accuracy</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.slice(0, 50).map((entry, i) => {
              const isYou = entry.username === currentUser.username;
              const rankClass = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
              return (
                <tr key={entry.username} className={isYou ? "lb-you" : ""}>
                  <td><span className={`lb-rank ${rankClass}`}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</span></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="avatar" style={{width:28,height:28,fontSize:11}}>{entry.username[0].toUpperCase()}</div>
                      <span className="lb-name">{entry.username} {isYou && <span className="tag tag-gold">You</span>}</span>
                    </div>
                  </td>
                  <td style={{color:"#666",fontSize:11}}>{entry.school || "–"}</td>
                  <td><span className="tag tag-blue">{entry.level}</span></td>
                  <td style={{color:"#aaa"}}>{entry.accuracy}%</td>
                  <td><span className="lb-xp">{entry.xp} XP</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────

function AdminPanel({ students, currentUser, adminTab, setAdminTab }) {
  const totalStudents = students.length;
  const totalQAnswered = students.reduce((s, u) => s + (u.totalAnswered || 0), 0);
  const avgAccuracy = students.length > 0
    ? Math.round(students.reduce((s, u) => s + (u.totalAnswered > 0 ? Math.round((u.totalCorrect / u.totalAnswered) * 100) : 0), 0) / students.length)
    : 0;
  const activeToday = students.filter(u => u.lastActive && (Date.now() - u.lastActive) < 86400000).length;

  const atRisk = students.filter(u => {
    const acc = u.totalAnswered > 0 ? (u.totalCorrect / u.totalAnswered) * 100 : 0;
    return u.totalAnswered >= 5 && acc < 50;
  });

  return (
    <div>
      <div className="sec-title">👩‍💼 Admin Dashboard</div>
      <p className="sec-sub">Monitor student performance across your school.</p>

      <div className="admin-grid">
        <div className="admin-card"><div className="admin-card-icon">🎓</div><div className="admin-card-val">{totalStudents}</div><div className="admin-card-key">Total Students</div></div>
        <div className="admin-card"><div className="admin-card-icon">💬</div><div className="admin-card-val">{totalQAnswered}</div><div className="admin-card-key">Questions Answered</div></div>
        <div className="admin-card"><div className="admin-card-icon">🎯</div><div className="admin-card-val">{avgAccuracy}%</div><div className="admin-card-key">Average Accuracy</div></div>
        <div className="admin-card"><div className="admin-card-icon">🟢</div><div className="admin-card-val">{activeToday}</div><div className="admin-card-key">Active Today</div></div>
      </div>

      <div className="tab-bar">
        <button className={`tab-item ${adminTab === "overview" ? "active" : ""}`} onClick={() => setAdminTab("overview")}>All Students</button>
        <button className={`tab-item ${adminTab === "atrisk" ? "active" : ""}`} onClick={() => setAdminTab("atrisk")}>⚠️ At Risk ({atRisk.length})</button>
        <button className={`tab-item ${adminTab === "subjects" ? "active" : ""}`} onClick={() => setAdminTab("subjects")}>Subject Stats</button>
      </div>

      {adminTab === "overview" && (
        <StudentTable students={students} />
      )}

      {adminTab === "atrisk" && (
        atRisk.length === 0
          ? <div className="empty-state"><div className="es-icon">✅</div><div className="es-title">No at-risk students</div><p style={{color:"#555",fontSize:13}}>All students with 5+ answers are performing well!</p></div>
          : <StudentTable students={atRisk} />
      )}

      {adminTab === "subjects" && (
        <div>
          {Object.keys(SUBJECTS).map(subj => {
            const studentsInSubj = students.filter(u => u.subjectStats?.[subj]?.answered > 0);
            const avgAcc = studentsInSubj.length > 0
              ? Math.round(studentsInSubj.reduce((s,u) => s + Math.round((u.subjectStats[subj].correct/u.subjectStats[subj].answered)*100),0)/studentsInSubj.length) : 0;
            return (
              <div key={subj} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:20}}>{SUBJECTS[subj].icon}</span>
                  <span style={{fontFamily:"Syne",fontWeight:700,fontSize:16}}>{subj}</span>
                  <span style={{fontSize:12,color:"#666"}}>{studentsInSubj.length} students practicing</span>
                  <span style={{marginLeft:"auto",color:SUBJECTS[subj].color,fontWeight:700}}>{avgAcc}% avg</span>
                </div>
                <div className="sb-track" style={{height:10}}>
                  <div className="sb-fill" style={{width:`${avgAcc}%`,background:SUBJECTS[subj].color}} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentTable({ students }) {
  if (students.length === 0) return (
    <div className="empty-state"><div className="es-icon">🎓</div><div className="es-title">No students yet</div><p style={{color:"#555",fontSize:13}}>Students will appear here once they register.</p></div>
  );
  return (
    <table className="students-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Level</th>
          <th>Questions</th>
          <th>Accuracy</th>
          <th>XP</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {students.sort((a,b)=>b.xp-a.xp).map(u => {
          const acc = u.totalAnswered > 0 ? Math.round((u.totalCorrect/u.totalAnswered)*100) : 0;
          const lvl = getLevelInfo(u.xp);
          const isActive = u.lastActive && (Date.now()-u.lastActive) < 86400000;
          return (
            <tr key={u.username}>
              <td>
                <div className="student-info">
                  <div className="avatar" style={{width:30,height:30,fontSize:12}}>{u.username[0].toUpperCase()}</div>
                  <div>
                    <div className="student-name">{u.username}</div>
                    <div className="student-level">{u.school || "No school"}</div>
                  </div>
                </div>
              </td>
              <td><span className="tag tag-blue">Lv {lvl.level} {lvl.name}</span></td>
              <td style={{color:"#aaa"}}>{u.totalAnswered}</td>
              <td>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div className="perf-bar"><div className="perf-fill" style={{width:`${acc}%`}} /></div>
                  <span style={{color:"#aaa",fontSize:12}}>{u.totalAnswered > 0 ? acc+"%" : "–"}</span>
                </div>
              </td>
              <td style={{color:"#FFD700",fontWeight:700}}>{u.xp}</td>
              <td>
                <span className={`alert-chip ${u.totalAnswered < 5 ? "alert-mid" : acc >= 70 ? "alert-ok" : acc >= 50 ? "alert-mid" : "alert-low"}`}>
                  {u.totalAnswered < 5 ? "New" : acc >= 70 ? "On Track" : acc >= 50 ? "Average" : "At Risk"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── PROFILE PANEL ───────────────────────────────────────────────────────────

function ProfilePanel({ user, handleLogout }) {
  const lvl = getLevelInfo(user.xp);
  const acc = user.totalAnswered > 0 ? Math.round((user.totalCorrect/user.totalAnswered)*100) : 0;
  const joined = new Date(user.joinedAt).toLocaleDateString("en-UG", {year:"numeric",month:"long",day:"numeric"});

  return (
    <div style={{maxWidth:560}}>
      <div className="profile-header">
        <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
        <div>
          <div className="profile-name">{user.username}</div>
          <div className="profile-meta">
            <span className="tag tag-gold">{lvl.name}</span>
            <span className="tag tag-blue">{user.role}</span>
            {user.school && <span style={{fontSize:12,color:"#666"}}> · {user.school}</span>}
          </div>
          <div style={{fontSize:12,color:"#555",marginTop:6}}>Member since {joined}</div>
        </div>
      </div>

      <hr className="divider" />

      <div className="stats-grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
        <div className="stat-card"><div className="stat-val">{user.xp}</div><div className="stat-key">Total XP</div></div>
        <div className="stat-card"><div className="stat-val">Lv {lvl.level}</div><div className="stat-key">{lvl.name}</div></div>
        <div className="stat-card"><div className="stat-val">{acc}%</div><div className="stat-key">Accuracy</div></div>
        <div className="stat-card"><div className="stat-val">{user.totalAnswered}</div><div className="stat-key">Questions</div></div>
        <div className="stat-card"><div className="stat-val">{user.bestStreak || 0}🔥</div><div className="stat-key">Best Streak</div></div>
        <div className="stat-card"><div className="stat-val">{(user.earnedBadges||[]).length}</div><div className="stat-key">Badges</div></div>
      </div>

      <hr className="divider" />

      <div style={{marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>Exam Level</div>
        <div style={{fontSize:13,color:"#aaa"}}>{user.examLevel || "Not set"}</div>
      </div>

      <div style={{marginBottom:24}}>
        <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>Subjects Practiced</div>
        <div style={{fontSize:13,color:"#aaa"}}>
          {(user.subjectsPracticed||[]).length > 0 ? (user.subjectsPracticed||[]).join(", ") : "None yet — go practice!"}
        </div>
      </div>

      <button className="btn-danger" onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
}
