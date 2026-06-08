import { describe, it, expect } from 'vitest';
import { deriveTargets, warmthPointsForTemp, scoreOutfit, layeredWarmth } from './recommend';
import type { RoundContext, WeatherSnapshot, ClothingItem, Category } from './types';

function weather(p: Partial<WeatherSnapshot>): WeatherSnapshot {
  return {
    hourly: [], minTempC: 15, maxTempC: 20, tempSwingC: 5,
    maxPrecipProb: 0, maxWindMs: 1, maxUvIndex: 2, avgHumidity: 0.5, ...p,
  };
}

describe('warmthPointsForTemp', () => {
  it('추울수록 높은 보온 점수', () => {
    expect(warmthPointsForTemp(2)).toBeGreaterThan(warmthPointsForTemp(12));
    expect(warmthPointsForTemp(12)).toBeGreaterThan(warmthPointsForTemp(25));
  });
});

describe('deriveTargets', () => {
  it('일교차 8 이상이면 탈착 레이어 필요', () => {
    const ctx: RoundContext = { weather: weather({ tempSwingC: 12 }), companions: [] };
    expect(deriveTargets(ctx).needRemovableLayer).toBe(true);
  });

  it('일교차 작으면 탈착 레이어 불필요', () => {
    const ctx: RoundContext = { weather: weather({ tempSwingC: 3 }), companions: [] };
    expect(deriveTargets(ctx).needRemovableLayer).toBe(false);
  });

  it('강수확률 40% 이상이면 방수 필요', () => {
    const ctx: RoundContext = { weather: weather({ maxPrecipProb: 0.5 }), companions: [] };
    expect(deriveTargets(ctx).needWaterproof).toBe(true);
  });

  it('격식 하한선은 코스 드레스코드와 동반자 기대치의 최댓값', () => {
    const ctx: RoundContext = {
      weather: weather({}),
      course: { id: 'c', name: '명문CC', dressCodeLevel: 4, sceneryColors: [], terrain: 'flat' },
      companions: [
        { id: 'p1', name: 'A', relationship: '친구', formalityExpectation: 2 },
        { id: 'p2', name: 'B', relationship: '거래처', formalityExpectation: 5 },
      ],
    };
    expect(deriveTargets(ctx).formalityFloor).toBe(5);
  });

  it('컨텍스트 없으면 격식 하한선 1', () => {
    expect(deriveTargets({ companions: [] }).formalityFloor).toBe(1);
  });
});

function item(p: Partial<ClothingItem> & { category: Category }): ClothingItem {
  return {
    id: Math.random().toString(36).slice(2),
    colors: ['#333333'], warmth: 3, formality: 3, waterproof: false,
    uvProtection: false, breathability: 3, materials: [], ...p,
  };
}

describe('layeredWarmth', () => {
  it('상의+미드레이어+아우터 보온 합산', () => {
    const items = [
      item({ category: 'top', warmth: 2 }),
      item({ category: 'midlayer', warmth: 3 }),
      item({ category: 'outer', warmth: 4 }),
    ];
    expect(layeredWarmth(items)).toBe(9);
  });
});

describe('scoreOutfit', () => {
  const baseTargets = deriveTargets({ companions: [] });

  it('방수 필요한데 방수 아우터 없으면 경고', () => {
    const targets = { ...baseTargets, needWaterproof: true };
    const items = [item({ category: 'top' }), item({ category: 'bottom' })];
    const r = scoreOutfit(items, targets);
    expect(r.warnings.some(w => w.includes('방수'))).toBe(true);
  });

  it('방수 필요하고 방수 아우터 있으면 이유에 포함, 경고 없음', () => {
    const targets = { ...baseTargets, needWaterproof: true };
    const items = [
      item({ category: 'top' }), item({ category: 'bottom' }),
      item({ category: 'outer', waterproof: true }),
    ];
    const r = scoreOutfit(items, targets);
    expect(r.reasons.some(x => x.includes('방수'))).toBe(true);
    expect(r.warnings.length).toBe(0);
  });

  it('탈착 레이어 필요할 때 미드레이어 있으면 점수가 더 높다', () => {
    const targets = { ...baseTargets, needRemovableLayer: true, warmthPoints: 7 };
    const withLayer = scoreOutfit([
      item({ category: 'top', warmth: 3 }), item({ category: 'bottom' }),
      item({ category: 'midlayer', warmth: 4 }),
    ], targets);
    const without = scoreOutfit([
      item({ category: 'top', warmth: 3 }), item({ category: 'bottom' }),
    ], targets);
    expect(withLayer.score).toBeGreaterThan(without.score);
  });
});
