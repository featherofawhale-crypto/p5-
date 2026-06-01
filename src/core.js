export const DEFAULT_FOOD_NAMES = [
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

export const API_STYLE_PRESETS = [
  {
    id: 'low-poly-comic',
    name: '低多边形美漫',
    prompt: 'low-poly American comic food illustration, bold black ink, angular facets, dramatic red white black palette, readable food silhouette',
  },
  {
    id: 'persona-punk',
    name: '怪盗红黑冲击',
    prompt: 'stylish phantom-thief game UI food concept, red black white, sharp diagonal composition, high contrast, dramatic reveal card',
  },
  {
    id: 'pixel-arcade',
    name: '像素街机',
    prompt: '16-bit arcade food icons, punchy colors, crisp silhouette, game item style, readable at small size',
  },
  {
    id: 'manga-bento',
    name: '漫画便当',
    prompt: 'Japanese manga bento food illustration, thick ink lines, screentone texture, expressive comic impact, clear dish identity',
  },
];

const DEFAULT_API_BODY_TEMPLATE = JSON.stringify({
  prompt: '{style}\nGenerate {count} Chinese dinner options. Return JSON only with an array named foods. Each item must have name, rarity(N/R/SR/SSR), calories, health, sugarSafe.',
  currentFoods: '{foodsJson}',
}, null, 2);

export function classifyFood(name) {
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
  const common = {
    sauce: `<polygon points="52,79 76,62 107,74 116,102 82,118 45,102" fill="${colors[2]}" stroke="#111" stroke-width="4"/>`,
    garnish: `<polygon points="104,40 125,49 112,66 91,57" fill="#ffd60a" stroke="#111" stroke-width="3"/>`,
  };
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
  return `${common.sauce}${common.garnish}
    <ellipse cx="80" cy="108" rx="50" ry="19" fill="#fff" stroke="#111" stroke-width="6"/>`;
}

export function foodIconPath(kind) {
  const icons = {
    noodle: 'assets/food/twemoji/1f35c.svg',
    rice: 'assets/food/twemoji/1f35a.svg',
    dumpling: 'assets/food/twemoji/1f95f.svg',
    fish: 'assets/food/twemoji/1f41f.svg',
    hotpot: 'assets/food/twemoji/1f372.svg',
    skewer: 'assets/food/twemoji/1f362.svg',
    meat: 'assets/food/twemoji/1f969.svg',
    tofu: 'assets/food/twemoji/1f9c8.svg',
    salad: 'assets/food/twemoji/1f957.svg',
    plate: 'assets/food/twemoji/1f37d.svg',
  };
  return icons[kind] || icons.plate;
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.round(number)));
}

export function pickRarity(name, index = 0) {
  if (index >= DEFAULT_FOOD_NAMES.length - 10 || /^SSR/.test(name)) return 'SSR';
  const score = (name.length * 17 + index * 31) % 100;
  if (score > 93) return 'SSR';
  if (score > 78) return 'SR';
  if (score > 48) return 'R';
  return 'N';
}

export function normalizeFood(input, fallbackId = 1) {
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

export function buildFoods(names = DEFAULT_FOOD_NAMES) {
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

export function createFood(foods, input) {
  const nextId = foods.reduce((max, food) => Math.max(max, food.id), 0) + 1;
  return [...foods, normalizeFood({ ...input, id: nextId }, nextId)];
}

export function updateFood(foods, id, input) {
  return foods.map((food) => (food.id === Number(id) ? normalizeFood({ ...food, ...input, id: food.id }, food.id) : food));
}

export function deleteFood(foods, id) {
  if (foods.length <= 1) return foods;
  return foods.filter((food) => food.id !== Number(id));
}

export function randomFood(foods, random = Math.random) {
  return foods[Math.floor(random() * foods.length)] ?? foods[0];
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

export function buildApiGenerationRequest(config, foods = []) {
  const preset = API_STYLE_PRESETS.find((item) => item.id === config?.stylePresetId) ?? API_STYLE_PRESETS[0];
  const headers = {
    'Content-Type': 'application/json',
    ...parseJsonObject(config?.headersJson, {}),
  };
  if (config?.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  const vars = {
    style: JSON.stringify(preset.prompt).slice(1, -1),
    count: String(config?.count || 8),
    foodsJson: JSON.stringify(JSON.stringify(foods.map((food) => normalizeFood(food, food.id)))).slice(1, -1),
    foodsArray: JSON.stringify(foods.map((food) => normalizeFood(food, food.id))),
    schema: JSON.stringify('Return JSON: {"foods":[{"name":"string","rarity":"N|R|SR|SSR","calories":number,"health":number,"sugarSafe":boolean}]}').slice(1, -1),
  };
  return {
    url: String(config?.endpoint ?? '').trim(),
    options: {
      method: String(config?.method || 'POST').toUpperCase(),
      headers,
      body: renderTemplate(config?.bodyTemplate || DEFAULT_API_BODY_TEMPLATE, vars),
    },
    preset,
  };
}

export function extractFoodsFromApiResponse(response, responsePath = 'foods') {
  let value = getPathValue(response, responsePath);
  if (typeof value === 'string') {
    const parsed = JSON.parse(value);
    value = Array.isArray(parsed) ? parsed : parsed.foods;
  }
  if (!Array.isArray(value)) throw new Error('API response did not contain a food array');
  return value.map((food, index) => normalizeFood({ ...food, id: index + 1 }, index + 1));
}

export function foodArt(food, size = 160) {
  const colors = COLOR_SETS[food.id % COLOR_SETS.length];
  const plate = food.sugarSafe ? '#ecfff8' : '#fff5f5';
  const rareStroke = food.rarity === 'SSR' ? '#ffd60a' : food.rarity === 'SR' ? '#7bdff2' : '#ffffff';
  const kind = classifyFood(food.name);
  return `
    <svg class="foodSvg" data-food-kind="${kind}" viewBox="0 0 160 160" width="${size}" height="${size}" role="img" aria-label="${food.name}">
      <defs>
        <filter id="ink${food.id}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="5" dy="5" stdDeviation="0" flood-color="#000" flood-opacity=".9"/>
        </filter>
      </defs>
      <rect x="8" y="10" width="140" height="136" rx="8" fill="#fff" stroke="#111" stroke-width="6"/>
      <polygon points="16,20 148,12 132,45 38,40" fill="${colors[0]}" stroke="#111" stroke-width="4" opacity=".88"/>
      <rect x="25" y="36" width="110" height="96" rx="10" fill="${plate}" stroke="#111" stroke-width="5"/>
      <image href="${foodIconPath(kind)}" x="38" y="44" width="84" height="84" preserveAspectRatio="xMidYMid meet" filter="url(#ink${food.id})"/>
      <circle cx="118" cy="42" r="13" fill="${rareStroke}" stroke="#111" stroke-width="4"/>
      <text x="80" y="140" text-anchor="middle" font-size="13" font-weight="900" fill="#111">LOW POLY</text>
    </svg>`;
}

export function serializeFoods(foods) {
  return JSON.stringify(foods.map((food) => normalizeFood(food, food.id)), null, 2);
}

export function parseFoods(json) {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('菜单 JSON 必须是数组');
  const foods = parsed.map((food, index) => normalizeFood(food, index + 1));
  return foods.length ? foods : buildFoods();
}
