/* Original, gently looping campus theme. All sounds are made in the browser. */
(() => {
  const KEY = 'hcu-life-music-enabled';
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  // A sixteen-bar walk around campus: two related phrases, then a soft return home.
  const chords = [
    {pad:[60,64,67,71],bass:36}, // Cmaj7
    {pad:[59,62,67,69],bass:35}, // G6/B
    {pad:[57,60,64,67],bass:33}, // Am7
    {pad:[53,57,60,64],bass:29}, // Fmaj7
    {pad:[55,60,64,67],bass:40}, // C/E
    {pad:[57,60,64,65],bass:38}, // Dm9
    {pad:[55,60,62,65],bass:31}, // G7sus4
    {pad:[55,59,62,64],bass:31}, // G6
    {pad:[57,60,64,67],bass:33}, // Am7
    {pad:[55,59,62,64],bass:31}, // Em7/G
    {pad:[53,57,60,64],bass:29}, // Fmaj7
    {pad:[55,59,62,64],bass:31}, // G6
    {pad:[55,60,64,67],bass:40}, // C/E
    {pad:[57,60,64,67],bass:33}, // Am7
    {pad:[53,57,60,64],bass:29}, // Fmaj7
    {pad:[60,64,67,71],bass:36}  // Cmaj7
  ];
  // One entry per eighth note. Space between notes lets the story remain in front.
  const melody = [
    [76,null,79,null,74,null,72,null],
    [74,null,76,79,null,76,null,null],
    [72,null,76,null,79,null,76,null],
    [69,null,72,74,null,72,null,null],
    [67,null,72,null,76,74,null,null],
    [77,null,76,null,72,null,69,null],
    [72,null,74,null,77,74,null,null],
    [71,null,74,76,null,74,null,null],
    [76,null,79,null,81,null,79,null],
    [74,null,71,null,76,74,null,null],
    [72,null,76,77,null,76,null,null],
    [74,null,79,null,76,null,74,null],
    [76,null,79,null,74,null,72,null],
    [72,null,76,79,null,76,72,null],
    [69,null,72,null,76,74,null,null],
    [72,null,76,null,79,null,76,null]
  ];
  const eighth = 60 / 72 / 2;
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'false'; } catch {}
  let context = null;
  let master = null;
  let echo = null;
  let timer = null;
  let nextTime = 0;
  let step = 0;

  const hz = note => 440 * 2 ** ((note - 69) / 12);
  const toggles = () => document.querySelectorAll('[data-music-toggle]');

  function updateButtons() {
    toggles().forEach(button => {
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? 'ปิดเพลงประกอบ' : 'เปิดเพลงประกอบ');
      button.title = enabled ? 'ปิดเพลงประกอบ' : 'เปิดเพลงประกอบ';
      button.classList.toggle('is-muted', !enabled);
      const label = button.querySelector('.music-text');
      if (label && label.textContent !== (enabled ? 'เพลง: เปิด' : 'เพลง: ปิด')) label.textContent = enabled ? 'เพลง: เปิด' : 'เพลง: ปิด';
      const icon = button.querySelector('.music-icon');
      if (icon && icon.textContent !== (enabled ? '♫' : '♪')) icon.textContent = enabled ? '♫' : '♪';
    });
  }

  function tone(note, when, duration, volume, instrument) {
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const voices = instrument === 'pad'
      ? [['sine',1,1],['triangle',2,0.12]]
      : instrument === 'bass'
        ? [['sine',1,1],['triangle',2,0.23]]
        : [['triangle',1,0.76],['sine',1,0.34],['sine',2,0.12]];
    const attack = instrument === 'pad' ? 0.32 : instrument === 'bass' ? 0.035 : 0.012;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(instrument === 'pad' ? 1050 : instrument === 'bass' ? 600 : 1900, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(volume, when + Math.min(attack, duration * 0.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    filter.connect(gain).connect(master);
    for (const [type, harmonic, level] of voices) {
      const oscillator = context.createOscillator();
      const partial = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(hz(note) * harmonic, when);
      partial.gain.value = level;
      oscillator.connect(partial).connect(filter);
      oscillator.start(when);
      oscillator.stop(when + duration + 0.04);
    }
  }

  function playStep(index, when) {
    const bar = Math.floor(index / 8) % melody.length;
    const position = index % 8;
    const chord = chords[bar];
    if (position === 0) {
      chord.pad.forEach((note, i) => tone(note, when + i * 0.045, eighth * 7.6, 0.035, 'pad'));
      tone(chord.bass, when, eighth * 3.6, 0.13, 'bass');
    }
    if (position === 4) tone(chord.bass + 7, when, eighth * 2.6, 0.075, 'bass');
    if (position === 2 || position === 6) tone(chord.pad[position === 2 ? 1 : 2], when, eighth * 1.8, 0.029, 'keys');
    const note = melody[bar][position];
    if (note !== null) tone(note, when, eighth * (position === 6 ? 1.6 : 1.95), 0.065, 'keys');
  }

  function schedule() {
    if (!context || context.state !== 'running') return;
    while (nextTime < context.currentTime + 0.65) {
      playStep(step % (melody.length * 8), nextTime);
      nextTime += eighth;
      step++;
    }
  }

  async function start() {
    if (!enabled || !AudioContextClass || document.hidden) return;
    try {
      if (!context) {
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = 0.29;
        master.connect(context.destination);
        if (typeof context.createDelay === 'function') {
          echo = context.createDelay(0.8);
          const echoLevel = context.createGain();
          echo.delayTime.value = 0.31;
          echoLevel.gain.value = 0.14;
          master.connect(echo).connect(echoLevel).connect(context.destination);
        }
        nextTime = context.currentTime + 0.06;
        step = 0;
      }
      const activeContext = context;
      if (activeContext.state !== 'running') await activeContext.resume();
      if (!enabled || context !== activeContext || document.hidden) return;
      if (!timer) timer = setInterval(schedule, 160);
      schedule();
    } catch (error) {
      console.warn('เพลงประกอบไม่พร้อมใช้งาน', error);
    }
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (context) context.close().catch(() => {});
    context = null;
    master = null;
    echo = null;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-music-toggle]');
    if (button) {
      enabled = !enabled;
      try { localStorage.setItem(KEY, String(enabled)); } catch {}
      if (enabled) start(); else stop();
      updateButtons();
    } else {
      start(); // Browsers allow sound only after the first user gesture.
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') start();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (timer) clearInterval(timer);
      timer = null;
      const activeContext = context;
      activeContext?.suspend().then(() => {
        if (!document.hidden && enabled && context === activeContext) start();
      }).catch(() => {});
    } else if (context && enabled) {
      start();
    }
  });
  updateButtons();
  new MutationObserver(updateButtons).observe(document.getElementById('modalContent'), {childList:true});
})();
