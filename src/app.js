import {
  buildFoods,
  createFood,
  deleteFood,
  foodArt,
  parseFoods,
  randomFood,
  serializeFoods,
} from './core.js';

const STORAGE_KEY = 'dinner-slot-foods-v2';
const BGM = [
  { name: 'Last Surprise', src: 'assets/last_surprise.m4a' },
  { name: 'Wake Up Get Up Get', src: 'assets/wake_up_get_up.m4a' },
];
const $ = (id) => document.getElementById(id);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let foods = loadFoods();
let spinning = false;
let bgmIndex = 0;
let muted = false;
let ctx;

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

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
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
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

function noise(dur = 0.14, gain = 0.045) {
  if (muted) return;
  const c = audioCtx();
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2.2;
  const src = c.createBufferSource();
  const g = c.createGain();
  g.gain.value = gain;
  src.buffer = buffer;
  src.connect(g);
  g.connect(c.destination);
  src.start();
}

const sfx = {
  click() { tone(920, 0.05, 'square', 0.03, 360); },
  tick(i) { tone(420 + i * 14, 0.04, 'square', 0.028); },
  whoosh() { noise(0.28, 0.07); tone(120, 0.24, 'sawtooth', 0.035, 980); },
  warning() { tone(90, 0.32, 'sawtooth', 0.065, -28); setTimeout(() => tone(980, 0.11, 'square', 0.035), 120); },
  slash() { noise(0.12, 0.09); tone(1320, 0.09, 'sawtooth', 0.04, 680); },
  lock() { tone(120, 0.08, 'square', 0.06); setTimeout(() => tone(70, 0.18, 'sawtooth', 0.07), 80); },
  boom() { noise(0.5, 0.13); tone(58, 0.42, 'sawtooth', 0.13, -18); setTimeout(() => tone(1500, 0.1, 'triangle', 0.04, 480), 80); },
  shine() { [1500, 1900, 2400].forEach((f, i) => setTimeout(() => tone(f, 0.08, 'sine', 0.026), i * 70)); },
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
  await delay(900);
  clearInterval(inter);
  $('flash').classList.remove('go');
  $('flash').classList.add('burst');
  drawResult(final);
  setPhase("TODAY'S DESTINY");
  sfx.boom();
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
}

initBackground();
wireEvents();
renderAdmin();
drawReels([foods[5], foods[18], foods[77]]);
drawResult(foods[0]);
