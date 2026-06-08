import { describe, it, expect } from 'vitest';
import { deriveTargets, warmthPointsForTemp } from './recommend';
import type { RoundContext, WeatherSnapshot } from './types';

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
