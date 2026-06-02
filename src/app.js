import {
  API_STYLE_PRESETS,
  RARITY_WEIGHTS,
  buildApiGenerationRequest,
  buildFoods,
  createFood,
  deleteFood,
  extractFoodsFromApiResponse,
  foodArt,
  FOOD_ICON_OPTIONS,
  foodNameSize,
  getSoundCuePlan,
  normalizeRarityWeights,
  parseFoods,
  randomFood,
  rarityOdds,
  serializeFoods,
  sanitizeFoodPool,
} from './core.js';

const STORAGE_KEY = 'dinner-slot-foods-v2';
const API_CONFIG_KEY = 'dinner-slot-api-config-v1';
const ODDS_CONFIG_KEY = 'dinner-slot-odds-v1';
const HISTORY_KEY = 'dinner-slot-history-v1';
const DEFAULT_API_BODY = `{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "{schema}"},
    {"role": "user", "content": "Style preset: {style}\\nGenerate {count} food blind-box options. Current food pool JSON: {foodsJson}"}
  ],
  "temperature": 0.9,
  "response_format": {"type": "json_object"}
}`;
const OLD_API_BODY_RE = /Generate \{count\} dinner blind-box foods|Current menu JSON/;
const BGM = [
  { name: 'Last Surprise', src: 'assets/last_surprise.m4a' },
  { name: 'Wake Up Get Up Get', src: 'assets/wake_up_get_up.m4a' },
];
const SFX_ASSETS = {
  click: 'assets/sfx/click.wav',
  tick: 'assets/sfx/tick.wav',
  warning: 'assets/sfx/warning.wav',
  reveal: 'assets/sfx/reveal.wav',
  suspenseRise: 'assets/sfx/suspense-rise.wav',
  lockClack: 'assets/sfx/lock-clack.wav',
  rewardPop: 'assets/sfx/reward-pop.wav',
  magicHit: 'assets/sfx/magic-hit.wav',
  shineChime: 'assets/sfx/shine-chime.wav',
  jackpotFanfare: 'assets/sfx/jackpot-fanfare.wav',
};
const SFX_CREDITS = 'Additional game UI SFX: Kenney UI Audio via Calinou/kenney-ui-audio on GitHub, CC0 1.0.';
window.__FOOD_HEIST_SFX_CREDITS__ = SFX_CREDITS;
const MANGA_PANEL_LABELS = ['BENTO', 'SPICE', 'HEAT', 'LUCK', 'RARE', 'COMBO', 'KCAL', 'MENU', 'TARGET', 'DESTINY'];
const $ = (id) => document.getElementById(id);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let cursorTimer;

function pinViewport() {
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.querySelector('.screen')?.scrollTo(0, 0);
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
pinViewport();

function hideCursorSoon(ms = 1200) {
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => {
    document.body.classList.add('cursorHidden');
  }, ms);
}

function showCursorBriefly() {
  document.body.classList.remove('cursorHidden');
  hideCursorSoon();
}

let foods = loadFoods();
let rarityWeights = loadRarityWeights();
let drawHistory = loadDrawHistory();
let spinning = false;
let bgmIndex = 0;
let muted = false;
let ctx;
let masterGain;
let compressor;
let bgmFadeToken = 0;
let bgmDuckTimer;
let audioUnlocked = false;
const sampleCache = new Map();

const bgm = $('bgm');
bgm.volume = 0.18;

function userBgmVolume() {
  return Math.max(0, Math.min(1, Number($('volumeSlider').value || 18) / 100));
}

function setBgmVolume(value) {
  bgm.volume = Math.max(0, Math.min(1, value));
}

function fadeBgm(to, ms = 360, done = () => {}) {
  const token = ++bgmFadeToken;
  const start = bgm.volume;
  const target = Math.max(0, Math.min(1, to));
  const started = performance.now();
  const tick = (now) => {
    if (token !== bgmFadeToken) return;
    const progress = Math.min(1, (now - started) / ms);
    const eased = 1 - (1 - progress) ** 2;
    setBgmVolume(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
    else done();
  };
  requestAnimationFrame(tick);
}

function switchBgm({ play = true, cue = true } = {}) {
  if (BGM.length <= 1) return;
  if (cue) sfx.click();
  const shouldPlay = play && !muted;
  fadeBgm(0.02, 260, () => {
    bgmIndex = (bgmIndex + 1) % BGM.length;
    bgm.src = BGM[bgmIndex].src;
    $('bgmName').textContent = BGM[bgmIndex].name;
    bgm.load();
    if (shouldPlay) bgm.play().catch(() => {});
    fadeBgm(shouldPlay ? userBgmVolume() : 0, 420);
  });
}

function pickFood() {
  return randomFood(foods, Math.random, rarityWeights);
}

function shuffled(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function pickForeshadowFoods(count) {
  const picked = [];
  const seen = new Set();
  while (picked.length < count && seen.size < foods.length) {
    const food = pickFood();
    if (seen.has(food.name)) continue;
    seen.add(food.name);
    picked.push(food);
  }
  return picked;
}

function loadFoods() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return buildFoods();
    const parsed = sanitizeFoodPool(parseFoods(saved));
    const expanded = buildFoods();
    const existing = new Set(parsed.map((food) => food.name));
    const merged = sanitizeFoodPool([...parsed, ...expanded.filter((food) => !existing.has(food.name))]);
    localStorage.setItem(STORAGE_KEY, serializeFoods(merged));
    return merged;
  } catch {
    return buildFoods();
  }
}

function saveFoods() {
  localStorage.setItem(STORAGE_KEY, serializeFoods(foods));
}

function loadRarityWeights() {
  try {
    return normalizeRarityWeights(JSON.parse(localStorage.getItem(ODDS_CONFIG_KEY) || '{}'));
  } catch {
    return normalizeRarityWeights(RARITY_WEIGHTS);
  }
}

function saveRarityWeights() {
  localStorage.setItem(ODDS_CONFIG_KEY, JSON.stringify(rarityWeights));
}

function loadDrawHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(history) ? history.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function saveDrawHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(drawHistory.slice(0, 12)));
}

function recordDraw(food) {
  drawHistory = [{
    at: new Date().toISOString(),
    name: food.name,
    rarity: food.rarity,
    calories: food.calories,
    health: food.health,
    sugarSafe: food.sugarSafe,
  }, ...drawHistory].slice(0, 12);
  saveDrawHistory();
}

function loadApiConfig() {
  const fallback = { bodyTemplate: DEFAULT_API_BODY, responsePath: 'foods', count: 8, method: 'POST', stylePresetId: API_STYLE_PRESETS[0].id };
  try {
    const config = { ...fallback, ...JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}') };
    if (OLD_API_BODY_RE.test(config.bodyTemplate || '')) config.bodyTemplate = DEFAULT_API_BODY;
    return config;
  } catch {
    return fallback;
  }
}

function saveApiConfig(config) {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
}

function unlockAudio() {
  if (muted) return;
  audioCtx();
  preloadSamples();
  setBgmVolume(userBgmVolume());
  bgm.play()
    .then(() => {
      audioUnlocked = true;
      document.documentElement.dataset.audioUnlocked = 'true';
      delete document.documentElement.dataset.audioError;
    })
    .catch((error) => {
      document.documentElement.dataset.audioUnlocked = 'false';
      document.documentElement.dataset.audioError = error?.name || 'play-blocked';
    });
}

function audioCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.18;
    masterGain.gain.value = 0.92;
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur = 0.1, type = 'square', gain = 0.04, slide = 0) {
  if (muted) return;
  const c = audioCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(35, freq + slide), c.currentTime + dur);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g);
  g.connect(masterGain);
  o.start();
  o.stop(c.currentTime + dur);
}

function noise(dur = 0.14, gain = 0.045, filter = 0, filterType = 'bandpass') {
  if (muted) return;
  const c = audioCtx();
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2.2;
  const src = c.createBufferSource();
  const g = c.createGain();
  g.gain.value = gain;
  src.buffer = buffer;
  if (filter) {
    const biquad = c.createBiquadFilter();
    biquad.type = filterType;
    biquad.frequency.setValueAtTime(filter, c.currentTime);
    biquad.Q.value = filterType === 'bandpass' ? 1.8 : 0.8;
    src.connect(biquad);
    biquad.connect(g);
  } else {
    src.connect(g);
  }
  g.connect(masterGain);
  src.start();
}

function voiceChop({ vowel = 'ha', freq = 260, dur = 0.22, gain = 0.034, slide = 0 } = {}) {
  if (muted) return;
  const c = audioCtx();
  const o = c.createOscillator();
  const amp = c.createGain();
  const formants = {
    ha: [[760, 6, 0.88], [1320, 9, 0.58], [2600, 10, 0.28]],
    hey: [[520, 7, 0.72], [1880, 11, 0.64], [2800, 9, 0.24]],
    oh: [[430, 8, 0.9], [820, 8, 0.62], [2400, 9, 0.18]],
    wow: [[360, 7, 0.86], [900, 8, 0.62], [2200, 8, 0.24]],
  }[vowel] || [[700, 8, 0.8], [1200, 9, 0.55], [2500, 8, 0.22]];
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(60, freq + slide), c.currentTime + dur);
  amp.gain.setValueAtTime(0.0001, c.currentTime);
  amp.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.025);
  amp.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  formants.forEach(([frequency, q, mix]) => {
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, c.currentTime);
    filter.Q.value = q;
    const level = c.createGain();
    level.gain.value = mix;
    o.connect(filter);
    filter.connect(level);
    level.connect(amp);
  });
  amp.connect(masterGain);
  o.start();
  o.stop(c.currentTime + dur);
}

function playSample(name, volume = 0.32, rate = 1) {
  if (muted || !SFX_ASSETS[name]) return;
  const instance = new Audio(SFX_ASSETS[name]);
  instance.volume = volume;
  instance.playbackRate = rate;
  instance.play().catch(() => {});
}

function preloadSamples() {
  Object.entries(SFX_ASSETS).forEach(([name, src]) => {
    if (sampleCache.has(name)) return;
    const audio = new Audio(src);
    audio.preload = 'auto';
    sampleCache.set(name, audio);
  });
}

function duckMusic(amount = 0.45, ms = 680) {
  if (muted) return;
  clearTimeout(bgmDuckTimer);
  const base = userBgmVolume();
  fadeBgm(Math.max(0.04, base * amount), 120);
  bgmDuckTimer = setTimeout(() => {
    if (!muted) fadeBgm(userBgmVolume(), 320);
  }, ms);
}

function playSoundLayer(layer, offset = 0, pitchOffset = 0) {
  const run = () => {
    if (muted) return;
    if (layer.role === 'impact' && layer.band === 'mid') duckMusic(0.55, 420);
    if (layer.source === 'sample') playSample(layer.sample, layer.gain, layer.rate || 1);
    if (layer.source === 'noise') noise(layer.dur, layer.gain, layer.filter || 0, layer.filterType || 'bandpass');
    if (layer.source === 'voice') voiceChop(layer);
    if (layer.source === 'tone') {
      const freq = layer.freq + (layer.pitchStep ? pitchOffset * layer.pitchStep : 0);
      tone(freq, layer.dur, layer.wave, layer.gain, layer.slide || 0);
    }
  };
  if (offset <= 0) run();
  else setTimeout(run, offset);
}

function playLayeredCue(name, intensity = 1, options = {}) {
  if (muted) return;
  const plan = getSoundCuePlan(name, intensity);
  if (!plan.length) return;
  const preroll = options.preroll ? Math.min(0, ...plan.map((layer) => layer.at)) : 0;
  plan.forEach((layer) => playSoundLayer(layer, Math.max(0, layer.at - preroll), options.pitchOffset || 0));
  document.documentElement.dataset.soundCue = name;
  document.documentElement.dataset.soundLayers = String(plan.length);
  document.documentElement.dataset.soundRoles = [...new Set(plan.map((layer) => layer.role))].join(',');
  document.documentElement.dataset.soundBands = [...new Set(plan.map((layer) => layer.band))].join(',');
}

const sfx = {
  click() { playLayeredCue('click', 1); },
  tick(i) { playLayeredCue('tick', 0.8, { pitchOffset: i }); },
  whoosh() { playLayeredCue('whoosh', 1.1); },
  warning() { playLayeredCue('warning', 1.15); },
  suspense() { playLayeredCue('suspense', 1.1, { preroll: true }); },
  slash() { playLayeredCue('slash', 1); },
  lock() { playLayeredCue('lock', 1.1); },
  revealCharge() { playLayeredCue('reveal', 1.15, { preroll: true }); },
  shine() { playLayeredCue('shine', 1); },
  jackpot() { playLayeredCue('jackpot', 1.15); },
};

function foodHTML(food) {
  return `<div class="foodArt">${foodArt(food)}</div><div class="foodName" data-name-size="${foodNameSize(food.name)}">${food.name}</div><div class="rarity">${food.rarity}</div>`;
}

function drawReels(items) {
  items.forEach((food, i) => {
    $(`r${i}`).innerHTML = foodHTML(food);
    $(`r${i}`).closest('.reel').dataset.rarity = food.rarity;
  });
}

function sealedFood(food) {
  return { ...food, name: '???' };
}

function drawResult(food, options = {}) {
  const label = food.rarity === 'SSR' ? 'EXECUTION SSR' : food.rarity === 'SR' ? 'SUPER RARE' : food.rarity === 'R' ? 'RARE' : 'NORMAL';
  const nameSize = foodNameSize(food.name);
  const animate = options.animate !== false;
  const concealed = Boolean(options.concealed);
  const displayLabel = concealed ? '封存中' : label;
  const displayName = concealed ? '???' : food.name;
  const displayIcon = concealed ? '<div class="sealedMark">?</div>' : foodArt(food, 132);
  $('result').classList.remove('reveal');
  $('result').classList.toggle('concealed', concealed);
  $('result').dataset.rarity = food.rarity;
  $('result').innerHTML = `<div class="resultBody">
    <div class="resultFx"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="resultHead"><div class="rarityBig">${displayLabel}</div><div class="raritySignal">${concealed ? '??' : food.rarity}</div></div>
    <div class="resultStage">
      <div class="drawCard winnerCard" data-rarity="${food.rarity}" data-name-size="${concealed ? 'short' : nameSize}"><div class="cardTop">${displayLabel}</div><div class="winnerIcon" data-food-icon="${concealed ? 'sealed' : food.name}">${displayIcon}</div><div class="resultCopy"><div class="destiny">${concealed ? '答案锁定中' : '今日命运食物'}</div><div class="resultName">${displayName}</div></div></div>
    </div>
    <div class="stats"><div class="stat"><small>KCAL</small><b>${food.calories}</b></div><div class="stat"><small>HEALTH</small><b>${food.health}</b></div><div class="stat"><small>控糖</small><b>${food.sugarSafe ? 'OK' : 'NO'}</b></div></div>
  </div>`;
  if (animate) requestAnimationFrame(() => $('result').classList.add('reveal'));
}

function setPhase(text) {
  $('phase').textContent = text;
}

function cut(type, food) {
  const cutin = $('cutin');
  cutin.className = type ? 'cutin show' : 'cutin';
  if (!type) {
    cutin.innerHTML = '';
    return;
  }
  if (type === 'slash') cutin.innerHTML = '<div class="cutSlashA"></div><div class="cutSlashB"></div>';
  if (type === 'manga') {
    const labels = shuffled(MANGA_PANEL_LABELS).slice(0, 4);
    const shadows = pickForeshadowFoods(4);
    cutin.innerHTML = '<div class="manga">' + labels.map((x, i) => {
      const shadow = shadows[i] || pickFood();
      return `<div class="panel" style="animation-delay:${i * 0.1}s"><div class="panelFood">${foodArt(shadow, 150)}</div><span>${x}</span></div>`;
    }).join('') + '</div>';
  }
  if (type === 'warning') cutin.innerHTML = '<div class="black"></div><div class="redFlash"></div><div class="warningBox"><div class="warningText">WARNING</div><div class="warningSub">RARE DESTINY DETECTED</div></div>';
  if (type === 'execute') cutin.innerHTML = '<div class="execute"><span>揭晓中</span><b>答案即将公开</b></div>';
}

function firePrizeConfetti(food) {
  const confetti = window.confetti;
  if (typeof confetti !== 'function') return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const rarityPower = { N: 72, R: 108, SR: 156, SSR: 220 }[food.rarity] || 92;
  const particleCount = reduced ? Math.round(rarityPower * 0.38) : rarityPower;
  const scalar = food.rarity === 'SSR' ? 1.28 : food.rarity === 'SR' ? 1.12 : 0.96;
  const originY = window.innerWidth <= 430 ? 0.58 : 0.48;
  const colors = ['#fff', '#ffd60a', '#e60012', '#7bdff2', '#111'];
  document.documentElement.dataset.prizeConfetti = `${food.rarity}:${particleCount}`;

  confetti({ particleCount: Math.round(particleCount * 0.34), spread: 62, startVelocity: 44, scalar, origin: { x: 0.5, y: originY }, colors });
  setTimeout(() => confetti({ particleCount: Math.round(particleCount * 0.22), angle: 58, spread: 54, startVelocity: 38, scalar, origin: { x: 0.05, y: originY + 0.08 }, colors }), 90);
  setTimeout(() => confetti({ particleCount: Math.round(particleCount * 0.22), angle: 122, spread: 54, startVelocity: 38, scalar, origin: { x: 0.95, y: originY + 0.08 }, colors }), 170);
  if (!reduced && (food.rarity === 'SR' || food.rarity === 'SSR')) {
    setTimeout(() => confetti({ particleCount: Math.round(particleCount * 0.2), spread: 100, startVelocity: 26, ticks: 150, scalar: scalar * 0.9, origin: { x: 0.5, y: 0.18 }, colors }), 420);
  }
}

async function startRoll() {
  if (spinning) return;
  pinViewport();
  document.body.classList.add('cursorHidden');
  unlockAudio();
  spinning = true;
  $('rollBtn').disabled = true;
  $('rollBtn').textContent = '抽选中...';
  $('machine').classList.add('shake');
  document.querySelectorAll('.reel').forEach((node) => node.classList.add('spin'));
  $('flash').classList.add('go');
  sfx.click();
  sfx.whoosh();

  const final = pickFood();
  let tick = 0;
  const inter = setInterval(() => {
    tick += 1;
    drawReels([pickFood(), pickFood(), pickFood()]);
    if (tick % 2 === 0) sfx.tick(tick);
  }, 116);

  setPhase('SCANNING MENU');
  await delay(1200);
  setPhase('TARGET ACQUIRED');
  cut('slash');
  sfx.slash();
  await delay(1100);
  setPhase('ANALYZING CALORIES');
  cut('manga');
  sfx.slash();
  await delay(1650);
  setPhase('LOCKING DESTINY');
  cut('warning');
  $('machine').classList.add('finalCharge');
  sfx.suspense();
  sfx.warning();
  await delay(1750);
  setPhase('最终判定');
  clearInterval(inter);
  drawReels([pickFood(), sealedFood(final), pickFood()]);
  drawResult(final, { animate: false, concealed: true });
  cut('execute', final);
  document.querySelectorAll('.reel').forEach((node) => node.classList.add('locked'));
  sfx.lock();
  await delay(650);
  sfx.revealCharge();
  await delay(850);
  cut('');
  $('flash').classList.remove('go');
  $('flash').classList.add('burst');
  drawReels([pickFood(), final, pickFood()]);
  drawResult(final);
  firePrizeConfetti(final);
  pinViewport();
  recordDraw(final);
  renderHistory();
  setPhase('今日命运');
  sfx.jackpot();
  await delay(900);
  sfx.shine();
  $('flash').classList.remove('burst');
  $('machine').classList.remove('shake', 'finalCharge');
  document.querySelectorAll('.reel').forEach((node) => node.classList.remove('spin', 'locked'));
  $('rollBtn').disabled = false;
  $('rollBtn').textContent = '开始处决';
  requestAnimationFrame(pinViewport);
  hideCursorSoon(900);
  spinning = false;
}

function renderAdmin() {
  $('pool').textContent = `POOL ${foods.length}`;
  const odds = rarityOdds(foods, rarityWeights);
  $('pool').title = odds.map((item) => `${item.rarity} ${item.percent}% / ${item.count}个`).join(' · ');
  $('odds').textContent = odds.map((item) => `${item.rarity} ${item.percent}%`).join(' · ');
  $('oddsStatus').textContent = odds.map((item) => `${item.rarity}: ${item.percent}% (${item.count}个)`).join(' · ');
  $('foodList').innerHTML = foods.map((food) => `<div class="foodRow">
    <div><strong>${food.name}</strong><span>${food.rarity} · ${food.calories} kcal · HEALTH ${food.health} · 控糖 ${food.sugarSafe ? 'OK' : 'NO'}</span></div>
    <button data-delete="${food.id}">删除</button>
  </div>`).join('');
}

function initFoodIconForm() {
  $('foodIconKind').innerHTML = FOOD_ICON_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('');
}

function renderOddsForm() {
  $('oddsN').value = rarityWeights.N;
  $('oddsR').value = rarityWeights.R;
  $('oddsSR').value = rarityWeights.SR;
  $('oddsSSR').value = rarityWeights.SSR;
}

function formatHistoryTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function renderHistory() {
  $('historyList').innerHTML = drawHistory.length
    ? drawHistory.map((item) => `<div class="historyItem"><b>${item.rarity}</b><div><strong>${item.name}</strong><span>${formatHistoryTime(item.at)} · ${item.calories} kcal · HEALTH ${item.health}</span></div><small>${item.sugarSafe ? 'OK' : 'NO'}</small></div>`).join('')
    : '<div class="emptyHistory">还没有抽奖记录</div>';
}

function initApiPanel() {
  $('apiStylePreset').innerHTML = API_STYLE_PRESETS.map((preset) => `<option value="${preset.id}">${preset.name}</option>`).join('');
  const config = loadApiConfig();
  $('apiEndpoint').value = config.endpoint || '';
  $('apiMethod').value = config.method || 'POST';
  $('apiKey').value = config.apiKey || '';
  $('apiStylePreset').value = config.stylePresetId || API_STYLE_PRESETS[0].id;
  $('apiCount').value = config.count || 8;
  $('apiResponsePath').value = config.responsePath || 'foods';
  $('apiHeaders').value = config.headersJson || '';
  $('apiBody').value = config.bodyTemplate || DEFAULT_API_BODY;
}

function readApiPanel() {
  return {
    endpoint: $('apiEndpoint').value.trim(),
    method: $('apiMethod').value,
    apiKey: $('apiKey').value.trim(),
    stylePresetId: $('apiStylePreset').value,
    count: Number($('apiCount').value || 8),
    responsePath: $('apiResponsePath').value.trim() || 'foods',
    headersJson: $('apiHeaders').value.trim(),
    bodyTemplate: $('apiBody').value,
  };
}

function setApiBusy(busy) {
  $('apiReplaceBtn').disabled = busy;
  $('apiAppendBtn').disabled = busy;
  $('apiStatus').setAttribute('aria-busy', String(busy));
}

async function generateFoodsFromApi(mode) {
  const config = readApiPanel();
  saveApiConfig(config);
  if (!config.endpoint) {
    $('apiStatus').textContent = '请先填写 API URL。';
    return;
  }
  setApiBusy(true);
  try {
    $('apiStatus').textContent = '正在请求 API...';
    const request = buildApiGenerationRequest(config, foods);
    if (request.options.method === 'GET') delete request.options.body;
    const response = await fetch(request.url, request.options);
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 180)}`);
    const payload = JSON.parse(text);
    const generated = extractFoodsFromApiResponse(payload, config.responsePath);
    foods = mode === 'append' ? [...foods, ...generated.map((food, index) => ({ ...food, id: foods.length + index + 1 }))] : generated;
    saveFoods();
    renderAdmin();
    drawReels([pickFood(), pickFood(), pickFood()]);
    drawResult(foods[0], { animate: false });
    $('apiStatus').textContent = `已生成 ${generated.length} 个食物，使用预设：${request.preset.name}`;
  } catch (error) {
    $('apiStatus').textContent = `生成失败：${error.message}`;
  } finally {
    setApiBusy(false);
  }
}

function initBackground() {
  for (let i = 0; i < 34; i += 1) {
    const line = document.createElement('i');
    line.className = 'line';
    line.style.top = `${Math.random() * 100}%`;
    line.style.width = `${30 + Math.random() * 45}%`;
    line.style.transform = `rotate(${-10 + Math.random() * 20}deg)`;
    line.style.animationDelay = `${Math.random()}s`;
    $('speedlines').appendChild(line);
  }
  for (let i = 0; i < 50; i += 1) {
    const dot = document.createElement('i');
    const size = 3 + Math.random() * 9;
    dot.className = 'dot';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.animationDelay = `${Math.random() * 2}s`;
    $('particles').appendChild(dot);
  }
}

function wireEvents() {
  ['pointermove', 'mousedown', 'keydown', 'touchstart'].forEach((eventName) => {
    window.addEventListener(eventName, showCursorBriefly, { passive: true });
  });
  $('rollBtn').addEventListener('click', startRoll);
  $('muteBtn').addEventListener('click', () => {
    muted = !muted;
    bgm.muted = muted;
    $('muteBtn').textContent = muted ? '🔇' : '🔊';
    if (!muted) sfx.click();
  });
  $('bgmBtn').addEventListener('click', () => switchBgm());
  bgm.addEventListener('ended', () => switchBgm({ cue: false }));
  $('volumeSlider').addEventListener('input', (event) => {
    ++bgmFadeToken;
    setBgmVolume(Number(event.target.value) / 100);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('#adminBtn')) $('adminPanel').classList.add('open');
    if (event.target.closest('#closeAdminBtn')) $('adminPanel').classList.remove('open');
  });
  $('foodForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const addedName = $('foodName').value.trim();
    const selectedIcon = $('foodIconKind').value;
    foods = createFood(foods, {
      name: addedName,
      rarity: $('foodRarity').value,
      iconKind: selectedIcon,
      calories: $('foodCalories').value,
      health: $('foodHealth').value,
      sugarSafe: $('foodSugar').checked,
    });
    saveFoods();
    event.target.reset();
    $('foodIconKind').value = 'auto';
    $('foodFormStatus').textContent = `已加入：${addedName || foods.at(-1).name} · 图标 ${selectedIcon.toUpperCase()} · 当前菜单 ${foods.length} 个`;
    renderAdmin();
    drawReels([pickFood(), pickFood(), pickFood()]);
    drawResult(foods.at(-1), { animate: false });
  });
  $('foodList').addEventListener('click', (event) => {
    const id = event.target.dataset.delete;
    if (!id) return;
    foods = deleteFood(foods, Number(id));
    saveFoods();
    renderAdmin();
    drawReels([pickFood(), pickFood(), pickFood()]);
  });
  $('exportBtn').addEventListener('click', () => {
    $('jsonBox').value = serializeFoods(foods);
  });
  $('importBtn').addEventListener('click', () => {
    try {
      foods = parseFoods($('jsonBox').value);
      saveFoods();
      renderAdmin();
      drawReels([pickFood(), pickFood(), pickFood()]);
    } catch (error) {
      $('jsonBox').value = `导入失败：${error.message}`;
    }
  });
  $('resetBtn').addEventListener('click', () => {
    foods = buildFoods();
    saveFoods();
    renderAdmin();
    drawReels([pickFood(), pickFood(), pickFood()]);
    drawResult(foods[0], { animate: false });
  });
  $('saveOddsBtn').addEventListener('click', () => {
    rarityWeights = normalizeRarityWeights({
      N: $('oddsN').value,
      R: $('oddsR').value,
      SR: $('oddsSR').value,
      SSR: $('oddsSSR').value,
    });
    saveRarityWeights();
    renderOddsForm();
    renderAdmin();
  });
  $('resetOddsBtn').addEventListener('click', () => {
    rarityWeights = normalizeRarityWeights(RARITY_WEIGHTS);
    saveRarityWeights();
    renderOddsForm();
    renderAdmin();
  });
  $('clearHistoryBtn').addEventListener('click', () => {
    drawHistory = [];
    saveDrawHistory();
    renderHistory();
  });
  $('exportHistoryBtn').addEventListener('click', () => {
    $('jsonBox').value = JSON.stringify(drawHistory, null, 2);
  });
  $('apiReplaceBtn').addEventListener('click', () => generateFoodsFromApi('replace'));
  $('apiAppendBtn').addEventListener('click', () => generateFoodsFromApi('append'));
}

initBackground();
initFoodIconForm();
wireEvents();
initApiPanel();
document.addEventListener('pointerdown', unlockAudio, { capture: true });
document.addEventListener('touchstart', unlockAudio, { capture: true, passive: true });
renderOddsForm();
renderAdmin();
renderHistory();
drawReels([pickFood(), pickFood(), pickFood()]);
drawResult(foods[0], { animate: false });
hideCursorSoon();
