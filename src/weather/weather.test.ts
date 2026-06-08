import { describe, it, expect } from 'vitest';
import { snapshotFromHourly } from './weather';
import type { HourlyWeather } from '../domain/types';

const hours: HourlyWeather[] = [
  { time: '2026-06-14T06:00', tempC: 6, precipProb: 0.1, windMs: 2, uvIndex: 1, humidity: 0.8 },
  { time: '2026-06-14T09:00', tempC: 14, precipProb: 0.2, windMs: 4, uvIndex: 5, humidity: 0.6 },
  { time: '2026-06-14T12:00', tempC: 19, precipProb: 0.5, windMs: 6, uvIndex: 7, humidity: 0.4 },
];

describe('snapshotFromHourly', () => {
  it('최저/최고/일교차/최대값 집계', () => {
    const s = snapshotFromHourly(hours);
    expect(s.minTempC).toBe(6);
    expect(s.maxTempC).toBe(19);
    expect(s.tempSwingC).toBe(13);
    expect(s.maxPrecipProb).toBe(0.5);
    expect(s.maxWindMs).toBe(6);
    expect(s.maxUvIndex).toBe(7);
    expect(s.avgHumidity).toBeCloseTo(0.6, 5);
  });

  it('빈 배열이면 0으로 안전 처리', () => {
    const s = snapshotFromHourly([]);
    expect(s.minTempC).toBe(0);
    expect(s.tempSwingC).toBe(0);
  });
});
