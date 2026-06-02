import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FOOD_NAMES,
  FOOD_POOL_NAMES,
  FOOD_ICON_OPTIONS,
  API_STYLE_PRESETS,
  buildApiGenerationRequest,
  buildFoods,
  cleanFoodName,
  classifyFood,
  createFood,
  deleteFood,
  extractFoodsFromApiResponse,
  foodArt,
  foodIconPath,
  foodNameSize,
  getSoundCuePlan,
  normalizeFood,
  normalizeRarityWeights,
  randomFood,
  rarityOdds,
  sanitizeFoodPool,
} from '../src/core.js';

test('buildFoods creates the expanded default food pool with stable ids', () => {
  const foods = buildFoods();

  assert.equal(foods.length, FOOD_POOL_NAMES.length);
  assert.equal(foods.length >= 200, true);
  assert.equal(foods[0].id, 1);
  assert.equal(foods.at(-1).id, FOOD_POOL_NAMES.length);
  assert.equal(DEFAULT_FOOD_NAMES.length < FOOD_POOL_NAMES.length, true);
});

test('normalizeFood clamps admin values and keeps sugar flag boolean', () => {
  const food = normalizeFood({
    id: 7,
    name: '  黑松露牛排  ',
    rarity: 'legend',
    calories: '1400',
    health: '-10',
    sugarSafe: 'on',
  });

  assert.deepEqual(food, {
    id: 7,
    name: '黑松露牛排',
    rarity: 'SSR',
    calories: 1200,
    health: 1,
    sugarSafe: true,
    iconKind: 'auto',
  });
});

test('cleanFoodName removes game labels from menu names', () => {
  assert.equal(cleanFoodName('SSR深夜火锅'), '深夜火锅');
  assert.equal(cleanFoodName('传说级烧烤'), '烧烤');
  assert.equal(cleanFoodName('命运之麻辣香锅'), '麻辣香锅');
  assert.equal(cleanFoodName('低多边形牛肉面'), '牛肉面');
  assert.equal(cleanFoodName('肉夹馍套餐'), '肉夹馍');
});

test('foodNameSize classifies compact labels for reel and result cards', () => {
  assert.equal(foodNameSize('牛肉面'), 'normal');
  assert.equal(foodNameSize('番茄牛腩汤'), 'long');
  assert.equal(foodNameSize('控糖蒸鱼套餐饭'), 'compact');
});

test('createFood appends a normalized admin item with next id', () => {
  const foods = [{ id: 4, name: '牛肉面', rarity: 'R', calories: 600, health: 52, sugarSafe: false }];

  const next = createFood(foods, { name: '控糖蒸鱼套餐', rarity: 'SR', calories: 360, health: 88, sugarSafe: true });

  assert.equal(next.length, 2);
  assert.equal(next[1].id, 2);
  assert.equal(next[1].name, '控糖蒸鱼');
});

test('sanitizeFoodPool dedupes cleaned names and resequences ids', () => {
  const foods = sanitizeFoodPool([
    { id: 20, name: 'SSR深夜火锅', rarity: 'SR', calories: 700, health: 45, sugarSafe: false },
    { id: 21, name: '深夜火锅', rarity: 'N', calories: 520, health: 60, sugarSafe: false },
    { id: 22, name: '低多边形牛肉面', rarity: 'R', calories: 620, health: 52, sugarSafe: false },
  ]);

  assert.deepEqual(foods.map((food) => food.name), ['深夜火锅', '牛肉面']);
  assert.deepEqual(foods.map((food) => food.id), [1, 2]);
  assert.equal(foods[0].rarity, 'SR');
});

test('deleteFood keeps at least one option in the pool', () => {
  const only = [{ id: 1, name: '麻婆豆腐', rarity: 'R', calories: 600, health: 52, sugarSafe: false }];

  assert.equal(deleteFood(only, 1).length, 1);
  assert.equal(deleteFood([...only, { ...only[0], id: 2, name: '火锅' }], 1).length, 1);
});

test('rarityOdds reports active blind-box weights', () => {
  const odds = rarityOdds([
    { id: 1, name: '普通饭', rarity: 'N' },
    { id: 2, name: '稀有面', rarity: 'R' },
    { id: 3, name: '超稀有锅', rarity: 'SR' },
    { id: 4, name: '终极牛排', rarity: 'SSR' },
  ]);

  assert.deepEqual(odds.map((item) => [item.rarity, item.percent]), [
    ['N', 54],
    ['R', 30],
    ['SR', 12],
    ['SSR', 4],
  ]);
});

test('randomFood draws by rarity weight before picking within that rarity', () => {
  const foods = [
    { id: 1, name: '普通饭', rarity: 'N' },
    { id: 2, name: '稀有面', rarity: 'R' },
    { id: 3, name: '超稀有锅', rarity: 'SR' },
    { id: 4, name: '终极牛排', rarity: 'SSR' },
  ];
  const draws = [0.01, 0.55, 0.85, 0.98].map((pick) => randomFood(foods, () => pick).rarity);

  assert.deepEqual(draws, ['N', 'R', 'SR', 'SSR']);
});

test('custom rarity weights can force a selected rarity', () => {
  const foods = [
    { id: 1, name: '普通饭', rarity: 'N' },
    { id: 2, name: '稀有面', rarity: 'R' },
    { id: 3, name: '超稀有锅', rarity: 'SR' },
    { id: 4, name: '终极牛排', rarity: 'SSR' },
  ];

  assert.equal(randomFood(foods, () => 0.1, { N: 0, R: 0, SR: 0, SSR: 1 }).rarity, 'SSR');
  assert.deepEqual(normalizeRarityWeights({ N: 0, R: 0, SR: 0, SSR: 0 }), { N: 54, R: 30, SR: 12, SSR: 4 });
});

test('foodArt returns low-poly comic svg markup without emoji art', () => {
  const art = foodArt({ id: 8, name: '麻辣香锅', rarity: 'SSR', calories: 800, health: 45, sugarSafe: false });

  assert.match(art, /<svg/);
  assert.match(art, /<image/);
  assert.match(art, /class="foodFacet"/);
  assert.match(art, /assets\/food\/openmoji\//);
  assert.doesNotMatch(art, /🍜|🥘|🍚|🥟|🍲|🥗|🍛|🔥|🥢|🍖|🦀|🍗/);
});

test('foodArt uses recognizable food-specific silhouettes', () => {
  const cases = [
    ['牛肉面', 'noodle'],
    ['扬州炒饭', 'rice'],
    ['水饺', 'dumpling'],
    ['清蒸鲈鱼', 'fish'],
    ['火锅', 'hotpot'],
    ['烧烤', 'skewer'],
    ['红烧肉', 'meat'],
    ['麻婆豆腐', 'tofu'],
  ];

  for (const [name, kind] of cases) {
    assert.match(foodArt({ id: 1, name, rarity: 'R', calories: 500, health: 50, sugarSafe: false }), new RegExp(`data-food-kind="${kind}"`));
  }
});

test('foodIconPath maps food kinds to local OpenMoji SVG assets', () => {
  assert.equal(foodIconPath('noodle'), 'assets/food/openmoji/1F35C.svg');
  assert.equal(foodIconPath('rice'), 'assets/food/openmoji/1F35A.svg');
  assert.equal(foodIconPath('pizza'), 'assets/food/openmoji/1F355.svg');
  assert.equal(foodIconPath('sushi'), 'assets/food/openmoji/1F363.svg');
  assert.equal(foodIconPath('shrimp'), 'assets/food/openmoji/1F364.svg');
  assert.equal(foodIconPath('plate'), 'assets/food/openmoji/1F37D.svg');
});

test('classifyFood maps readable Chinese names to matching visual categories', () => {
  assert.equal(classifyFood('麻婆豆腐'), 'tofu');
  assert.equal(classifyFood('牛肉面'), 'noodle');
  assert.equal(classifyFood('水饺'), 'dumpling');
  assert.equal(classifyFood('清蒸鲈鱼'), 'fish');
  assert.equal(classifyFood('红烧肉'), 'meat');
  assert.equal(classifyFood('虎皮青椒'), 'salad');
  assert.equal(classifyFood('玛格丽特披萨'), 'pizza');
  assert.equal(classifyFood('日式咖喱饭'), 'curry');
  assert.equal(classifyFood('寿司拼盘'), 'sushi');
  assert.equal(classifyFood('墨西哥卷饼'), 'wrap');
  assert.equal(classifyFood('油焖大虾'), 'shrimp');
});

test('foodArt uses attributed local image assets for food art', () => {
  const art = foodArt({ id: 1, name: '麻婆豆腐', rarity: 'R', calories: 280, health: 82, sugarSafe: true });

  assert.match(art, /data-food-kind="tofu"/);
  assert.match(art, />TOFU</);
  assert.match(art, /<image/);
  assert.match(art, /assets\/food\/openmoji\/1F9C8\.svg/);
});

test('manual icon kind overrides automatic food classification', () => {
  const food = normalizeFood({ id: 1, name: '牛肉面', rarity: 'R', iconKind: 'sushi' });
  const art = foodArt(food);

  assert.equal(FOOD_ICON_OPTIONS.some((item) => item.value === 'sushi'), true);
  assert.equal(food.iconKind, 'sushi');
  assert.match(art, /data-food-kind="sushi"/);
  assert.match(art, /assets\/food\/openmoji\/1F363\.svg/);
});

test('getSoundCuePlan layers editorial sound roles across frequency bands', () => {
  const reveal = getSoundCuePlan('reveal');
  const roles = new Set(reveal.map((layer) => layer.role));
  const bands = new Set(reveal.map((layer) => layer.band));

  assert.deepEqual([...roles].sort(), ['impact', 'riser', 'sparkle', 'sub', 'tail', 'voice']);
  assert.equal(bands.has('low'), true);
  assert.equal(bands.has('mid'), true);
  assert.equal(bands.has('high'), true);
  assert.equal(reveal.some((layer) => layer.source === 'voice'), true);
  assert.equal(reveal.some((layer) => layer.at < 0), true);
  assert.equal(reveal.some((layer) => layer.at > 0), true);
  assert.equal(reveal.length >= 10, true);
});

test('buildApiGenerationRequest applies built-in style preset and templates request body', () => {
  const foods = buildFoods().slice(0, 2);
  const request = buildApiGenerationRequest({
    endpoint: 'https://example.test/generate',
    apiKey: 'sk-test',
    stylePresetId: 'low-poly-comic',
    count: 4,
    headersJson: '{"X-App":"food"}',
    bodyTemplate: '{"prompt":"{style} generate {count} foods from {foodsJson}"}',
  }, foods);

  assert.equal(API_STYLE_PRESETS.some((preset) => preset.id === 'low-poly-comic'), true);
  assert.equal(request.url, 'https://example.test/generate');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer sk-test');
  assert.equal(request.options.headers['X-App'], 'food');
  assert.match(JSON.parse(request.options.body).prompt, /low-poly American comic/);
  assert.match(JSON.parse(request.options.body).prompt, /generate 4 foods/);
});

test('buildApiGenerationRequest default prompt asks for food options, not dinner', () => {
  const request = buildApiGenerationRequest({ endpoint: 'https://example.test/generate', count: 3 }, buildFoods().slice(0, 1));
  const body = JSON.parse(request.options.body);

  assert.match(body.prompt, /Chinese food options/);
  assert.doesNotMatch(body.prompt, /dinner/i);
});

test('extractFoodsFromApiResponse accepts custom response paths and normalizes foods', () => {
  const response = {
    data: {
      menu: [
        { name: 'AI 牛肉面', rarity: 'SR', calories: 620, health: 66, sugarSafe: false },
        { name: 'AI 控糖蒸鱼', rarity: 'SSR', calories: 300, health: 94, sugarSafe: true },
      ],
    },
  };

  const foods = extractFoodsFromApiResponse(response, 'data.menu');

  assert.equal(foods.length, 2);
  assert.equal(foods[0].id, 1);
  assert.equal(foods[1].name, '控糖蒸鱼');
  assert.equal(foods[1].sugarSafe, true);
});
