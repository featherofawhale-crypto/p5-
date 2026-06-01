(function () {
  const DEFAULT_FOOD_NAMES = [
    '麻婆豆腐', '宫保鸡丁', '鱼香肉丝', '水煮牛肉', '回锅肉', '红烧肉', '糖醋里脊', '番茄炒蛋',
    '清蒸鲈鱼', '葱爆羊肉', '酸菜鱼', '辣子鸡', '地三鲜', '梅菜扣肉', '锅包肉', '白切鸡',
    '东坡肉', '小炒黄牛肉', '蚂蚁上树', '干煸四季豆', '牛肉面', '炸酱面', '热干面', '担担面',
    '阳春面', '兰州拉面', '重庆小面', '刀削面', '葱油拌面', '云吞面', '扬州炒饭', '煲仔饭',
    '卤肉饭', '黄焖鸡米饭', '咖喱鸡饭', '叉烧饭', '腊味饭', '海南鸡饭', '肥牛饭', '照烧鸡腿饭',
    '小笼包', '生煎包', '锅贴', '水饺', '烧麦', '肠粉', '肉夹馍', '煎饼果子',
    '鸡蛋灌饼', '葱油饼', '火锅', '串串香', '麻辣烫', '冒菜', '烤鱼', '烧烤',
    '铁板牛肉', '砂锅粉', '酸辣粉', '螺蛳粉', '皮蛋瘦肉粥', '海鲜粥', '鸡丝粥', '银耳羹',
    '排骨汤', '冬瓜汤', '番茄牛腩汤', '紫菜蛋花汤', '老鸭汤', '玉米排骨汤', '西兰花鸡胸肉',
    '清蒸鸡腿', '香煎三文鱼', '藜麦牛肉碗', '糙米鸡腿饭', '低脂虾仁沙拉', '番茄豆腐汤',
    '杂粮饭套餐', '无糖酸奶碗', '鸡蛋牛油果沙拉', '控糖鸡胸饭', '控糖豆腐煲', '控糖牛肉蔬菜碗',
    '控糖海鲜汤', '控糖蒸鱼套餐', '控糖蘑菇鸡腿', '控糖虾仁西兰花', '控糖番茄鸡蛋',
    '控糖糙米便当', '控糖清炒时蔬', '寿司拼盘', '刺身饭', '鳗鱼饭', '天妇罗',
    '咖喱猪排饭', '韩式拌饭', '部队锅', '越南河粉', '泰式炒河粉', '冬阴功汤',
    '烤冷面', '东北乱炖', '新疆大盘鸡', '羊肉泡馍', '胡辣汤', '桂林米粉',
    '肠旺面', '过桥米线', '潮汕牛肉丸', '潮汕砂锅粥', '帝王蟹盛宴', '和牛烧肉',
    '龙虾伊面', '佛跳墙', '烤鸭全套', '海鲜大咖', '黑松露牛排', 'SSR深夜火锅',
    '传说级烧烤', '命运之麻辣香锅',
  ];
  const RARITIES = new Set(['N', 'R', 'SR', 'SSR']);
  const HEALTH_PATTERN = /控糖|鸡胸|藜麦|糙米|沙拉|西兰花|蒸|低脂|杂粮|无糖|牛油果|豆腐|鱼|虾仁|蔬菜|时蔬/;
  const COLOR_SETS = [
    ['#f6d365', '#fda085', '#d7263d', '#151515'],
    ['#7bdff2', '#b2f7ef', '#ff5c8a', '#111827'],
    ['#f9f871', '#ffc75f', '#ff6f91', '#2b2d42'],
    ['#c1fba4', '#7bf1a8', '#ff8fab', '#101010'],
    ['#a0c4ff', '#bdb2ff', '#fb5607', '#0b090a'],
  ];
  const STORAGE_KEY = 'dinner-slot-foods-v2';
  const BGM = [
    { name: 'Last Surprise', src: 'assets/last_surprise.m4a' },
    { name: 'Wake Up Get Up Get', src: 'assets/wake_up_get_up.m4a' },
  ];
  const $ = (id) => document.getElementById(id);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, Math.round(number)));
  }
  function pickRarity(name, index = 0) {
    if (index >= DEFAULT_FOOD_NAMES.length - 10 || /^SSR/.test(name)) return 'SSR';
    const score = (name.length * 17 + index * 31) % 100;
    if (score > 93) return 'SSR';
    if (score > 78) return 'SR';
    if (score > 48) return 'R';
    return 'N';
  }
  function normalizeFood(input, fallbackId = 1) {
    const name = String(input?.name ?? '').trim() || '未命名晚餐';
    const rarity = RARITIES.has(input?.rarity) ? input.rarity : 'SSR';
    return {
      id: clamp(input?.id ?? fallbackId, 1, 999999),
      name,
      rarity,
      calories: clamp(input?.calories ?? 520, 120, 1200),
      health: clamp(input?.health ?? 60, 1, 99),
      sugarSafe: input?.sugarSafe === true || input?.sugarSafe === 'true' || input?.sugarSafe === 'on',
    };
  }
  function buildFoods(names = DEFAULT_FOOD_NAMES) {
    return names.map((name, index) => {
      const healthy = HEALTH_PATTERN.test(name);
      return normalizeFood({
        id: index + 1,
        name,
        rarity: pickRarity(name, index),
        calories: healthy ? 280 + ((index * 37) % 220) : 420 + ((index * 53) % 520),
        health: healthy ? 82 + (index % 17) : 35 + ((index * 7) % 52),
        sugarSafe: healthy || index % 9 === 0,
      });
    });
  }
  function createFood(foods, input) {
    const nextId = foods.reduce((max, food) => Math.max(max, food.id), 0) + 1;
    return [...foods, normalizeFood({ ...input, id: nextId }, nextId)];
  }
  function deleteFood(foods, id) {
    if (foods.length <= 1) return foods;
    return foods.filter((food) => food.id !== Number(id));
  }
  function randomFood(foods) {
    return foods[Math.floor(Math.random() * foods.length)] ?? foods[0];
  }
  function foodArt(food, size = 160) {
    const colors = COLOR_SETS[food.id % COLOR_SETS.length];
    const plate = food.sugarSafe ? '#ecfff8' : '#fff5f5';
    const rareStroke = food.rarity === 'SSR' ? '#ffd60a' : food.rarity === 'SR' ? '#7bdff2' : '#ffffff';
    return `
      <svg class="foodSvg" viewBox="0 0 160 160" width="${size}" height="${size}" role="img" aria-label="${food.name}">
        <defs><filter id="ink${food.id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="5" dy="5" stdDeviation="0" flood-color="#000" flood-opacity=".9"/></filter></defs>
        <rect x="8" y="10" width="140" height="136" rx="8" fill="${plate}" stroke="#111" stroke-width="6"/>
        <polygon points="16,20 148,12 132,50 38,43" fill="${colors[0]}" stroke="#111" stroke-width="4"/>
        <polygon points="24,52 84,28 142,62 98,88 32,83" fill="${colors[1]}" stroke="#111" stroke-width="4"/>
        <polygon points="34,86 98,54 132,108 56,130" fill="${colors[2]}" stroke="#111" stroke-width="4" filter="url(#ink${food.id})"/>
        <polygon points="52,43 92,36 82,78" fill="#fff" opacity=".58"/>
        <polygon points="76,90 136,72 126,122" fill="#111" opacity=".18"/>
        <circle cx="118" cy="42" r="13" fill="${rareStroke}" stroke="#111" stroke-width="4"/>
        <text x="80" y="140" text-anchor="middle" font-size="13" font-weight="900" fill="#111">LOW POLY</text>
      </svg>`;
  }
  function serializeFoods(foods) {
    return JSON.stringify(foods.map((food) => normalizeFood(food, food.id)), null, 2);
  }
  function parseFoods(json) {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) throw new Error('菜单 JSON 必须是数组');
    const foods = parsed.map((food, index) => normalizeFood(food, index + 1));
    return foods.length ? foods : buildFoods();
  }

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
}());
