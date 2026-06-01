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

export function foodArt(food, size = 160) {
  const colors = COLOR_SETS[food.id % COLOR_SETS.length];
  const plate = food.sugarSafe ? '#ecfff8' : '#fff5f5';
  const rareStroke = food.rarity === 'SSR' ? '#ffd60a' : food.rarity === 'SR' ? '#7bdff2' : '#ffffff';
  return `
    <svg class="foodSvg" viewBox="0 0 160 160" width="${size}" height="${size}" role="img" aria-label="${food.name}">
      <defs>
        <filter id="ink${food.id}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="5" dy="5" stdDeviation="0" flood-color="#000" flood-opacity=".9"/>
        </filter>
      </defs>
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

export function serializeFoods(foods) {
  return JSON.stringify(foods.map((food) => normalizeFood(food, food.id)), null, 2);
}

export function parseFoods(json) {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('菜单 JSON 必须是数组');
  const foods = parsed.map((food, index) => normalizeFood(food, index + 1));
  return foods.length ? foods : buildFoods();
}
