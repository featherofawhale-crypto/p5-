import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FOOD_NAMES,
  FOOD_POOL_NAMES,
  API_STYLE_PRESETS,
  buildApiGenerationRequest,
  buildFoods,
  classifyFood,
  createFood,
  deleteFood,
  extractFoodsFromApiResponse,
  foodArt,
  foodIconPath,
  getSoundCuePlan,
  normalizeFood,
} from '../src/core.js';

test('buildFoods creates the expanded default dinner pool with stable ids', () => {
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
  });
});

test('createFood appends a normalized admin item with next id', () => {
  const foods = [{ id: 4, name: '牛肉面', rarity: 'R', calories: 600, health: 52, sugarSafe: false }];

  const next = createFood(foods, { name: '控糖蒸鱼套餐', rarity: 'SR', calories: 360, health: 88, sugarSafe: true });

  assert.equal(next.length, 2);
  assert.equal(next[1].id, 5);
  assert.equal(next[1].name, '控糖蒸鱼套餐');
});

test('deleteFood keeps at least one option in the pool', () => {
  const only = [{ id: 1, name: '麻婆豆腐', rarity: 'R', calories: 600, health: 52, sugarSafe: false }];

  assert.equal(deleteFood(only, 1).length, 1);
  assert.equal(deleteFood([...only, { ...only[0], id: 2, name: '火锅' }], 1).length, 1);
});

test('foodArt returns low-poly comic svg markup without emoji art', () => {
  const art = foodArt({ id: 8, name: '麻辣香锅', rarity: 'SSR', calories: 800, health: 45, sugarSafe: false });

  assert.match(art, /<svg/);
  assert.match(art, /<image/);
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
  assert.equal(foodIconPath('plate'), 'assets/food/openmoji/1F37D.svg');
});

test('classifyFood maps readable Chinese names to matching visual categories', () => {
  assert.equal(classifyFood('麻婆豆腐'), 'tofu');
  assert.equal(classifyFood('牛肉面'), 'noodle');
  assert.equal(classifyFood('水饺'), 'dumpling');
  assert.equal(classifyFood('清蒸鲈鱼'), 'fish');
  assert.equal(classifyFood('红烧肉'), 'meat');
  assert.equal(classifyFood('虎皮青椒'), 'salad');
});

test('foodArt uses attributed local image assets for food art', () => {
  const art = foodArt({ id: 1, name: '麻婆豆腐', rarity: 'R', calories: 280, health: 82, sugarSafe: true });

  assert.match(art, /data-food-kind="tofu"/);
  assert.match(art, />TOFU</);
  assert.match(art, /<image/);
  assert.match(art, /assets\/food\/openmoji\/1F9C8\.svg/);
});

test('getSoundCuePlan layers editorial sound roles across frequency bands', () => {
  const reveal = getSoundCuePlan('reveal');
  const roles = new Set(reveal.map((layer) => layer.role));
  const bands = new Set(reveal.map((layer) => layer.band));

  assert.deepEqual([...roles].sort(), ['impact', 'riser', 'sparkle', 'sub', 'tail']);
  assert.equal(bands.has('low'), true);
  assert.equal(bands.has('mid'), true);
  assert.equal(bands.has('high'), true);
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
    headersJson: '{"X-App":"dinner"}',
    bodyTemplate: '{"prompt":"{style} generate {count} foods from {foodsJson}"}',
  }, foods);

  assert.equal(API_STYLE_PRESETS.some((preset) => preset.id === 'low-poly-comic'), true);
  assert.equal(request.url, 'https://example.test/generate');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer sk-test');
  assert.equal(request.options.headers['X-App'], 'dinner');
  assert.match(JSON.parse(request.options.body).prompt, /low-poly American comic/);
  assert.match(JSON.parse(request.options.body).prompt, /generate 4 foods/);
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
  assert.equal(foods[1].name, 'AI 控糖蒸鱼');
  assert.equal(foods[1].sugarSafe, true);
});
