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
    '龙虾伊面', '佛跳墙', '烤鸭全套', '海鲜大咖', '黑松露牛排', '深夜火锅',
    '炭火烧烤', '麻辣香锅',
  ];
  const EXTRA_FOOD_NAMES = [
    '脆皮烤鸭', '蒜香排骨', '椒麻鸡', '葱爆牛肉', '黑椒牛柳', '番茄牛腩', '剁椒鱼头', '糖醋鲤鱼',
    '酸汤肥牛', '毛血旺', '水煮鱼片', '干锅花菜', '干锅牛蛙', '香辣蟹', '油焖大虾', '蒜蓉粉丝扇贝',
    '蚝油生菜', '虎皮青椒', '鱼香肉丝', '宫保鸡丁', '回锅肉', '京酱肉丝', '小炒肉', '辣椒炒肉',
    '照烧鸡排饭', '鳗鱼饭', '牛肉盖浇饭', '日式咖喱饭', '肥牛丼', '亲子丼', '叉烧拉面', '豚骨拉面',
    '海鲜乌冬', '牛肉河粉', '螺蛳粉', '桂林米粉', '过桥米线', '重庆酸辣粉', '羊肉泡馍', '肉夹馍套餐',
    '虾仁云吞面', '鲜肉小笼包', '蟹黄汤包', '生煎包', '韭菜盒子', '锅贴拼盘', '三鲜水饺', '红油抄手',
    '广式肠粉', '牛肉烧麦', '煎饼果子', '鸡蛋灌饼', '麻辣香锅', '番茄火锅', '菌汤火锅', '椰子鸡火锅',
    '潮汕牛肉火锅', '韩式部队锅', '冬阴功海鲜锅', '砂锅鱼头', '砂锅排骨', '砂锅鸡煲', '铁板鱿鱼',
    '铁板豆腐', '烤羊肉串', '烤五花肉', '烤鸡翅', '炭烤牛排', '芝士焗饭', '芝士年糕', '韩式拌饭',
    '越南春卷', '越南牛肉粉', '泰式绿咖喱', '泰式打抛猪', '海南椰奶鸡饭', '新加坡叻沙', '马来炒粿条',
    '印度黄油鸡', '咖喱牛腩', '墨西哥卷饼', '意式肉酱面', '奶油蘑菇意面', '玛格丽特披萨', '海鲜披萨',
    '凯撒沙拉', '金枪鱼沙拉', '鸡胸藜麦碗', '牛油果虾仁沙拉', '照烧三文鱼', '香煎鳕鱼', '清炒时蔬',
    '蒜蓉西兰花', '番茄炒蛋', '紫菜蛋花汤', '玉米排骨汤', '老鸭粉丝汤', '皮蛋瘦肉粥', '南瓜小米粥',
    '番茄牛肉烩饭', '香菇滑鸡饭', '青椒肉丝盖饭', '脆皮炸鸡饭', '芝士牛肉焗饭', '鳗鱼寿司卷', '三文鱼刺身', '寿喜烧',
  ];
  const FOOD_POOL_NAMES = [...DEFAULT_FOOD_NAMES, ...EXTRA_FOOD_NAMES];
  const RARITIES = new Set(['N', 'R', 'SR', 'SSR']);
  const RARITY_WEIGHTS = { N: 54, R: 30, SR: 12, SSR: 4 };
  const RARITY_ORDER = ['N', 'R', 'SR', 'SSR'];
  const FOOD_ICON_OPTIONS = [
    { value: 'auto', label: '自动识别' },
    { value: 'noodle', label: '面条 / 米粉' },
    { value: 'rice', label: '米饭 / 盖饭' },
    { value: 'dumpling', label: '饺子 / 包子' },
    { value: 'fish', label: '鱼类 / 海鲜' },
    { value: 'hotpot', label: '火锅 / 汤锅' },
    { value: 'skewer', label: '串串 / 烧烤' },
    { value: 'meat', label: '肉类 / 牛排' },
    { value: 'tofu', label: '豆腐 / 奶制品' },
    { value: 'salad', label: '沙拉 / 蔬菜' },
    { value: 'pizza', label: '披萨' },
    { value: 'burger', label: '汉堡' },
    { value: 'curry', label: '咖喱 / 炖饭' },
    { value: 'sushi', label: '寿司 / 刺身' },
    { value: 'wrap', label: '卷饼 / 春卷' },
    { value: 'shrimp', label: '虾 / 炸物' },
    { value: 'bread', label: '面包 / 烘焙' },
    { value: 'plate', label: '通用餐盘' },
  ];
  const FOOD_ICON_KINDS = new Set(FOOD_ICON_OPTIONS.map((item) => item.value).filter((value) => value !== 'auto'));
  const HEALTH_PATTERN = /控糖|鸡胸|藜麦|糙米|沙拉|西兰花|蒸|低脂|杂粮|无糖|牛油果|豆腐|鱼|虾仁|蔬菜|时蔬/;
  const COLOR_SETS = [
    ['#f6d365', '#fda085', '#d7263d', '#151515'],
    ['#7bdff2', '#b2f7ef', '#ff5c8a', '#111827'],
    ['#f9f871', '#ffc75f', '#ff6f91', '#2b2d42'],
    ['#c1fba4', '#7bf1a8', '#ff8fab', '#101010'],
    ['#a0c4ff', '#bdb2ff', '#fb5607', '#0b090a'],
  ];
  const STORAGE_KEY = 'dinner-slot-foods-v2';
  const API_CONFIG_KEY = 'dinner-slot-api-config-v1';
  const ODDS_CONFIG_KEY = 'dinner-slot-odds-v1';
  const HISTORY_KEY = 'dinner-slot-history-v1';
  const API_STYLE_PRESETS = [
    { id: 'low-poly-comic', name: '低多边形美漫', prompt: 'low-poly American comic food illustration, bold black ink, angular facets, dramatic red white black palette, readable food silhouette' },
    { id: 'persona-punk', name: '怪盗红黑冲击', prompt: 'stylish phantom-thief game UI food concept, red black white, sharp diagonal composition, high contrast, dramatic reveal card' },
    { id: 'pixel-arcade', name: '像素街机', prompt: '16-bit arcade food icons, punchy colors, crisp silhouette, game item style, readable at small size' },
    { id: 'manga-bento', name: '漫画便当', prompt: 'Japanese manga bento food illustration, thick ink lines, screentone texture, expressive comic impact, clear dish identity' },
  ];
  const SOUND_CUE_RECIPES = {
    click: [
      { at: 0, role: 'impact', band: 'mid', source: 'sample', sample: 'click', gain: 0.32 },
      { at: 10, role: 'sparkle', band: 'high', source: 'tone', freq: 920, dur: 0.05, wave: 'square', gain: 0.024, slide: 360 },
    ],
    tick: [
      { at: 0, role: 'impact', band: 'mid', source: 'sample', sample: 'tick', gain: 0.16 },
      { at: 8, role: 'sparkle', band: 'high', source: 'tone', freq: 520, dur: 0.035, wave: 'square', gain: 0.014, pitchStep: 14 },
  ],
    whoosh: [
      { at: -145, role: 'riser', band: 'mid', source: 'sample', sample: 'suspenseRise', gain: 0.2, rate: 1.08 },
      { at: -120, role: 'riser', band: 'mid', source: 'noise', dur: 0.48, gain: 0.058, filter: 760, filterType: 'bandpass' },
      { at: -20, role: 'riser', band: 'low', source: 'tone', freq: 82, dur: 0.44, wave: 'sawtooth', gain: 0.034, slide: 1080 },
      { at: 110, role: 'sparkle', band: 'high', source: 'tone', freq: 1520, dur: 0.08, wave: 'triangle', gain: 0.022, slide: 620 },
  ],
    slash: [
      { at: -45, role: 'riser', band: 'high', source: 'noise', dur: 0.16, gain: 0.072 },
      { at: 0, role: 'impact', band: 'mid', source: 'tone', freq: 1320, dur: 0.08, wave: 'sawtooth', gain: 0.034, slide: 680 },
      { at: 60, role: 'tail', band: 'high', source: 'tone', freq: 2400, dur: 0.08, wave: 'triangle', gain: 0.016 },
    ],
    warning: [
      { at: -220, role: 'riser', band: 'mid', source: 'tone', freq: 180, dur: 0.28, wave: 'sawtooth', gain: 0.022, slide: 520 },
      { at: -90, role: 'riser', band: 'mid', source: 'sample', sample: 'magicHit', gain: 0.36, rate: 0.72 },
      { at: 0, role: 'impact', band: 'mid', source: 'sample', sample: 'warning', gain: 0.08 },
    { at: 35, role: 'voice', band: 'mid', source: 'voice', vowel: 'oh', freq: 180, dur: 0.24, gain: 0.036, slide: -18 },
    { at: 0, role: 'sub', band: 'low', source: 'tone', freq: 86, dur: 0.42, wave: 'sawtooth', gain: 0.046, slide: -24 },
      { at: 150, role: 'sparkle', band: 'high', source: 'tone', freq: 980, dur: 0.11, wave: 'square', gain: 0.026 },
    { at: 430, role: 'sparkle', band: 'high', source: 'tone', freq: 740, dur: 0.09, wave: 'square', gain: 0.018 },
  ],
    suspense: [
      { at: -420, role: 'riser', band: 'mid', source: 'sample', sample: 'suspenseRise', gain: 0.42, rate: 0.82 },
      { at: -360, role: 'riser', band: 'low', source: 'tone', freq: 72, dur: 0.46, wave: 'sawtooth', gain: 0.05, slide: 38 },
    { at: -240, role: 'riser', band: 'mid', source: 'noise', dur: 0.54, gain: 0.038, filter: 420, filterType: 'bandpass' },
    { at: 0, role: 'impact', band: 'low', source: 'tone', freq: 96, dur: 0.12, wave: 'triangle', gain: 0.038 },
    { at: 150, role: 'tail', band: 'mid', source: 'tone', freq: 144, dur: 0.18, wave: 'sine', gain: 0.026 },
  ],
    lock: [
      { at: -40, role: 'riser', band: 'mid', source: 'noise', dur: 0.12, gain: 0.035 },
      { at: -8, role: 'impact', band: 'mid', source: 'sample', sample: 'lockClack', gain: 0.46, rate: 0.95 },
      { at: 0, role: 'impact', band: 'low', source: 'tone', freq: 118, dur: 0.08, wave: 'square', gain: 0.056 },
      { at: 82, role: 'sub', band: 'low', source: 'tone', freq: 68, dur: 0.2, wave: 'sawtooth', gain: 0.064 },
      { at: 130, role: 'tail', band: 'mid', source: 'sample', sample: 'click', gain: 0.14 },
  ],
    reveal: [
      { at: -680, role: 'riser', band: 'mid', source: 'noise', dur: 0.86, gain: 0.045, filter: 620, filterType: 'bandpass' },
      { at: -560, role: 'riser', band: 'mid', source: 'sample', sample: 'suspenseRise', gain: 0.42, rate: 0.72 },
      { at: -420, role: 'riser', band: 'high', source: 'tone', freq: 360, dur: 0.5, wave: 'sawtooth', gain: 0.026, slide: 1560 },
    { at: -90, role: 'impact', band: 'mid', source: 'sample', sample: 'tick', gain: 0.18, rate: 0.72 },
    { at: -55, role: 'voice', band: 'mid', source: 'voice', vowel: 'hey', freq: 260, dur: 0.2, gain: 0.032, slide: 72 },
      { at: 0, role: 'sub', band: 'low', source: 'tone', freq: 48, dur: 0.62, wave: 'sawtooth', gain: 0.12, slide: -14 },
      { at: 0, role: 'impact', band: 'mid', source: 'sample', sample: 'reveal', gain: 0.14 },
      { at: 32, role: 'impact', band: 'mid', source: 'sample', sample: 'rewardPop', gain: 0.58, rate: 1.08 },
    { at: 18, role: 'impact', band: 'mid', source: 'noise', dur: 0.5, gain: 0.09, filter: 900, filterType: 'lowpass' },
    { at: 58, role: 'voice', band: 'mid', source: 'voice', vowel: 'ha', freq: 330, dur: 0.22, gain: 0.038, slide: 96 },
    { at: 82, role: 'sparkle', band: 'high', source: 'tone', freq: 1450, dur: 0.12, wave: 'triangle', gain: 0.044, slide: 720 },
    { at: 230, role: 'sparkle', band: 'high', source: 'tone', freq: 2250, dur: 0.09, wave: 'sine', gain: 0.03 },
    { at: 380, role: 'sparkle', band: 'high', source: 'tone', freq: 2850, dur: 0.08, wave: 'sine', gain: 0.022 },
    { at: 610, role: 'tail', band: 'mid', source: 'tone', freq: 760, dur: 0.34, wave: 'sine', gain: 0.022, slide: -260 },
  ],
    shine: [
      { at: -12, role: 'sparkle', band: 'high', source: 'sample', sample: 'shineChime', gain: 0.42, rate: 1.12 },
      { at: 0, role: 'sparkle', band: 'high', source: 'tone', freq: 1500, dur: 0.08, wave: 'sine', gain: 0.024 },
      { at: 70, role: 'sparkle', band: 'high', source: 'tone', freq: 1900, dur: 0.08, wave: 'sine', gain: 0.022 },
      { at: 140, role: 'sparkle', band: 'high', source: 'tone', freq: 2400, dur: 0.08, wave: 'sine', gain: 0.02 },
    { at: 220, role: 'tail', band: 'mid', source: 'tone', freq: 1100, dur: 0.18, wave: 'triangle', gain: 0.014 },
  ],
    jackpot: [
      { at: -30, role: 'impact', band: 'mid', source: 'sample', sample: 'magicHit', gain: 0.48, rate: 0.92 },
      { at: 0, role: 'impact', band: 'mid', source: 'sample', sample: 'reveal', gain: 0.1, rate: 1.18 },
      { at: 8, role: 'voice', band: 'mid', source: 'voice', vowel: 'wow', freq: 290, dur: 0.34, gain: 0.046, slide: 180 },
      { at: 96, role: 'sparkle', band: 'high', source: 'sample', sample: 'jackpotFanfare', gain: 0.52, rate: 1.08 },
    { at: 20, role: 'sparkle', band: 'high', source: 'tone', freq: 1046, dur: 0.13, wave: 'triangle', gain: 0.046 },
    { at: 130, role: 'sparkle', band: 'high', source: 'tone', freq: 1318, dur: 0.13, wave: 'triangle', gain: 0.044 },
    { at: 240, role: 'sparkle', band: 'high', source: 'tone', freq: 1568, dur: 0.16, wave: 'triangle', gain: 0.05 },
    { at: 390, role: 'sparkle', band: 'high', source: 'tone', freq: 2093, dur: 0.2, wave: 'sine', gain: 0.04 },
    { at: 590, role: 'tail', band: 'mid', source: 'tone', freq: 784, dur: 0.34, wave: 'sine', gain: 0.024, slide: -120 },
  ],
};
  function getSoundCuePlan(name, intensity = 1) {
    const strength = Math.min(1.6, Math.max(0.2, Number(intensity) || 1));
    const recipe = SOUND_CUE_RECIPES[name] || [];
    return recipe
      .map((layer) => ({ ...layer, gain: Number((layer.gain * strength).toFixed(4)) }))
      .sort((a, b) => a.at - b.at);
  }
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
    { name: 'What You Wish For', src: 'assets/what_you_wish_for.m4a' },
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

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, Math.round(number)));
  }
  function normalizeRarityWeights(input = RARITY_WEIGHTS) {
    const weights = Object.fromEntries(RARITY_ORDER.map((rarity) => [rarity, clamp(input?.[rarity] ?? RARITY_WEIGHTS[rarity], 0, 999)]));
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
    return total > 0 ? weights : { ...RARITY_WEIGHTS };
  }
  function pickRarity(name, index = 0) {
    if (index >= FOOD_POOL_NAMES.length - 10 || /^SSR/.test(name)) return 'SSR';
    const score = (name.length * 17 + index * 31) % 100;
    if (score > 93) return 'SSR';
    if (score > 78) return 'SR';
    if (score > 48) return 'R';
    return 'N';
  }
  function cleanFoodName(value) {
    return String(value ?? '')
      .trim()
      .replace(/^(SSR|SR|R|N)\s*/i, '')
      .replace(/^(传说级|命运之|AI\s*|低多边形|美漫|P5风格|P5|怪盗)/i, '')
      .replace(/套餐$/u, '')
      .trim();
  }
  function foodNameSize(name) {
    const length = String(name ?? '').trim().length;
    if (length >= 7) return 'compact';
    if (length >= 5) return 'long';
    return 'normal';
  }
  function normalizeFood(input, fallbackId = 1) {
    const name = cleanFoodName(input?.name) || '未命名食物';
    const rarity = RARITIES.has(input?.rarity) ? input.rarity : 'SSR';
    const requestedIcon = String(input?.iconKind || '').trim();
    return {
      id: clamp(input?.id ?? fallbackId, 1, 999999),
      name,
      rarity,
      calories: clamp(input?.calories ?? 520, 120, 1200),
      health: clamp(input?.health ?? 60, 1, 99),
      sugarSafe: input?.sugarSafe === true || input?.sugarSafe === 'true' || input?.sugarSafe === 'on',
      iconKind: FOOD_ICON_KINDS.has(requestedIcon) ? requestedIcon : 'auto',
    };
  }
  function sanitizeFoodPool(items, fallback = buildFoods()) {
    const source = Array.isArray(items) ? items : [];
    const seen = new Set();
    const foods = [];
    source.forEach((item) => {
      const food = normalizeFood(item, foods.length + 1);
      if (!food.name || seen.has(food.name)) return;
      seen.add(food.name);
      foods.push({ ...food, id: foods.length + 1 });
    });
    return foods.length ? foods : fallback;
  }
  function classifyFood(name) {
    if (/披萨/.test(name)) return 'pizza';
    if (/汉堡/.test(name)) return 'burger';
    if (/咖喱/.test(name)) return 'curry';
    if (/寿司|刺身|鳗鱼寿司/.test(name)) return 'sushi';
    if (/卷饼|春卷|披塔|三明治/.test(name)) return 'wrap';
    if (/虾|龙虾/.test(name)) return 'shrimp';
    if (/面包|吐司|烧饼|馍/.test(name)) return 'bread';
    if (/面|粉|河粉|米线|拉面|担担|热干|刀削/.test(name)) return 'noodle';
    if (/饭|炒饭|便当|盖饭|煲仔|丼|粥/.test(name)) return 'rice';
    if (/饺|包|烧麦|锅贴|馄饨|肠粉|肉夹馍|煎饼/.test(name)) return 'dumpling';
    if (/鱼|蟹|海鲜|鳗/.test(name)) return 'fish';
    if (/火锅|冒菜|麻辣烫|锅|汤/.test(name)) return 'hotpot';
    if (/串|烤|烧烤|羊肉|牛排|鸡翅|鸡腿/.test(name)) return 'skewer';
    if (/豆腐|豆皮|豆干/.test(name)) return 'tofu';
    if (/肉|鸡|牛|羊|猪|排骨|叉烧|里脊|扣肉|黄焖/.test(name)) return 'meat';
    if (/沙拉|西兰花|牛油果|时蔬|蔬菜|青椒|生菜|花菜|青菜/.test(name)) return 'salad';
    if (/面|粉|米线|河粉|拉面|热干|担担|云吞/.test(name)) return 'noodle';
    if (/饭|粥|煲仔|卤肉|炒饭|便当|碗/.test(name)) return 'rice';
    if (/饺|包|烧麦|锅贴|肠粉|肉夹馍|饼/.test(name)) return 'dumpling';
    if (/鱼|鲈|三文|海鲜|蟹|鳗/.test(name)) return 'fish';
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
  function buildFoods(names = FOOD_POOL_NAMES) {
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
    return sanitizeFoodPool([...foods, normalizeFood({ ...input, id: nextId }, nextId)]);
  }
  function deleteFood(foods, id) {
    if (foods.length <= 1) return foods;
    return foods.filter((food) => food.id !== Number(id));
  }
  function randomFood(foods, random = Math.random, weights = RARITY_WEIGHTS) {
    const pool = Array.isArray(foods) ? foods : [];
    if (!pool.length) return undefined;
    const rarityWeights = normalizeRarityWeights(weights);
    const groups = RARITY_ORDER
      .map((rarity) => ({ rarity, items: pool.filter((food) => food.rarity === rarity), weight: rarityWeights[rarity] }))
      .filter((group) => group.items.length && group.weight > 0);
    const total = groups.reduce((sum, group) => sum + group.weight, 0);
    let cursor = random() * total;
    const group = groups.find((item) => {
      cursor -= item.weight;
      return cursor < 0;
    }) ?? groups.at(-1);
    return group.items[Math.floor(random() * group.items.length)] ?? pool[0];
  }
  function rarityOdds(foods, weights = RARITY_WEIGHTS) {
    const pool = Array.isArray(foods) ? foods : [];
    const rarityWeights = normalizeRarityWeights(weights);
    const available = RARITY_ORDER
      .map((rarity) => ({ rarity, count: pool.filter((food) => food.rarity === rarity).length, weight: rarityWeights[rarity] }))
      .filter((item) => item.count > 0 && item.weight > 0);
    const total = available.reduce((sum, item) => sum + item.weight, 0) || 1;
    return available.map((item) => ({ ...item, percent: Number(((item.weight / total) * 100).toFixed(1)) }));
  }
  function parseJsonObject(text, fallback = {}) {
    if (!String(text ?? '').trim()) return fallback;
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('JSON must be an object');
    return parsed;
  }
  function getPathValue(value, path) {
    if (!path) return value;
    return String(path).split('.').filter(Boolean).reduce((current, key) => current?.[key], value);
  }
  function renderTemplate(template, vars) {
    return String(template ?? '').replace(/\{style\}|\{count\}|\{foodsJson\}|\{foodsArray\}|\{schema\}/g, (token) => vars[token.slice(1, -1)] ?? '');
  }
  function buildApiGenerationRequest(config, foods = []) {
    const preset = API_STYLE_PRESETS.find((item) => item.id === config?.stylePresetId) ?? API_STYLE_PRESETS[0];
    const headers = { 'Content-Type': 'application/json', ...parseJsonObject(config?.headersJson, {}) };
    if (config?.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
    const normalized = foods.map((food) => normalizeFood(food, food.id));
    const vars = {
      style: JSON.stringify(preset.prompt).slice(1, -1),
      count: String(config?.count || 8),
      foodsJson: JSON.stringify(JSON.stringify(normalized)).slice(1, -1),
      foodsArray: JSON.stringify(normalized),
      schema: JSON.stringify('Return JSON: {"foods":[{"name":"string","rarity":"N|R|SR|SSR","calories":number,"health":number,"sugarSafe":boolean}]}').slice(1, -1),
    };
    return {
      url: String(config?.endpoint ?? '').trim(),
      options: {
        method: String(config?.method || 'POST').toUpperCase(),
        headers,
        body: renderTemplate(config?.bodyTemplate || DEFAULT_API_BODY, vars),
      },
      preset,
    };
  }
  function extractFoodsFromApiResponse(response, responsePath = 'foods') {
    let value = getPathValue(response, responsePath);
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      value = Array.isArray(parsed) ? parsed : parsed.foods;
    }
    if (!Array.isArray(value)) throw new Error('API response did not contain a food array');
    return value.map((food, index) => normalizeFood({ ...food, id: index + 1 }, index + 1));
  }
  function foodIconPath(kind) {
    // Fluent Emoji food assets live in assets/food/fluent/ATTRIBUTION.txt.
    const icons = {
      noodle: 'assets/food/fluent/1F35C.svg',
      rice: 'assets/food/fluent/1F35A.svg',
      dumpling: 'assets/food/fluent/1F95F.svg',
      fish: 'assets/food/fluent/1F41F.svg',
      hotpot: 'assets/food/fluent/1F372.svg',
      skewer: 'assets/food/fluent/1F362.svg',
      meat: 'assets/food/fluent/1F969.svg',
      tofu: 'assets/food/fluent/1F9C8.svg',
      salad: 'assets/food/fluent/1F957.svg',
      pizza: 'assets/food/fluent/1F355.svg',
      burger: 'assets/food/fluent/1F354.svg',
      curry: 'assets/food/fluent/1F35B.svg',
      sushi: 'assets/food/fluent/1F363.svg',
      wrap: 'assets/food/fluent/1F32F.svg',
      shrimp: 'assets/food/fluent/1F364.svg',
      bread: 'assets/food/fluent/1F35E.svg',
      plate: 'assets/food/fluent/1F37D.svg',
    };
    return icons[kind] || icons.plate;
  }
  function foodArt(food, size = 160) {
    const colors = COLOR_SETS[food.id % COLOR_SETS.length];
    const plate = food.sugarSafe ? '#ecfff8' : '#fff5f5';
    const rareStroke = food.rarity === 'SSR' ? '#ffd60a' : food.rarity === 'SR' ? '#7bdff2' : '#ffffff';
    const kind = FOOD_ICON_KINDS.has(food.iconKind) ? food.iconKind : classifyFood(food.name);
    return `
      <svg class="foodSvg" data-food-kind="${kind}" viewBox="0 0 160 160" width="${size}" height="${size}" role="img" aria-label="${food.name}">
        <defs><filter id="ink${food.id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="5" dy="5" stdDeviation="0" flood-color="#000" flood-opacity=".9"/></filter><clipPath id="dishClip${food.id}"><polygon points="33,42 126,38 132,118 72,130 29,109"/></clipPath></defs>
        <rect x="8" y="10" width="140" height="136" rx="8" fill="#fff" stroke="#111" stroke-width="6"/>
        <polygon points="16,20 148,12 132,45 38,40" fill="${colors[0]}" stroke="#111" stroke-width="4" opacity=".88"/>
      <rect x="25" y="36" width="110" height="96" rx="10" fill="${plate}" stroke="#111" stroke-width="5"/>
      <g filter="url(#ink${food.id})" clip-path="url(#dishClip${food.id})">
        <image href="${foodIconPath(kind)}" x="36" y="42" width="88" height="88" preserveAspectRatio="xMidYMid meet"/>
      </g>
        <circle cx="118" cy="42" r="13" fill="${rareStroke}" stroke="#111" stroke-width="4"/>
        <text x="80" y="140" text-anchor="middle" font-size="12" font-weight="900" fill="#111">${kind.toUpperCase()}</text>
      </svg>`;
  }
  function serializeFoods(foods) {
    return JSON.stringify(foods.map((food) => normalizeFood(food, food.id)), null, 2);
  }
  function parseFoods(json) {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) throw new Error('菜单 JSON 必须是数组');
    return sanitizeFoodPool(parsed);
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

  function setBgmTrack(index) {
    bgmIndex = ((index % BGM.length) + BGM.length) % BGM.length;
    bgm.src = BGM[bgmIndex].src;
    $('bgmName').textContent = BGM[bgmIndex].name;
  }

  function randomizeInitialBgm() {
    if (BGM.length <= 1) {
      setBgmTrack(0);
      return;
    }
    setBgmTrack(Math.floor(Math.random() * BGM.length));
    bgm.load();
  }

  randomizeInitialBgm();

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
      setBgmTrack(bgmIndex + 1);
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
    bgm.play().then(() => {
      audioUnlocked = true;
      document.documentElement.dataset.audioUnlocked = 'true';
      delete document.documentElement.dataset.audioError;
    }).catch((error) => {
      document.documentElement.dataset.audioUnlocked = 'false';
      document.documentElement.dataset.audioError = error?.name || 'play-blocked';
    });
  }
  function kickBgmNow() {
    if (muted) return;
    ++bgmFadeToken;
    setBgmVolume(userBgmVolume());
    bgm.play().catch(() => unlockAudio());
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
      <div class="drawCard winnerCard" data-rarity="${food.rarity}" data-name-size="${concealed ? 'short' : nameSize}"><div class="cardTop">${displayLabel}</div><div class="winnerIcon" data-food-icon="${concealed ? 'sealed' : food.name}">${displayIcon}</div><div class="resultCopy"><div class="destiny">${concealed ? 'LOCKED TARGET' : "TODAY'S TARGET"}</div><div class="resultName">${displayName}</div></div></div>
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
    if (type === 'execute') cutin.innerHTML = '<div class="execute"><span>ALL OUT</span><b>DESTINY UNLOCKING</b></div>';
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
    kickBgmNow();
    pinViewport();
    document.body.classList.add('cursorHidden');
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
  function renderOddsForm() {
    $('oddsN').value = rarityWeights.N;
    $('oddsR').value = rarityWeights.R;
    $('oddsSR').value = rarityWeights.SR;
    $('oddsSSR').value = rarityWeights.SSR;
  }
  function initFoodIconForm() {
    $('foodIconKind').innerHTML = FOOD_ICON_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('');
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
  drawResult(foods[0], { animate: false, concealed: true });
  hideCursorSoon();
}());
