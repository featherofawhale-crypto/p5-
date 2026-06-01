import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FOOD_NAMES,
  buildFoods,
  createFood,
  deleteFood,
  foodArt,
  normalizeFood,
} from '../src/core.js';

test('buildFoods creates the default dinner pool with stable ids', () => {
  const foods = buildFoods();

  assert.equal(foods.length, DEFAULT_FOOD_NAMES.length);
  assert.equal(foods[0].id, 1);
  assert.equal(foods.at(-1).id, DEFAULT_FOOD_NAMES.length);
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
  assert.match(art, /polygon/);
  assert.match(art, /LOW POLY/);
  assert.doesNotMatch(art, /🍜|🥘|🍚|🥟|🍲|🥗|🍛|🔥|🥢|🍖|🦀|🍗/);
});
