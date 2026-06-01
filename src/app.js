import {
  API_STYLE_PRESETS,
  buildApiGenerationRequest,
  buildFoods,
  createFood,
  deleteFood,
  extractFoodsFromApiResponse,
  foodArt,
  getSoundCuePlan,
  parseFoods,
  randomFood,
  serializeFoods,
} from './core.js';

const STORAGE_KEY = 'dinner-slot-foods-v2';
const API_CONFIG_KEY = 'dinner-slot-api-config-v1';
const DEFAULT_API_BODY = `{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "{schema}"},
    {"role": "user", "content": "Style preset: {style}\\nGenerate {count} dinner blind-box foods. Current menu JSON: {foodsJson}"}
  ],
  "temperature": 0.9,
  "response_format": {"type": "json_object"}
}`;
const BGM = [
  { name: 'Last Surprise', src: 'assets/last_surprise.m4a' },
  { name: 'Wake Up Get Up Get', src: 'assets/wake_up_get_up.m4a' },
];
const SFX_ASSETS = {
  click: 'assets/sfx/click.wav',
  tick: 'assets/sfx/tick.wav',
  warning: 'assets/sfx/warning.wav',
  reveal: 'assets/sfx/reveal.wav',
};
const $ = (id) => document.getElementById(id);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let foods = loadFoods();
let spinning = false;
let bgmIndex = 0;
let muted = false;
let ctx;
let masterGain;
let compressor;
const sampleCache = new Map();

const bgm = $('bgm');
bgm.volume = 0.18;

function loadFoods() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseFoods(saved) : buildFoods();
  } catch {
    return buildFoods();
  }
}

function saveFoods() {
  localStorage.setItem(STORAGE_KEY, serializeFoods(foods));
}

function loadApiConfig() {
  try {
    return { bodyTemplate: DEFAULT_API_BODY, responsePath: 'foods', count: 8, method: 'POST', stylePresetId: API_STYLE_PRESETS[0].id, ...JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}') };
  } catch {
    return { bodyTemplate: DEFAULT_API_BODY, responsePath: 'foods', count: 8, method: 'POST', stylePresetId: API_STYLE_PRESETS[0].id };
  }
}

function saveApiConfig(config) {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
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

function playSample(name, volume = 0.32, rate = 1) {
  if (muted || !SFX_ASSETS[name]) return;
  let audio = sampleCache.get(name);
  if (!audio) {
    audio = new Audio(SFX_ASSETS[name]);
    audio.preload = 'auto';
    sampleCache.set(name, audio);
  }
  const instance = audio.cloneNode();
  instance.volume = volume;
  instance.playbackRate = rate;
  instance.play().catch(() => {});
}

function duckMusic(amount = 0.45, ms = 680) {
  if (muted) return;
  const base = Number($('volumeSlider').value || 18) / 100;
  bgm.volume = Math.max(0.05, base * amount);
  setTimeout(() => {
    if (!muted) bgm.volume = base;
  }, ms);
}

function playSoundLayer(layer, offset = 0, pitchOffset = 0) {
  const run = () => {
    if (muted) return;
    if (layer.role === 'impact' && layer.band === 'mid') duckMusic(0.55, 420);
    if (layer.source === 'sample') playSample(layer.sample, layer.gain, layer.rate || 1);
    if (layer.source === 'noise') noise(layer.dur, layer.gain, layer.filter || 0, layer.filterType || 'bandpass');
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
  slash() { playLayeredCue('slash', 1); },
  lock() { playLayeredCue('lock', 1.1); },
  revealCharge() { playLayeredCue('reveal', 1.15, { preroll: true }); },
  shine() { playLayeredCue('shine', 1); },
};

function foodHTML(food) {
  return `<div class="foodArt">${foodArt(food)}</div><div class="foodName">${food.name}</div><div class="rarity">${food.rarity}</div>`;
}

function drawReels(items) {
  items.forEach((food, i) => {
    $(`r${i}`).innerHTML = foodHTML(food);
  });
}

function drawResult(food) {
  const label = food.rarity === 'SSR' ? 'EXECUTION SSR' : food.rarity === 'SR' ? 'SUPER RARE' : food.rarity === 'R' ? 'RARE' : 'NORMAL';
  $('result').classList.remove('reveal');
  $('result').innerHTML = `<div class="resultBody">
    <div class="resultHead"><div class="rarityBig">${label}</div><div style="color:#e60012;font-size:28px">⌖</div></div>
    <div class="mainFood"><div class="foodArt">${foodArt(food, 132)}</div><div><div class="destiny">TODAY'S DESTINY</div><div class="resultName">${food.name}</div></div></div>
    <div class="stats"><div class="stat"><small>KCAL</small><b>${food.calories}</b></div><div class="stat"><small>HEALTH</small><b>${food.health}</b></div><div class="stat"><small>控糖</small><b>${food.sugarSafe ? 'OK' : 'NO'}</b></div></div>
  </div>`;
  requestAnimationFrame(() => $('result').classList.add('reveal'));
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
  if (type === 'manga') cutin.innerHTML = '<div class="manga">' + ['TARGET', 'MENU', 'CALORIE', 'DESTINY'].map((x, i) => `<div class="panel" style="animation-delay:${i * 0.1}s">${x}</div>`).join('') + '</div>';
  if (type === 'warning') cutin.innerHTML = '<div class="black"></div><div class="redFlash"></div><div class="warningBox"><div class="warningText">WARNING</div><div class="warningSub">RARE DESTINY DETECTED</div></div>';
  if (type === 'execute') cutin.innerHTML = `<div class="execute">EXECUTE<br><span class="executeSub">${food.name}</span></div>`;
}

async function startRoll() {
  if (spinning) return;
  audioCtx();
  bgm.play().catch(() => {});
  spinning = true;
  $('rollBtn').disabled = true;
  $('rollBtn').textContent = 'EXECUTING...';
  $('machine').classList.add('shake');
  document.querySelectorAll('.reel').forEach((node) => node.classList.add('spin'));
  $('flash').classList.add('go');
  sfx.click();
  sfx.whoosh();

  const final = randomFood(foods);
  let tick = 0;
  const inter = setInterval(() => {
    tick += 1;
    drawReels([randomFood(foods), randomFood(foods), randomFood(foods)]);
    if (tick % 2 === 0) sfx.tick(tick);
  }, 92);

  setPhase('SCANNING MENU');
  await delay(900);
  setPhase('TARGET ACQUIRED');
  cut('slash');
  sfx.slash();
  await delay(900);
  setPhase('ANALYZING CALORIES');
  cut('manga');
  sfx.slash();
  await delay(1200);
  setPhase('LOCKING DESTINY');
  cut('warning');
  $('machine').classList.add('finalCharge');
  sfx.warning();
  await delay(1300);
  setPhase('FINAL JUDGEMENT');
  cut('execute', final);
  drawReels([randomFood(foods), final, randomFood(foods)]);
  document.querySelectorAll('.reel').forEach((node) => node.classList.add('locked'));
  sfx.lock();
  await delay(380);
  clearInterval(inter);
  sfx.revealCharge();
  await delay(520);
  $('flash').classList.remove('go');
  $('flash').classList.add('burst');
  drawResult(final);
  setPhase("TODAY'S DESTINY");
  await delay(620);
  cut('');
  sfx.shine();
  $('flash').classList.remove('burst');
  $('machine').classList.remove('shake', 'finalCharge');
  document.querySelectorAll('.reel').forEach((node) => node.classList.remove('spin', 'locked'));
  $('rollBtn').disabled = false;
  $('rollBtn').textContent = '开始处决';
  spinning = false;
}

function renderAdmin() {
  $('pool').textContent = `POOL ${foods.length}`;
  $('foodList').innerHTML = foods.map((food) => `<div class="foodRow">
    <div><strong>${food.name}</strong><span>${food.rarity} · ${food.calories} kcal · HEALTH ${food.health} · 控糖 ${food.sugarSafe ? 'OK' : 'NO'}</span></div>
    <button data-delete="${food.id}">删除</button>
  </div>`).join('');
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

async function generateFoodsFromApi(mode) {
  const config = readApiPanel();
  saveApiConfig(config);
  if (!config.endpoint) {
    $('apiStatus').textContent = '请先填写 API URL。';
    return;
  }
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
    drawReels([randomFood(foods), randomFood(foods), randomFood(foods)]);
    drawResult(foods[0]);
    $('apiStatus').textContent = `已生成 ${generated.length} 个食物，使用预设：${request.preset.name}`;
  } catch (error) {
    $('apiStatus').textContent = `生成失败：${error.message}`;
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
  $('rollBtn').addEventListener('click', startRoll);
  $('muteBtn').addEventListener('click', () => {
    muted = !muted;
    bgm.muted = muted;
    $('muteBtn').textContent = muted ? '🔇' : '🔊';
    if (!muted) sfx.click();
  });
  $('bgmBtn').addEventListener('click', () => {
    sfx.click();
    bgmIndex = (bgmIndex + 1) % BGM.length;
    bgm.src = BGM[bgmIndex].src;
    $('bgmName').textContent = BGM[bgmIndex].name;
    bgm.play().catch(() => {});
  });
  $('volumeSlider').addEventListener('input', (event) => {
    bgm.volume = Number(event.target.value) / 100;
  });
  $('adminBtn').addEventListener('click', () => $('adminPanel').classList.add('open'));
  $('closeAdminBtn').addEventListener('click', () => $('adminPanel').classList.remove('open'));
  $('foodForm').addEventListener('submit', (event) => {
    event.preventDefault();
    foods = createFood(foods, {
      name: $('foodName').value,
      rarity: $('foodRarity').value,
      calories: $('foodCalories').value,
      health: $('foodHealth').value,
      sugarSafe: $('foodSugar').checked,
    });
    saveFoods();
    event.target.reset();
    renderAdmin();
  });
  $('foodList').addEventListener('click', (event) => {
    const id = event.target.dataset.delete;
    if (!id) return;
    foods = deleteFood(foods, Number(id));
    saveFoods();
    renderAdmin();
    drawReels([randomFood(foods), randomFood(foods), randomFood(foods)]);
  });
  $('exportBtn').addEventListener('click', () => {
    $('jsonBox').value = serializeFoods(foods);
  });
  $('importBtn').addEventListener('click', () => {
    try {
      foods = parseFoods($('jsonBox').value);
      saveFoods();
      renderAdmin();
      drawReels([randomFood(foods), randomFood(foods), randomFood(foods)]);
    } catch (error) {
      $('jsonBox').value = `导入失败：${error.message}`;
    }
  });
  $('resetBtn').addEventListener('click', () => {
    foods = buildFoods();
    saveFoods();
    renderAdmin();
    drawReels([randomFood(foods), randomFood(foods), randomFood(foods)]);
    drawResult(foods[0]);
  });
  $('apiReplaceBtn').addEventListener('click', () => generateFoodsFromApi('replace'));
  $('apiAppendBtn').addEventListener('click', () => generateFoodsFromApi('append'));
}

initBackground();
wireEvents();
initApiPanel();
renderAdmin();
drawReels([foods[20], foods[43], foods[8]]);
drawResult(foods[0]);
