import { describe, it, expect } from 'vitest';
import { deriveTargets, warmthPointsForTemp, scoreOutfit, layeredWarmth, recommend } from './recommend';
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

describe('recommend', () => {
  const wardrobe: ClothingItem[] = [
    item({ category: 'top', formality: 5, warmth: 2, colors: ['#1f3a5f'] }),     // 카라티
    item({ category: 'top', formality: 2, warmth: 2, colors: ['#cc3344'] }),     // 캐주얼티
    item({ category: 'bottom', formality: 4, warmth: 2 }),
    item({ category: 'midlayer', formality: 3, warmth: 4 }),
    item({ category: 'outer', formality: 3, warmth: 4, waterproof: true }),
    item({ category: 'hat', formality: 3, uvProtection: true }),
  ];

  it('최대 3벌, 점수 내림차순 반환', () => {
    const out = recommend(wardrobe, { companions: [] });
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < out.length; i++) {
      expect(out[i - 1].score).toBeGreaterThanOrEqual(out[i].score);
    }
  });

  it('드레스코드 5면 격식 미달 상의(formality<5)는 1등에 안 옴', () => {
    const ctx: RoundContext = {
      companions: [],
      course: { id: 'c', name: '명문', dressCodeLevel: 5, sceneryColors: [], terrain: 'flat' },
    };
    const best = recommend(wardrobe, ctx)[0];
    const bestTop = best.items.find(i => i.category === 'top')!;
    expect(bestTop.formality).toBe(5);
  });

  it('추운 새벽 + 큰 일교차면 1등 코디에 탈착 레이어 포함', () => {
    const ctx: RoundContext = {
      companions: [],
      weather: weather({ minTempC: 4, maxTempC: 18, tempSwingC: 14 }),
    };
    const best = recommend(wardrobe, ctx)[0];
    expect(best.items.some(i => i.category === 'midlayer' || i.category === 'outer')).toBe(true);
  });

  it('상의가 아예 없으면 빈 배열', () => {
    const out = recommend([item({ category: 'bottom' })], { companions: [] });
    expect(out).toEqual([]);
  });

  it('레이어가 필요한 추운 비 오는 날엔 3벌까지 추천', () => {
    const out = recommend(wardrobe, {
      companions: [],
      weather: weather({ minTempC: 3, maxTempC: 16, tempSwingC: 13, maxPrecipProb: 0.6, maxWindMs: 6 }),
    });
    expect(out.length).toBe(3);
  });
});
