/* LUMEN — La última luciérnaga
   Juego arcade minimalista en Canvas 2D.
   Sin dependencias, sin assets externos: todo se dibuja y se sintetiza. */

(function () {
  'use strict';

  const CFG = window.LUMEN_CONFIG || {};
  const audio = window.LumenAudio;

  const W = 960;
  const H = 600;
  const TAU = Math.PI * 2;

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });

  const els = {
    frame: document.getElementById('frame'),
    overlay: document.getElementById('overlay'),
    hudLevel: document.getElementById('hudLevel'),
    hudLevelName: document.getElementById('hudLevelName'),
    hudScore: document.getElementById('hudScore'),
    energyBar: document.getElementById('energyBar'),
    energyFill: document.getElementById('energyFill'),
    energyLabel: document.getElementById('energyLabel'),
    lanterns: document.getElementById('lanterns'),
    combo: document.getElementById('combo'),
    muteBtn: document.getElementById('muteBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    dashBtn: document.getElementById('dashBtn'),
    menuBest: document.getElementById('menuBest'),
    introLevel: document.getElementById('introLevel'),
    introName: document.getElementById('introName'),
    introText: document.getElementById('introText'),
    introCount: document.getElementById('introCount'),
    pauseLevel: document.getElementById('pauseLevel'),
    pauseScore: document.getElementById('pauseScore'),
    clearTitle: document.getElementById('clearTitle'),
    clearTime: document.getElementById('clearTime'),
    clearTimeBonus: document.getElementById('clearTimeBonus'),
    clearLightBonus: document.getElementById('clearLightBonus'),
    clearScore: document.getElementById('clearScore'),
    overLevel: document.getElementById('overLevel'),
    overScore: document.getElementById('overScore'),
    overBest: document.getElementById('overBest'),
    victoryScore: document.getElementById('victoryScore'),
    victoryBest: document.getElementById('victoryBest')
  };

  const panels = {
    menu: document.getElementById('panel-menu'),
    help: document.getElementById('panel-help'),
    credits: document.getElementById('panel-credits'),
    pause: document.getElementById('panel-pause'),
    intro: document.getElementById('panel-intro'),
    levelClear: document.getElementById('panel-clear'),
    gameover: document.getElementById('panel-gameover'),
    victory: document.getElementById('panel-victory')
  };

  /* ---------- Niveles ----------
     Cada nivel define faroles (posiciones fijas para que el mapa del GDD
     coincida con el juego), drenaje de luz y número de sombras. */

  const LEVELS = [
    {
      name: 'Jardín de musgo',
      text: 'Las luciérnagas antiguas dormían entre el musgo. Despiértalas.',
      drain: 5.0, speed: 62, shadows: 2, sparks: 7,
      lanterns: [[220, 170], [740, 160], [480, 430]]
    },
    {
      name: 'Invernadero roto',
      text: 'El cristal roto corta la noche. Las sombras ya saben dónde estás.',
      drain: 5.5, speed: 72, shadows: 3, sparks: 7,
      lanterns: [[170, 420], [480, 150], [800, 390]]
    },
    {
      name: 'Estanque de luna',
      text: 'El estanque refleja un cielo que ya no existe. No te detengas.',
      drain: 6.0, speed: 82, shadows: 4, sparks: 8,
      lanterns: [[250, 140], [710, 250], [470, 470]]
    },
    {
      name: 'Bosque de helechos',
      text: 'Los helechos susurran nombres antiguos. Corre antes de que te alcancen.',
      drain: 6.5, speed: 92, shadows: 5, sparks: 8,
      lanterns: [[140, 300], [520, 120], [810, 470]]
    },
    {
      name: 'Mirador del faro',
      text: 'Desde el mirador se ve el último faro. Enciéndelo y devuelve la noche a las estrellas.',
      drain: 7.0, speed: 102, shadows: 6, sparks: 9,
      lanterns: [[180, 160], [780, 170], [490, 330]]
    }
  ];

  const DASH_COST = 12;
  const DASH_REQUIRED = 12;
  const DASH_SPEED = 760;
  const DASH_TIME = 0.16;
  const DASH_COOLDOWN = 1.05;
  const LANTERN_COST = 30;
  const MAX_ENERGY = 100;

  /* ---------- Estado ---------- */

  let mode = 'menu';
  let level = 1;
  let score = 0;
  let best = 0;
  let energy = MAX_ENERGY;
  let litCount = 0;
  let combo = 1;
  let comboTimer = 0;
  let levelTime = 0;
  let introTimer = 0;
  let pendingClear = 0;
  let sparkSpawnTimer = 0;
  let shake = 0;
  let flash = 0;
  let flashColor = '#ffffff';
  let elapsed = 0;
  let frozen = false;
  let demoMode = false;
  let lastFrame = 0;
  let dpr = 1;
  let vignetteGrad = null;
  let bgGrad = null;
  const TEST_MODE = new URLSearchParams(location.search).has('test');

  let sparks = [];
  let shadows = [];
  let lanterns = [];
  let particles = [];
  let floaters = [];
  let waves = [];
  let stars = [];
  let decor = [];
  let motes = [];
  let fireflies = [];

  const keys = new Set();
  const pointer = { active: false, id: null, x: 0, y: 0 };

  const player = {
    x: W / 2,
    y: H / 2,
    vx: 0,
    vy: 0,
    r: 11,
    angle: -Math.PI / 2,
    facing: { x: 0, y: -1 },
    dashTime: 0,
    dashCd: 0,
    dashDir: { x: 1, y: 0 },
    invuln: 0,
    trail: 0,
    visible: false
  };

  /* ---------- Utilidades ---------- */

  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function setText(el, text) { if (el && el.textContent !== text) el.textContent = text; }
  function fmt(n) { return Math.round(n).toLocaleString('es-MX'); }
  function auraRadius() { return 90 + (energy / MAX_ENERGY) * 76; }

  function sfx(name, arg) {
    if (audio && audio.play) {
      try { audio.play(name, arg); } catch (err) { /* sin audio */ }
    }
  }

  const store = {
    get: function (key, fallback) {
      try {
        const raw = localStorage.getItem('lumen.' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (err) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem('lumen.' + key, JSON.stringify(value)); } catch (err) { /* sin storage */ }
    }
  };

  /* ---------- Paneles ---------- */

  function showPanel(name) {
    Object.keys(panels).forEach(function (key) {
      if (panels[key]) panels[key].hidden = key !== name;
    });
    const visible = !!name;
    els.overlay.classList.toggle('is-visible', visible);
    const hudOn = !visible || name === 'pause' || name === 'intro';
    els.frame.classList.toggle('hud-on', hudOn);
    if (visible && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  function updateMenuBest() {
    setText(els.menuBest, fmt(best));
  }

  /* ---------- HUD ---------- */

  function buildLanternDots() {
    if (!els.lanterns) return;
    els.lanterns.innerHTML = '';
    const count = Math.max(3, lanterns.length);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      els.lanterns.appendChild(dot);
    }
  }

  function updateHUD() {
    const pct = clamp(energy, 0, MAX_ENERGY);
    if (els.energyFill) els.energyFill.style.transform = 'scaleX(' + (pct / MAX_ENERGY).toFixed(4) + ')';
    if (els.energyBar) {
      els.energyBar.classList.toggle('low', pct < 25);
      els.energyBar.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
    setText(els.energyLabel, 'LUZ ' + Math.round(pct));
    setText(els.hudScore, fmt(score));
    setText(els.hudLevel, 'NIVEL ' + level);
    const cfg = LEVELS[Math.min(level, LEVELS.length) - 1];
    setText(els.hudLevelName, cfg ? cfg.name : '');
    setText(els.combo, combo > 1 ? 'COMBO ×' + combo : '');
    if (els.combo) els.combo.classList.toggle('on', combo > 1);

    if (els.lanterns) {
      if (els.lanterns.children.length !== Math.max(3, lanterns.length)) buildLanternDots();
      for (let i = 0; i < els.lanterns.children.length; i++) {
        const lit = !!(lanterns[i] && lanterns[i].lit);
        els.lanterns.children[i].classList.toggle('lit', lit);
      }
    }
  }

  function refreshMute() {
    const muted = audio && audio.isMuted ? audio.isMuted() : false;
    setText(els.muteBtn, muted ? 'SONIDO NO' : 'SONIDO SÍ');
    if (els.muteBtn) els.muteBtn.setAttribute('aria-pressed', String(muted));
  }

  function toggleMute() {
    if (!audio) return;
    audio.init();
    audio.toggleMute();
    refreshMute();
  }

  /* ---------- Flujo del juego ---------- */

  function startGame() {
    if (audio) audio.init();
    score = 0;
    best = Math.max(best, Number(store.get('best', 0)) || 0);
    level = 1;
    startLevel(1);
  }

  function startLevel(n) {
    level = clamp(n, 1, LEVELS.length);
    const cfg = LEVELS[level - 1];

    energy = MAX_ENERGY;
    combo = 1;
    comboTimer = 0;
    levelTime = 0;
    litCount = 0;
    pendingClear = 0;
    sparkSpawnTimer = 0;
    sparks = [];
    shadows = [];
    particles = [];
    floaters = [];
    waves = [];
    shake = 0;
    flash = 0;

    player.x = W / 2;
    player.y = H / 2 + 70;
    player.vx = 0;
    player.vy = 0;
    player.dashTime = 0;
    player.dashCd = 0;
    player.invuln = 1.4;
    player.angle = -Math.PI / 2;
    player.facing = { x: 0, y: -1 };
    player.trail = 0;
    player.visible = true;

    lanterns = cfg.lanterns.map(function (pos, i) {
      return { x: pos[0], y: pos[1], lit: false, deny: 0, pulse: i * 1.7 };
    });

    for (let i = 0; i < cfg.sparks; i++) spawnSpark(true);
    for (let i = 0; i < cfg.shadows; i++) spawnShadow(true);

    introTimer = 3.2;
    mode = 'intro';
    pointer.active = false;

    setText(els.introLevel, 'Nivel ' + level);
    setText(els.introName, cfg.name);
    setText(els.introText, cfg.text);
    setText(els.introCount, 'Comienza en 3…');
    buildLanternDots();
    updateHUD();
    showPanel('intro');

    if (audio) audio.startMusic(level);
  }

  function beginPlay() {
    if (mode !== 'intro') return;
    mode = 'playing';
    player.invuln = Math.max(player.invuln, 0.9);
    showPanel(null);
    if (audio) audio.init();
  }

  function pauseGame() {
    if (mode !== 'playing') return;
    mode = 'paused';
    keys.clear();
    pointer.active = false;
    setText(els.pauseLevel, String(level));
    setText(els.pauseScore, fmt(score));
    showPanel('pause');
  }

  function resumeGame() {
    if (mode !== 'paused') return;
    mode = 'playing';
    showPanel(null);
  }

  function showMenu() {
    mode = 'menu';
    if (audio) audio.stopMusic();
    sparks = [];
    shadows = [];
    lanterns = [];
    particles = [];
    floaters = [];
    waves = [];
    pendingClear = 0;
    player.visible = false;
    combo = 1;
    comboTimer = 0;
    updateMenuBest();
    updateHUD();
    showPanel('menu');
  }

  function finishLevel() {
    if (mode !== 'playing') return;

    const timeBonus = Math.max(0, Math.round((120 - levelTime) * 4));
    const lightBonus = Math.round(energy * 2);
    score += timeBonus + lightBonus;
    mode = 'levelClear';
    if (audio) audio.stopMusic();

    if (level >= LEVELS.length) {
      best = Math.max(best, score);
      store.set('best', best);
      mode = 'victory';
      setText(els.victoryScore, fmt(score));
      setText(els.victoryBest, fmt(best));
      showPanel('victory');
      sfx('victory');
      burst(player.x, player.y, 50, { color: '#ffd166', speed: 240, life: 1.4, size: 2.6 });
      shake = 10;
      flash = 0.6;
      flashColor = '#ffd166';
      updateMenuBest();
      return;
    }

    setText(els.clearTitle, LEVELS[level - 1].name + ' respira');
    setText(els.clearTime, levelTime.toFixed(1) + ' s');
    setText(els.clearTimeBonus, '+' + fmt(timeBonus));
    setText(els.clearLightBonus, '+' + fmt(lightBonus));
    setText(els.clearScore, fmt(score));
    showPanel('levelClear');
    sfx('levelup');
    updateHUD();
  }

  function nextLevel() {
    if (mode !== 'levelClear') return;
    startLevel(level + 1);
  }

  function endGame() {
    if (mode === 'gameover' || mode === 'victory') return;
    mode = 'gameover';
    if (audio) {
      audio.stopMusic();
      audio.play('gameover');
    }
    best = Math.max(best, score);
    store.set('best', best);
    setText(els.overLevel, String(level));
    setText(els.overScore, fmt(score));
    setText(els.overBest, fmt(best));
    showPanel('gameover');
    burst(player.x, player.y, 42, { color: '#ff7b9c', speed: 210, life: 1, size: 2.4 });
    shake = 14;
    flash = 0.5;
    flashColor = '#ff7b9c';
    player.visible = false;
    updateMenuBest();
    updateHUD();
  }

  /* ---------- Acciones de UI ---------- */

  function handleAction(action) {
    switch (action) {
      case 'play': startGame(); break;
      case 'help': mode = 'help'; showPanel('help'); break;
      case 'credits': mode = 'credits'; showPanel('credits'); break;
      case 'menu': showMenu(); break;
      case 'resume': resumeGame(); break;
      case 'restart': startGame(); break;
      case 'next': nextLevel(); break;
      case 'skipIntro': beginPlay(); break;
      default: break;
    }
  }

  /* ---------- Entidades ---------- */

  function spawnSpark(initial) {
    let x = rand(60, W - 60);
    let y = rand(80, H - 80);
    let tries = 0;
    while (Math.hypot(x - player.x, y - player.y) < 130 && tries < 40) {
      x = rand(60, W - 60);
      y = rand(80, H - 80);
      tries++;
    }
    sparks.push({
      x: x,
      y: y,
      vx: initial ? rand(-16, 16) : rand(-40, 40),
      vy: initial ? rand(-16, 16) : rand(-40, 40),
      r: 5,
      phase: rand(0, TAU)
    });
  }

  function edgePosition() {
    const side = Math.floor(rand(0, 4));
    if (side === 0) return { x: rand(0, W), y: -40 };
    if (side === 1) return { x: W + 40, y: rand(0, H) };
    if (side === 2) return { x: rand(0, W), y: H + 40 };
    return { x: -40, y: rand(0, H) };
  }

  function spawnShadow(initial) {
    let pos = edgePosition();
    let tries = 0;
    while (player.visible && Math.hypot(pos.x - player.x, pos.y - player.y) < 250 && tries < 40) {
      pos = edgePosition();
      tries++;
    }
    shadows.push({
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      r: 15,
      seed: rand(0, TAU),
      dead: false,
      respawn: 0
    });
  }

  function reviveShadow(s) {
    let pos = edgePosition();
    let tries = 0;
    while (Math.hypot(pos.x - player.x, pos.y - player.y) < 260 && tries < 40) {
      pos = edgePosition();
      tries++;
    }
    s.x = pos.x;
    s.y = pos.y;
    s.vx = 0;
    s.vy = 0;
    s.dead = false;
    s.respawn = 0;
    s.seed = rand(0, TAU);
  }

  function killShadow(s, points) {
    if (s.dead) return;
    s.dead = true;
    s.respawn = 3.4;
    burst(s.x, s.y, 16, { color: '#a78bfa', speed: 170, life: 0.7, size: 2.2 });
    if (points) {
      const gain = points * level;
      score += gain;
      addFloater('+' + gain, s.x, s.y, '#a78bfa', 14);
    }
    shake = Math.max(shake, 4);
    sfx('poof');
  }

  function addFloater(text, x, y, color, size) {
    floaters.push({
      x: x,
      y: y,
      text: text,
      color: color || '#9dffcb',
      size: size || 15,
      life: 1.1,
      max: 1.1
    });
  }

  function burst(x, y, n, opt) {
    opt = opt || {};
    const color = opt.color || '#7ef9ff';
    const speed = opt.speed || 120;
    const life = opt.life || 0.6;
    const size = opt.size || 2;
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = speed * rand(0.25, 1);
      const l = life * rand(0.7, 1.2);
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: l,
        max: l,
        size: size * rand(0.6, 1.4),
        color: color
      });
    }
    if (particles.length > 500) particles.splice(0, particles.length - 500);
  }

  /* ---------- Entrada ---------- */

  function inputVector() {
    let ix = 0;
    let iy = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) ix -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) ix += 1;
    if (keys.has('ArrowUp') || keys.has('KeyW')) iy -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) iy += 1;

    if (pointer.active) {
      const dx = pointer.x - player.x;
      const dy = pointer.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d > 16) {
        ix = dx / d;
        iy = dy / d;
      }
    }

    const len = Math.hypot(ix, iy);
    if (len > 1) {
      ix /= len;
      iy /= len;
    }
    return { x: ix, y: iy, len: Math.min(1, len) };
  }

  function tryDash() {
    if (mode !== 'playing') return;
    const p = player;
    if (p.dashCd > 0 || p.dashTime > 0) return;
    if (energy < DASH_REQUIRED) {
      addFloater('Sin luz para el destello', p.x, p.y - 28, '#ff7b9c', 12);
      sfx('deny');
      return;
    }

    let dir = inputVector();
    if (dir.len < 0.1) dir = { x: p.facing.x, y: p.facing.y };
    const len = Math.hypot(dir.x, dir.y) || 1;

    p.dashDir = { x: dir.x / len, y: dir.y / len };
    p.angle = Math.atan2(p.dashDir.y, p.dashDir.x);
    p.dashTime = DASH_TIME;
    p.dashCd = DASH_COOLDOWN;
    p.invuln = Math.max(p.invuln, 0.42);
    energy = Math.max(1, energy - DASH_COST);

    shake = Math.max(shake, 4);
    burst(p.x, p.y, 12, { color: '#9dffcb', speed: 190, life: 0.4, size: 2 });
    sfx('dash');
    updateHUD();
  }

  /* ---------- Lógica ---------- */

  function collectSpark(s) {
    const points = 10 * combo * level;
    score += points;
    energy = Math.min(MAX_ENERGY, energy + 15);
    comboTimer = 2.2;
    combo = Math.min(9, combo + 1);

    addFloater('+' + points, s.x, s.y - 6, '#9dffcb', 14);
    burst(s.x, s.y, 10, { color: '#7ef9ff', speed: 130, life: 0.55, size: 2.2 });
    shake = Math.max(shake, 2.5);
    sfx('collect', combo - 2);
  }

  function hitPlayer(s) {
    if (TEST_MODE) return;
    if (player.invuln > 0 || player.dashTime > 0) return;

    energy -= 22;
    player.invuln = 1.25;
    combo = 1;
    comboTimer = 0;

    const dx = player.x - s.x;
    const dy = player.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    player.vx += (dx / d) * 290;
    player.vy += (dy / d) * 290;
    s.vx -= (dx / d) * 150;
    s.vy -= (dy / d) * 150;

    shake = 11;
    flash = 0.35;
    flashColor = '#ff7b9c';
    addFloater('-22 luz', player.x, player.y - 28, '#ff7b9c', 14);
    burst(player.x, player.y, 14, { color: '#ff7b9c', speed: 170, life: 0.5, size: 2 });
    sfx('hurt');

    if (energy <= 0) {
      energy = 0;
      endGame();
    }
  }

  function lightLantern(l) {
    l.lit = true;
    litCount++;
    energy = Math.max(1, energy - LANTERN_COST);
    score += 200 * level;

    waves.push({ x: l.x, y: l.y, r: 18, max: 300, life: 0.75, maxLife: 0.75 });
    burst(l.x, l.y, 34, { color: '#ffd166', speed: 230, life: 1, size: 2.6 });
    addFloater('FAROL ENCENDIDO  +' + (200 * level), l.x, l.y - 40, '#ffd166', 16);

    shadows.forEach(function (s) {
      if (s.dead) return;
      if (Math.hypot(s.x - l.x, s.y - l.y) < 300) killShadow(s, 15);
    });

    shake = Math.max(shake, 8);
    flash = 0.55;
    flashColor = '#ffd166';
    sfx('lantern');

    if (litCount >= 3) {
      pendingClear = 1.1;
      energy = Math.max(10, energy);
      player.invuln = Math.max(player.invuln, 1.4);
    }
    updateHUD();
  }

  function updateAmbient(dt) {
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.x += m.vx * dt * m.z;
      m.y += m.vy * dt * m.z;
      if (m.x < -10) m.x = W + 10;
      if (m.x > W + 10) m.x = -10;
      if (m.y < -10) m.y = H + 10;
      if (m.y > H + 10) m.y = -10;
      m.ph += dt * 1.5;
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      const drag = Math.exp(-2.4 * dt);
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  function updateFloaters(dt) {
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.life -= dt;
      f.y -= 26 * dt;
      if (f.life <= 0) floaters.splice(i, 1);
    }
  }

  function updateWaves(dt) {
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.r += (w.max - w.r) * Math.min(1, dt * 6);
      w.life -= dt;
      if (w.life <= 0) waves.splice(i, 1);
    }
  }

  function updatePlayer(dt) {
    const p = player;
    const input = inputVector();
    if (input.len > 0.05) {
      p.facing = { x: input.x, y: input.y };
      p.angle = Math.atan2(input.y, input.x);
    }

    if (p.dashTime > 0) {
      p.dashTime -= dt;
      p.vx = p.dashDir.x * DASH_SPEED;
      p.vy = p.dashDir.y * DASH_SPEED;
      if (p.dashTime <= 0) {
        p.vx *= 0.32;
        p.vy *= 0.32;
      }
    } else {
      const accel = 1650;
      p.vx += input.x * accel * dt;
      p.vy += input.y * accel * dt;
      const drag = Math.exp(-5.5 * dt);
      p.vx *= drag;
      p.vy *= drag;
      const sp = Math.hypot(p.vx, p.vy);
      const max = 262;
      if (sp > max) {
        p.vx = (p.vx / sp) * max;
        p.vy = (p.vy / sp) * max;
      }
    }

    p.x = clamp(p.x + p.vx * dt, p.r + 8, W - p.r - 8);
    p.y = clamp(p.y + p.vy * dt, p.r + 8, H - p.r - 8);

    if (p.dashCd > 0) p.dashCd = Math.max(0, p.dashCd - dt);
    if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);

    p.trail -= dt;
    if ((input.len > 0.1 || p.dashTime > 0) && p.trail <= 0) {
      p.trail = p.dashTime > 0 ? 0.012 : 0.05;
      particles.push({
        x: p.x - p.facing.x * 6,
        y: p.y - p.facing.y * 6,
        vx: rand(-14, 14) - p.vx * 0.05,
        vy: rand(-14, 14) - p.vy * 0.05,
        life: 0.55,
        max: 0.55,
        size: p.dashTime > 0 ? 2.6 : 1.6,
        color: '#7ef9ff'
      });
    }
  }

  function updateSparks(dt) {
    const aura = auraRadius();

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.phase += dt;
      const dx = player.x - s.x;
      const dy = player.y - s.y;
      const d = Math.hypot(dx, dy) || 1;

      if (d < aura) {
        const pull = 280 * (1 - d / aura);
        s.vx += (dx / d) * pull * dt;
        s.vy += (dy / d) * pull * dt;
      }

      const drag = Math.exp(-1.8 * dt);
      s.vx *= drag;
      s.vy *= drag;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (s.x < 30) { s.x = 30; s.vx = Math.abs(s.vx) * 0.6; }
      if (s.x > W - 30) { s.x = W - 30; s.vx = -Math.abs(s.vx) * 0.6; }
      if (s.y < 40) { s.y = 40; s.vy = Math.abs(s.vy) * 0.6; }
      if (s.y > H - 40) { s.y = H - 40; s.vy = -Math.abs(s.vy) * 0.6; }

      if (d < player.r + s.r + 7) {
        sparks.splice(i, 1);
        collectSpark(s);
      }
    }

    const cfg = LEVELS[level - 1];
    if (sparks.length < cfg.sparks) {
      sparkSpawnTimer -= dt;
      if (sparkSpawnTimer <= 0) {
        spawnSpark(false);
        sparkSpawnTimer = 0.75;
      }
    } else {
      sparkSpawnTimer = 0.75;
    }
  }

  function updateShadows(dt) {
    const cfg = LEVELS[level - 1];
    const lowLight = 1 - energy / MAX_ENERGY;
    const speed = (cfg.speed + (level - 1) * 4) * (1 + lowLight * 0.28);

    for (let i = 0; i < shadows.length; i++) {
      const s = shadows[i];
      if (s.dead) {
        s.respawn -= dt;
        if (s.respawn <= 0) reviveShadow(s);
        continue;
      }

      const dx = player.x - s.x;
      const dy = player.y - s.y;
      const d = Math.hypot(dx, dy) || 1;
      const wob = Math.sin(elapsed * 1.7 + s.seed) * 0.5;
      const px = -dy / d;
      const py = dx / d;

      const tx = (dx / d) * speed + px * wob * 26;
      const ty = (dy / d) * speed + py * wob * 26;

      s.vx += (tx - s.vx) * 2.2 * dt;
      s.vy += (ty - s.vy) * 2.2 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.x = clamp(s.x, -60, W + 60);
      s.y = clamp(s.y, -60, H + 60);

      if (d < s.r + player.r - 2) {
        if (player.dashTime > 0) {
          killShadow(s, 25);
          continue;
        }
        if (player.invuln <= 0) hitPlayer(s);
        if (mode !== 'playing') return;
      }
    }

    for (let i = 0; i < shadows.length; i++) {
      const a = shadows[i];
      if (a.dead) continue;
      for (let j = i + 1; j < shadows.length; j++) {
        const b = shadows[j];
        if (b.dead) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 46) {
          const push = (46 - d) * 0.5;
          const nx = dx / d;
          const ny = dy / d;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }
  }

  function updateLanterns(dt) {
    for (let i = 0; i < lanterns.length; i++) {
      const l = lanterns[i];
      if (l.lit) continue;
      if (l.deny > 0) l.deny = Math.max(0, l.deny - dt);
      const d = Math.hypot(player.x - l.x, player.y - l.y);
      if (d < 46) {
        if (energy >= LANTERN_COST) {
          lightLantern(l);
          if (mode !== 'playing') return;
        } else if (l.deny <= 0) {
          l.deny = 2;
          addFloater('Necesitas ' + LANTERN_COST + ' de luz', l.x, l.y - 38, '#ff7b9c', 12);
          sfx('deny');
        }
      }
    }
  }

  function playTick(dt) {
    levelTime += dt;

    updatePlayer(dt);

    if (!TEST_MODE && pendingClear <= 0) {
      energy -= LEVELS[level - 1].drain * dt;
      if (energy <= 0) {
        energy = 0;
        updateHUD();
        endGame();
        return;
      }
    }

    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) {
        comboTimer = 0;
        combo = 1;
        updateHUD();
      }
    }

    updateSparks(dt);
    updateShadows(dt);
    if (mode !== 'playing') return;

    updateLanterns(dt);
    if (mode !== 'playing') return;

    if (pendingClear > 0) {
      pendingClear -= dt;
      if (pendingClear <= 0) {
        finishLevel();
        return;
      }
    }

    if (shake > 0) shake = Math.max(0, shake - dt * 24);
    if (flash > 0) flash = Math.max(0, flash - dt * 1.7);
  }

  function update(dt) {
    elapsed += dt;
    updateAmbient(dt);

    if (mode === 'intro') {
      introTimer -= dt;
      setText(els.introCount, 'Comienza en ' + Math.max(1, Math.ceil(introTimer)) + '…');
      if (introTimer <= 0) beginPlay();
      updateParticles(dt);
      updateFloaters(dt);
      updateWaves(dt);
      return;
    }

    if (mode === 'playing') {
      playTick(dt);
    } else {
      if (shake > 0) shake = Math.max(0, shake - dt * 24);
      if (flash > 0) flash = Math.max(0, flash - dt * 1.7);
      updateWaves(dt);
    }

    updateParticles(dt);
    updateFloaters(dt);
  }

  /* ---------- Dibujo ---------- */

  function makeGradients() {
    bgGrad = ctx.createLinearGradient(0, 0, W * 0.25, H);
    bgGrad.addColorStop(0, '#060a18');
    bgGrad.addColorStop(0.45, '#04070f');
    bgGrad.addColorStop(1, '#02040a');

    vignetteGrad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.28, W / 2, H / 2, Math.max(W, H) * 0.78);
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGrad.addColorStop(0.62, 'rgba(0,0,0,0.24)');
    vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.82)');
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeGradients();
  }

  function buildAmbient() {
    stars = [];
    for (let i = 0; i < 85; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H * 0.8),
        r: rand(0.4, 1.5),
        tw: rand(0, TAU),
        sp: rand(0.4, 1.6)
      });
    }

    decor = [];
    for (let i = 0; i < 14; i++) {
      decor.push({
        x: rand(10, W - 10),
        h: rand(50, 180),
        lean: rand(-46, 46),
        w: rand(1, 2.2),
        glow: i % 4 === 0
      });
    }

    motes = [];
    for (let i = 0; i < 40; i++) {
      motes.push({
        x: rand(0, W),
        y: rand(0, H),
        z: rand(0.3, 1),
        vx: rand(-7, 7),
        vy: rand(-12, -2),
        r: rand(0.6, 1.8),
        ph: rand(0, TAU)
      });
    }

    fireflies = [];
    for (let i = 0; i < 6; i++) {
      fireflies.push({
        ox: rand(90, W - 90),
        oy: rand(90, H - 90),
        ax: rand(30, 100),
        ay: rand(20, 70),
        sp: rand(0.18, 0.45),
        ph: rand(0, TAU),
        r: rand(1.2, 2.2),
        warm: i % 2 === 0
      });
    }
  }

  function glow(x, y, r, inner, outer) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function drawBackground() {
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(elapsed * s.sp + s.tw));
      ctx.globalAlpha = 0.18 + tw * 0.4;
      ctx.fillStyle = '#bfe9ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    /* Silueta del jardín */
    ctx.fillStyle = '#050912';
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H + 96, W * 0.72, 170, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#071019';
    ctx.beginPath();
    ctx.ellipse(W * 0.18, H + 110, W * 0.5, 150, 0, 0, TAU);
    ctx.fill();

    for (let i = 0; i < decor.length; i++) {
      const d = decor[i];
      ctx.strokeStyle = 'rgba(28, 70, 76, 0.5)';
      ctx.lineWidth = d.w;
      ctx.beginPath();
      ctx.moveTo(d.x, H + 6);
      ctx.quadraticCurveTo(d.x + d.lean * 0.4, H - d.h * 0.55, d.x + d.lean, H - d.h);
      ctx.stroke();
      if (d.glow) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        glow(d.x + d.lean, H - d.h, 14, 'rgba(126,249,255,0.22)', 'rgba(126,249,255,0)');
        ctx.restore();
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      ctx.globalAlpha = 0.08 + m.z * 0.22;
      ctx.fillStyle = '#8be9ff';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    /* Luciérnagas de fondo */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < fireflies.length; i++) {
      const f = fireflies[i];
      const x = f.ox + Math.sin(elapsed * f.sp + f.ph) * f.ax;
      const y = f.oy + Math.cos(elapsed * f.sp * 0.8 + f.ph) * f.ay;
      const color = f.warm ? '255,209,102' : '126,249,255';
      glow(x, y, 18, 'rgba(' + color + ',0.35)', 'rgba(' + color + ',0)');
      ctx.fillStyle = 'rgba(' + color + ',0.85)';
      ctx.beginPath();
      ctx.arc(x, y, f.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAura() {
    const r = auraRadius();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(player.x, player.y, r * 1.45, 'rgba(120,240,255,0.15)', 'rgba(30,90,130,0)');
    glow(player.x, player.y, r * 0.55, 'rgba(180,250,255,0.10)', 'rgba(126,249,255,0)');
    ctx.restore();
  }

  function drawLanterns() {
    for (let i = 0; i < lanterns.length; i++) {
      const l = lanterns[i];
      const pulse = 0.86 + Math.sin(elapsed * 2 + l.pulse) * 0.14;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (l.lit) {
        glow(l.x, l.y, 150 * pulse, 'rgba(255,209,102,0.30)', 'rgba(255,209,102,0)');
        glow(l.x, l.y, 46, 'rgba(255,240,190,0.55)', 'rgba(255,209,102,0)');
      } else {
        glow(l.x, l.y, 54, 'rgba(126,249,255,0.12)', 'rgba(126,249,255,0)');
      }
      ctx.restore();

      /* Poste */
      ctx.strokeStyle = l.lit ? 'rgba(255,209,102,0.5)' : 'rgba(126,249,255,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y + 18);
      ctx.lineTo(l.x, l.y + 54);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(l.x - 10, l.y + 54);
      ctx.lineTo(l.x + 10, l.y + 54);
      ctx.stroke();

      /* Aro */
      ctx.strokeStyle = l.lit ? 'rgba(255,224,150,0.9)' : 'rgba(126,249,255,0.4)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 18 * pulse, 0, TAU);
      ctx.stroke();

      /* Núcleo */
      if (l.lit) {
        ctx.fillStyle = 'rgba(255,236,180,0.95)';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 8.5 * pulse, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 3.4, 0, TAU);
        ctx.fill();

        /* Rayos suaves */
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(elapsed * 0.25 + i);
        ctx.strokeStyle = 'rgba(255,209,102,0.22)';
        ctx.lineWidth = 1;
        for (let k = 0; k < 8; k++) {
          ctx.rotate(TAU / 8);
          ctx.beginPath();
          ctx.moveTo(24, 0);
          ctx.lineTo(24 + 10 * pulse, 0);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(10,24,34,0.9)';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 7 * pulse, 0, TAU);
        ctx.fill();
      }

      /* Aviso de proximidad */
      const d = Math.hypot(player.x - l.x, player.y - l.y);
      if (!l.lit && d < 90) {
        ctx.save();
        ctx.strokeStyle = energy >= LANTERN_COST ? 'rgba(157,255,203,0.55)' : 'rgba(255,123,156,0.55)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(l.x, l.y, 26 + Math.sin(elapsed * 5) * 3, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawSparks() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      const pulse = 0.8 + Math.sin(elapsed * 3 + s.phase) * 0.2;
      glow(s.x, s.y, 24 * pulse, 'rgba(126,249,255,0.45)', 'rgba(126,249,255,0)');
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.6 * pulse, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = 'rgba(180,250,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x - 7 * pulse, s.y);
      ctx.lineTo(s.x + 7 * pulse, s.y);
      ctx.moveTo(s.x, s.y - 7 * pulse);
      ctx.lineTo(s.x, s.y + 7 * pulse);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawShadows() {
    for (let i = 0; i < shadows.length; i++) {
      const s = shadows[i];
      if (s.dead) continue;

      const wob = Math.sin(elapsed * 3 + s.seed) * 2;

      ctx.save();
      const g = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, s.r * 2.7);
      g.addColorStop(0, 'rgba(5,2,12,0.96)');
      g.addColorStop(0.5, 'rgba(16,6,32,0.8)');
      g.addColorStop(1, 'rgba(60,20,90,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2.7, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#07030f';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r + wob * 0.2, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = 'rgba(167,139,250,0.42)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r + wob * 0.2, 0, TAU);
      ctx.stroke();

      const a = Math.atan2(player.y - s.y, player.x - s.x);
      const ex = Math.cos(a) * 5;
      const ey = Math.sin(a) * 5;
      const px = Math.cos(a + Math.PI / 2) * 4.4;
      const py = Math.sin(a + Math.PI / 2) * 4.4;

      ctx.fillStyle = 'rgba(226,200,255,0.92)';
      ctx.beginPath();
      ctx.arc(s.x + ex + px, s.y + ey + py, 1.7, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s.x + ex - px, s.y + ey - py, 1.7, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawPlayer() {
    if (!player.visible) return;
    const p = player;
    const flicker = p.invuln > 0 && Math.floor(elapsed * 16) % 2 === 0;

    ctx.save();
    ctx.globalAlpha = flicker ? 0.55 : 1;

    if (p.dashTime > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const tx = p.x - p.dashDir.x * 46;
      const ty = p.y - p.dashDir.y * 46;
      const g = ctx.createLinearGradient(tx, ty, p.x, p.y);
      g.addColorStop(0, 'rgba(126,249,255,0)');
      g.addColorStop(1, 'rgba(126,249,255,0.5)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    const flap = Math.sin(elapsed * 24) * 0.5;

    ctx.fillStyle = 'rgba(180,245,255,0.26)';
    ctx.beginPath();
    ctx.ellipse(-3, -9, 6.5, 12, 0.45 + flap * 0.5, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-3, 9, 6.5, 12, -0.45 - flap * 0.5, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = 'lighter';
    glow(-8, 0, 13, 'rgba(255,209,102,0.85)', 'rgba(255,209,102,0)');
    glow(0, 0, 20, 'rgba(255,255,255,0.95)', 'rgba(126,249,255,0)');

    ctx.fillStyle = 'rgba(255,255,255,0.98)';
    ctx.beginPath();
    ctx.arc(0, 0, 4.6, 0, TAU);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,220,150,0.95)';
    ctx.beginPath();
    ctx.arc(-7, 0, 3.2, 0, TAU);
    ctx.fill();

    ctx.restore();

    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const t = p.life / p.max;
      ctx.globalAlpha = Math.max(0, t) * 0.9;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + t * 0.8), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWaves() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < waves.length; i++) {
      const w = waves[i];
      const t = w.life / w.maxLife;
      ctx.globalAlpha = Math.max(0, t) * 0.55;
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2 + (1 - t) * 4;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFloaters() {
    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      const t = clamp(f.life / f.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = t;
      ctx.fillStyle = f.color;
      ctx.font = '600 ' + f.size + 'px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 12;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function drawVignette() {
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawFlash() {
    if (flash <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(0.7, flash);
    ctx.fillStyle = flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    drawBackground();

    if (player.visible) drawAura();

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    drawLanterns();
    drawSparks();
    drawShadows();
    drawPlayer();
    drawWaves();
    drawParticles();
    drawFloaters();

    ctx.restore();

    drawVignette();
    drawFlash();
  }

  /* ---------- Bucle ---------- */

  function frame(ts) {
    if (!lastFrame) lastFrame = ts;
    let dt = (ts - lastFrame) / 1000;
    lastFrame = ts;
    if (!isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 0.05);

    if (!frozen && mode !== 'paused') update(dt);
    render();
    updateHUD();
    requestAnimationFrame(frame);
  }

  /* ---------- Escena de demostración (capturas) ---------- */

  function setupDemo() {
    frozen = true;
    mode = 'playing';
    level = 2;
    const cfg = LEVELS[1];

    score = 1840;
    energy = 68;
    litCount = 1;
    combo = 1;
    comboTimer = 0;

    player.visible = true;
    player.x = 430;
    player.y = 330;
    player.angle = 0.15;
    player.invuln = 0;

    lanterns = cfg.lanterns.map(function (pos, i) {
      return { x: pos[0], y: pos[1], lit: i === 0, deny: 0, pulse: i * 1.7 };
    });

    sparks = [
      { x: 520, y: 248, vx: 0, vy: 0, r: 5, phase: 0.4 },
      { x: 648, y: 336, vx: 0, vy: 0, r: 5, phase: 1.2 },
      { x: 322, y: 214, vx: 0, vy: 0, r: 5, phase: 2.1 },
      { x: 300, y: 432, vx: 0, vy: 0, r: 5, phase: 2.8 },
      { x: 722, y: 468, vx: 0, vy: 0, r: 5, phase: 0.9 }
    ];

    shadows = [
      { x: 652, y: 158, vx: 0, vy: 0, r: 15, seed: 1, dead: false, respawn: 0 },
      { x: 246, y: 306, vx: 0, vy: 0, r: 15, seed: 2, dead: false, respawn: 0 },
      { x: 806, y: 356, vx: 0, vy: 0, r: 15, seed: 3, dead: false, respawn: 0 }
    ];

    for (let i = 0; i < 30; i++) {
      burst(rand(160, 800), rand(110, 480), 1, { color: '#7ef9ff', speed: 8, life: 2, size: 1.5 });
    }

    buildLanternDots();
    updateHUD();
    showPanel(null);
  }

  /* ---------- Arranque ---------- */

  function bindEvents() {
    document.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (audio) audio.init();
        if (audio) audio.click();
        handleAction(btn.getAttribute('data-action'));
        btn.blur();
      });
    });

    if (els.muteBtn) {
      els.muteBtn.addEventListener('click', function () {
        toggleMute();
        els.muteBtn.blur();
      });
    }

    if (els.pauseBtn) {
      els.pauseBtn.addEventListener('click', function () {
        if (mode === 'playing') pauseGame();
        else if (mode === 'paused') resumeGame();
        els.pauseBtn.blur();
      });
    }

    if (els.dashBtn) {
      const dash = function (e) {
        e.preventDefault();
        tryDash();
      };
      els.dashBtn.addEventListener('pointerdown', dash);
      els.dashBtn.addEventListener('click', function (e) {
        e.preventDefault();
        tryDash();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault();
      keys.add(e.code);
      if (e.repeat) return;

      if (e.code === 'KeyM') {
        toggleMute();
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (mode === 'playing') pauseGame();
        else if (mode === 'paused') resumeGame();
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        if (mode === 'playing') {
          if (e.code === 'Space') tryDash();
        } else if (mode === 'menu') {
          startGame();
        } else if (mode === 'help' || mode === 'credits') {
          showPanel('menu');
          mode = 'menu';
        } else if (mode === 'intro') {
          beginPlay();
        } else if (mode === 'paused') {
          resumeGame();
        } else if (mode === 'levelClear') {
          nextLevel();
        } else if (mode === 'gameover' || mode === 'victory') {
          startGame();
        }
      }
    });

    window.addEventListener('keyup', function (e) {
      keys.delete(e.code);
    });

    window.addEventListener('blur', function () {
      keys.clear();
      pointer.active = false;
      if (mode === 'playing') pauseGame();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && mode === 'playing') pauseGame();
    });

    function toWorld(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (W / rect.width),
        y: (e.clientY - rect.top) * (H / rect.height)
      };
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (mode !== 'playing') return;
      if (audio) audio.init();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignorar */ }
      pointer.active = true;
      pointer.id = e.pointerId;
      const pt = toWorld(e);
      pointer.x = pt.x;
      pointer.y = pt.y;
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!pointer.active || e.pointerId !== pointer.id) return;
      const pt = toWorld(e);
      pointer.x = pt.x;
      pointer.y = pt.y;
    });

    function release(e) {
      if (e.pointerId === pointer.id) {
        pointer.active = false;
        pointer.id = null;
      }
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('pointerdown', function unlock() {
      if (audio) audio.init();
    }, { once: true });

    window.addEventListener('keydown', function unlock() {
      if (audio) audio.init();
    }, { once: true });
  }

  function init() {
    resizeCanvas();
    buildAmbient();
    best = Number(store.get('best', 0)) || 0;
    buildLanternDots();
    refreshMute();
    updateMenuBest();
    bindEvents();

    demoMode = new URLSearchParams(location.search).has('demo');
    if (demoMode) setupDemo();
    else showMenu();

    requestAnimationFrame(frame);
  }

  /* API mínima de depuración (solo lectura) para pruebas automatizadas. */
  window.LumenDebug = {
    state: function () {
      return {
        mode: mode,
        level: level,
        score: score,
        best: best,
        energy: Math.round(energy * 10) / 10,
        combo: combo,
        lit: litCount,
        sparks: sparks.length,
        shadows: shadows.length,
        player: { x: Math.round(player.x), y: Math.round(player.y) },
        dashCd: Math.round(player.dashCd * 100) / 100,
        sparkList: sparks.map(function (s) { return { x: Math.round(s.x), y: Math.round(s.y) }; }),
        lanternList: lanterns.map(function (l) { return { x: l.x, y: l.y, lit: l.lit }; })
      };
    }
  };

  init();
})();
