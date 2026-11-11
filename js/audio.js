/* LUMEN — audio procedural
   Música ambiental generativa y efectos sintetizados con Web Audio API.
   No hay archivos .mp3/.ogg: todo se calcula en el navegador. */

(function () {
  'use strict';

  const MUTE_KEY = 'lumen.muted';

  const A = {
    ctx: null,
    master: null,
    musicBus: null,
    sfxBus: null,
    muted: false,
    unlocked: false,
    playing: false,
    root: 220,
    step: 0,
    nextNote: 0,
    timer: null,
    drone: [],
    noiseBuffer: null
  };

  try {
    A.muted = JSON.parse(localStorage.getItem(MUTE_KEY) || 'false') === true;
  } catch (err) {
    A.muted = false;
  }

  function ensure() {
    if (A.ctx) return A.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    A.ctx = new Ctx();

    A.master = A.ctx.createGain();
    A.master.gain.value = A.muted ? 0.0001 : 0.9;
    A.master.connect(A.ctx.destination);

    A.musicBus = A.ctx.createGain();
    A.musicBus.gain.value = 0.55;
    A.musicBus.connect(A.master);

    A.sfxBus = A.ctx.createGain();
    A.sfxBus.gain.value = 0.9;
    A.sfxBus.connect(A.master);

    return A.ctx;
  }

  function now() {
    return A.ctx ? A.ctx.currentTime : 0;
  }

  function unlock() {
    const c = ensure();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    A.unlocked = true;
  }

  function setMuted(value) {
    A.muted = value === true;
    try {
      localStorage.setItem(MUTE_KEY, JSON.stringify(A.muted));
    } catch (err) { /* almacenamiento no disponible */ }
    if (A.ctx && A.master) {
      const t = A.ctx.currentTime;
      A.master.gain.cancelScheduledValues(t);
      A.master.gain.setTargetAtTime(A.muted ? 0.0001 : 0.9, t, 0.04);
    }
  }

  function toggleMute() {
    setMuted(!A.muted);
    return A.muted;
  }

  /* ---------- Bloques de síntesis ---------- */

  function toneAt(t0, o) {
    const c = ensure();
    if (!c) return;
    const dur = o.dur || 0.2;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(20, o.freq), t0);
    if (o.to) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
    }

    filter.type = 'lowpass';
    filter.frequency.value = o.cutoff || 9000;
    filter.Q.value = o.q == null ? 0.7 : o.q;

    const peak = Math.max(0.0002, o.gain == null ? 0.08 : o.gain);
    const attack = Math.max(0.004, o.attack || 0.008);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(o.dest || A.sfxBus);

    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noiseAt(t0, o) {
    const c = ensure();
    if (!c) return;
    if (!A.noiseBuffer) {
      const len = Math.floor(c.sampleRate * 1.2);
      A.noiseBuffer = c.createBuffer(1, len, c.sampleRate);
      const data = A.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }

    const dur = o.dur || 0.2;
    const src = c.createBufferSource();
    src.buffer = A.noiseBuffer;
    src.loop = true;

    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = o.q == null ? 1.1 : o.q;
    filter.frequency.setValueAtTime(o.from || 600, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, o.to || 1800), t0 + dur);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(o.gain == null ? 0.1 : o.gain, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(o.dest || A.sfxBus);
    src.start(t0);
    src.stop(t0 + dur + 0.03);
  }

  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];

  function note(base, semitones) {
    return base * Math.pow(2, semitones / 12);
  }

  /* ---------- Efectos ---------- */

  const sfx = {
    click: function () {
      const t = now();
      toneAt(t, { freq: 880, to: 660, type: 'sine', dur: 0.07, gain: 0.05 });
    },

    collect: function (combo) {
      const t = now();
      const idx = Math.min(PENTA.length - 1, Math.max(0, combo | 0));
      const f = note(523.25, PENTA[idx]);
      toneAt(t, { freq: f, to: f * 1.01, type: 'sine', dur: 0.2, gain: 0.11 });
      toneAt(t + 0.012, { freq: f * 2, type: 'triangle', dur: 0.14, gain: 0.035 });
      noiseAt(t, { from: 3000, to: 6000, dur: 0.09, gain: 0.018, q: 2 });
    },

    dash: function () {
      const t = now();
      noiseAt(t, { from: 500, to: 3200, dur: 0.22, gain: 0.12, q: 1.4 });
      toneAt(t, { freq: 180, to: 720, type: 'sine', dur: 0.2, gain: 0.06 });
    },

    poof: function () {
      const t = now();
      toneAt(t, { freq: 340, to: 130, type: 'triangle', dur: 0.16, gain: 0.05, cutoff: 1300 });
      noiseAt(t, { from: 1000, to: 260, dur: 0.13, gain: 0.03, q: 1.6 });
    },

    hurt: function () {
      const t = now();
      toneAt(t, { freq: 190, to: 52, type: 'sawtooth', dur: 0.38, gain: 0.16, cutoff: 800 });
      noiseAt(t, { from: 900, to: 120, dur: 0.25, gain: 0.1, q: 0.8 });
    },

    lantern: function () {
      const t = now();
      const chord = [0, 4, 7, 12, 16];
      chord.forEach(function (semi, i) {
        toneAt(t + i * 0.055, {
          freq: note(261.63, semi),
          type: 'sine',
          dur: 1.5,
          gain: 0.075,
          attack: 0.02
        });
      });
      noiseAt(t, { from: 1200, to: 5200, dur: 0.7, gain: 0.05, q: 0.9 });
    },

    deny: function () {
      const t = now();
      toneAt(t, { freq: 150, to: 110, type: 'square', dur: 0.14, gain: 0.05, cutoff: 700 });
    },

    levelup: function () {
      const t = now();
      const seq = [0, 4, 7, 12, 16, 19];
      seq.forEach(function (semi, i) {
        toneAt(t + i * 0.09, {
          freq: note(392, semi),
          type: 'triangle',
          dur: 0.45,
          gain: 0.07,
          attack: 0.01
        });
      });
    },

    gameover: function () {
      const t = now();
      const seq = [0, -3, -7, -12, -17];
      seq.forEach(function (semi, i) {
        toneAt(t + i * 0.22, {
          freq: note(329.63, semi),
          type: 'sine',
          dur: 0.9,
          gain: 0.09,
          attack: 0.02
        });
      });
      noiseAt(t + 0.2, { from: 700, to: 90, dur: 1.2, gain: 0.04, q: 0.6 });
    },

    victory: function () {
      const t = now();
      const chord = [0, 4, 7, 12, 16, 19, 24];
      chord.forEach(function (semi, i) {
        toneAt(t + i * 0.12, {
          freq: note(392, semi),
          type: 'sine',
          dur: 2.4,
          gain: 0.07,
          attack: 0.03
        });
      });
      noiseAt(t, { from: 1500, to: 7000, dur: 1.6, gain: 0.03, q: 1 });
    }
  };

  /* ---------- Música generativa ---------- */

  const ROOTS = [220.0, 196.0, 246.94, 174.61, 261.63];

  function padAt(t0, freq, gainValue, dur) {
    const c = ensure();
    if (!c) return;
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1400 + Math.random() * 700;
    f.Q.value = 0.6;

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    [1, 1.005].forEach(function (detune) {
      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq * detune;
      osc.connect(f);
      osc.start(t0);
      osc.stop(t0 + dur + 0.1);
    });

    f.connect(g);
    g.connect(A.musicBus);
  }

  function bellAt(t0, freq) {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.025, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
    osc.connect(g);
    g.connect(A.musicBus);
    osc.start(t0);
    osc.stop(t0 + 1.9);
  }

  function scheduleMusic() {
    if (!A.playing || !A.ctx) return;
    const c = A.ctx;
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    let guard = 0;

    while (A.nextNote < c.currentTime + 0.7 && guard < 6) {
      const t = A.nextNote;
      const semi = scale[(A.step * 3 + 2) % scale.length];
      const octave = A.step % 7 === 0 ? 2 : 1;
      const freq = note(A.root, semi) * octave;

      padAt(t, freq, 0.035, 3.6);

      if (A.step % 4 === 2) {
        bellAt(t + 0.55, freq * 2);
      }

      A.step++;
      A.nextNote += 2.7 + (A.step % 3) * 0.35;
    }
  }

  function startMusic(level) {
    const c = ensure();
    if (!c) return;
    if (A.playing) stopMusic();

    A.root = ROOTS[Math.min(ROOTS.length - 1, Math.max(0, (level || 1) - 1))];
    A.step = 0;
    A.playing = true;
    A.nextNote = c.currentTime + 0.15;

    const t = c.currentTime;
    A.musicBus.gain.cancelScheduledValues(t);
    A.musicBus.gain.setTargetAtTime(0.55, t, 0.25);

    /* Zumbido de fondo: dos voces graves con filtro que respira */
    const droneGain = c.createGain();
    droneGain.gain.value = 0.0001;
    droneGain.gain.setTargetAtTime(0.055, t + 0.05, 0.8);

    const droneFilter = c.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 380;
    droneFilter.Q.value = 2.2;

    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);
    lfo.start(t);

    [0.5, 0.75].forEach(function (mult) {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = A.root * mult;
      osc.connect(droneFilter);
      osc.start(t);
      A.drone.push(osc);
    });

    droneFilter.connect(droneGain);
    droneGain.connect(A.musicBus);

    A.drone.push(lfo, droneGain);

    A.timer = setInterval(scheduleMusic, 220);
    scheduleMusic();
  }

  function stopMusic() {
    A.playing = false;
    if (A.timer) {
      clearInterval(A.timer);
      A.timer = null;
    }
    if (!A.ctx) return;

    const t = A.ctx.currentTime;
    A.musicBus.gain.cancelScheduledValues(t);
    A.musicBus.gain.setTargetAtTime(0.0001, t, 0.18);

    A.drone.forEach(function (node) {
      try {
        if (node.stop) node.stop(t + 0.8);
        if (node.disconnect) node.disconnect();
      } catch (err) { /* nodo ya detenido */ }
    });
    A.drone = [];
  }

  /* ---------- API pública ---------- */

  window.LumenAudio = {
    init: unlock,
    unlock: unlock,
    setMuted: setMuted,
    toggleMute: toggleMute,
    isMuted: function () { return A.muted; },
    play: function (name, arg) {
      if (!A.ctx || A.muted) return;
      if (sfx[name]) {
        try { sfx[name](arg); } catch (err) { /* audio no disponible */ }
      }
    },
    click: function () {
      if (!A.ctx || A.muted) return;
      try { sfx.click(); } catch (err) { /* audio no disponible */ }
    },
    startMusic: startMusic,
    stopMusic: stopMusic
  };
})();
