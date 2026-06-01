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
  const SFX_ASSETS = {
    click: 'assets/sfx/click.wav',
    tick: 'assets/sfx/tick.wav',
    warning: 'assets/sfx/warning.wav',
    reveal: 'assets/sfx/reveal.wav',
  };
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
  function classifyFood(name) {
    if (/面|粉|米线|河粉|拉面|热干|担担|云吞/.test(name)) return 'noodle';
    if (/饭|粥|煲仔|卤肉|炒饭|便当|碗/.test(name)) return 'rice';
    if (/饺|包|烧麦|锅贴|肠粉|肉夹馍|饼/.test(name)) return 'dumpling';
    if (/鱼|鲈|三文|海鲜|虾|蟹|龙虾|刺身|鳗/.test(name)) return 'fish';
    if (/火锅|汤|锅|麻辣烫|冒菜|羹|佛跳墙/.test(name)) return 'hotpot';
    if (/烧烤|烤|串|羊肉|牛排|和牛|鸡腿|鸡翅/.test(name)) return 'skewer';
    if (/豆腐|豆皮|豆干/.test(name)) return 'tofu';
    if (/肉|鸡|牛|羊|猪|排|鸭|叉烧|里脊|扣肉|黄焖/.test(name)) return 'meat';
    if (/沙拉|西兰花|牛油果|时蔬/.test(name)) return 'salad';
    return 'plate';
  }
  function foodShape(kind, colors) {
    if (kind === 'noodle') {
      return `<ellipse cx="80" cy="98" rx="48" ry="25" fill="#fff3c4" stroke="#111" stroke-width="6"/>
        <path d="M38 82 C58 61,92 108,122 78" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/>
        <path d="M42 91 C64 72,92 112,120 88" fill="none" stroke="${colors[0]}" stroke-width="8" stroke-linecap="round"/>
        <polygon points="112,40 125,45 57,109 45,104" fill="#2b160d" stroke="#111" stroke-width="3"/>
        <polygon points="121,51 134,56 67,120 55,115" fill="#2b160d" stroke="#111" stroke-width="3"/>`;
    }
    if (kind === 'rice') {
      return `<polygon points="36,78 124,78 108,125 52,125" fill="#2b2d42" stroke="#111" stroke-width="6"/>
        <polygon points="45,56 73,38 115,61 124,82 36,82" fill="#ffffff" stroke="#111" stroke-width="5"/>
        <polygon points="59,61 79,48 92,67 70,78" fill="#ffd60a" stroke="#111" stroke-width="3"/>
        <polygon points="87,58 110,66 100,86 76,78" fill="${colors[2]}" stroke="#111" stroke-width="3"/>`;
    }
    if (kind === 'dumpling') {
      return `<polygon points="30,99 48,70 78,58 112,68 132,100 109,119 52,118" fill="#fff7dd" stroke="#111" stroke-width="6"/>
        <path d="M48 72 L56 103 M66 63 L70 108 M84 60 L84 111 M102 65 L98 108 M118 78 L108 108" stroke="#111" stroke-width="4"/>
        <polygon points="49,94 72,82 95,94 82,107 58,107" fill="${colors[1]}" opacity=".72"/>`;
    }
    if (kind === 'fish') {
      return `<polygon points="30,86 56,58 105,58 130,82 105,108 55,110" fill="${colors[1]}" stroke="#111" stroke-width="6"/>
        <polygon points="112,82 140,58 136,106" fill="${colors[2]}" stroke="#111" stroke-width="5"/>
        <circle cx="58" cy="78" r="6" fill="#111"/>
        <polygon points="75,44 96,60 66,65" fill="#ffd60a" stroke="#111" stroke-width="4"/>
        <path d="M54 94 C75 84,98 87,118 96" fill="none" stroke="#111" stroke-width="4"/>`;
    }
    if (kind === 'hotpot') {
      return `<polygon points="30,78 130,78 116,125 44,125" fill="#2b2d42" stroke="#111" stroke-width="6"/>
        <polygon points="42,54 118,54 130,80 30,80" fill="#e60012" stroke="#111" stroke-width="5"/>
        <polygon points="51,64 72,49 87,72 62,82" fill="#7bf1a8" stroke="#111" stroke-width="3"/>
        <polygon points="83,63 110,50 119,75 92,84" fill="#ffd60a" stroke="#111" stroke-width="3"/>
        <path d="M56 45 C49 31,69 30,62 18 M85 44 C77 30,99 30,91 17 M111 46 C103 31,123 31,116 19" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
    }
    if (kind === 'skewer') {
      return `<polygon points="35,118 127,34 132,40 41,124" fill="#3a1d0f" stroke="#111" stroke-width="3"/>
        <polygon points="47,91 65,70 84,86 62,106" fill="${colors[2]}" stroke="#111" stroke-width="5"/>
        <polygon points="70,70 89,49 108,64 86,86" fill="#ffd60a" stroke="#111" stroke-width="5"/>
        <polygon points="91,50 111,30 130,46 107,68" fill="${colors[0]}" stroke="#111" stroke-width="5"/>
        <path d="M43 107 L33 124 M75 82 L63 101 M104 56 L93 74" stroke="#fff" stroke-width="4"/>`;
    }
    if (kind === 'salad') {
      return `<ellipse cx="80" cy="103" rx="48" ry="24" fill="#ecfff8" stroke="#111" stroke-width="6"/>
        <polygon points="38,86 62,52 78,90" fill="#4ade80" stroke="#111" stroke-width="4"/>
        <polygon points="68,82 91,45 109,90" fill="#22c55e" stroke="#111" stroke-width="4"/>
        <polygon points="93,83 122,61 120,103" fill="#84cc16" stroke="#111" stroke-width="4"/>
        <circle cx="73" cy="84" r="10" fill="#ff6f91" stroke="#111" stroke-width="4"/>`;
    }
    if (kind === 'meat') {
      return `<ellipse cx="80" cy="111" rx="52" ry="18" fill="#fff7dd" stroke="#111" stroke-width="6"/>
        <polygon points="38,83 63,59 91,69 78,101 48,106" fill="#8b1e1e" stroke="#111" stroke-width="5"/>
        <polygon points="78,73 110,56 130,78 111,109 82,101" fill="#b91c1c" stroke="#111" stroke-width="5"/>
        <polygon points="58,70 74,63 67,86 48,94" fill="#ffd7a8" stroke="#111" stroke-width="3"/>
        <polygon points="96,67 116,73 104,92 85,95" fill="#ffb703" stroke="#111" stroke-width="3"/>`;
    }
    if (kind === 'tofu') {
      return `<ellipse cx="80" cy="112" rx="50" ry="18" fill="#fff" stroke="#111" stroke-width="6"/>
        <rect x="38" y="67" width="34" height="30" rx="4" fill="#fff4bf" stroke="#111" stroke-width="5" transform="rotate(-9 55 82)"/>
        <rect x="73" y="54" width="36" height="33" rx="4" fill="#fff7d6" stroke="#111" stroke-width="5" transform="rotate(8 91 70)"/>
        <rect x="91" y="84" width="35" height="28" rx="4" fill="#ffe8a3" stroke="#111" stroke-width="5" transform="rotate(-4 108 98)"/>
        <polygon points="47,101 76,84 117,99 88,119" fill="#e60012" opacity=".82" stroke="#111" stroke-width="3"/>`;
    }
    return `<polygon points="52,79 76,62 107,74 116,102 82,118 45,102" fill="${colors[2]}" stroke="#111" stroke-width="4"/>
      <polygon points="104,40 125,49 112,66 91,57" fill="#ffd60a" stroke="#111" stroke-width="3"/>
      <ellipse cx="80" cy="108" rx="50" ry="19" fill="#fff" stroke="#111" stroke-width="6"/>`;
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
    const kind = classifyFood(food.name);
    return `
      <svg class="foodSvg" data-food-kind="${kind}" viewBox="0 0 160 160" width="${size}" height="${size}" role="img" aria-label="${food.name}">
        <defs><filter id="ink${food.id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="5" dy="5" stdDeviation="0" flood-color="#000" flood-opacity=".9"/></filter></defs>
        <rect x="8" y="10" width="140" height="136" rx="8" fill="${plate}" stroke="#111" stroke-width="6"/>
        <polygon points="16,20 148,12 132,50 38,43" fill="${colors[0]}" stroke="#111" stroke-width="4"/>
        <g filter="url(#ink${food.id})">${foodShape(kind, colors)}</g>
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
  function playSample(name, volume = 0.32) {
    if (muted || !SFX_ASSETS[name]) return;
    let audio = sampleCache.get(name);
    if (!audio) {
      audio = new Audio(SFX_ASSETS[name]);
      audio.preload = 'auto';
      sampleCache.set(name, audio);
    }
    const instance = audio.cloneNode();
    instance.volume = volume;
    instance.play().catch(() => {});
  }
  const sfx = {
    click() { playSample('click', 0.34); tone(920, 0.05, 'square', 0.025, 360); },
    tick(i) { playSample('tick', 0.18); tone(420 + i * 14, 0.035, 'square', 0.016); },
    whoosh() { noise(0.28, 0.07); tone(120, 0.24, 'sawtooth', 0.035, 980); },
    warning() { playSample('warning', 0.42); tone(90, 0.32, 'sawtooth', 0.05, -28); setTimeout(() => tone(980, 0.11, 'square', 0.026), 120); },
    slash() { noise(0.12, 0.09); tone(1320, 0.09, 'sawtooth', 0.04, 680); },
    lock() { tone(120, 0.08, 'square', 0.06); setTimeout(() => tone(70, 0.18, 'sawtooth', 0.07), 80); },
    boom() { playSample('reveal', 0.52); noise(0.5, 0.1); tone(58, 0.42, 'sawtooth', 0.1, -18); setTimeout(() => tone(1500, 0.1, 'triangle', 0.035, 480), 80); },
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
  drawReels([foods[20], foods[43], foods[8]]);
  drawResult(foods[0]);
}());
