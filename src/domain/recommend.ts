import type { RoundContext } from './types';

export interface Targets {
  warmthPoints: number;      // 목표 보온 점수
  needRemovableLayer: boolean;
  needWaterproof: boolean;
  needWindbreak: boolean;
  needUvProtection: boolean;
  targetBreathability: number; // 1-5
  formalityFloor: number;      // 1-5
  avoidBold: boolean;
  sceneryColors: string[];
}

export function warmthPointsForTemp(tempC: number): number {
  if (tempC < 5) return 9;
  if (tempC < 10) return 7;
  if (tempC < 16) return 5;
  if (tempC < 23) return 3;
  return 1;
}

export function deriveTargets(ctx: RoundContext): Targets {
  const w = ctx.weather;
  const minTemp = w ? w.minTempC : 18;
  const companionMax = ctx.companions.reduce(
    (m, p) => Math.max(m, p.formalityExpectation), 1);
  const courseFloor = ctx.course ? ctx.course.dressCodeLevel : 1;
  const formalityFloor = Math.max(courseFloor, companionMax, 1);

  let targetBreathability = 3;
  if (w && w.avgHumidity >= 0.7) targetBreathability = 5;
  if (ctx.course?.terrain === 'hilly') targetBreathability = Math.max(targetBreathability, 4);

  return {
    warmthPoints: warmthPointsForTemp(minTemp),
    needRemovableLayer: !!w && w.tempSwingC >= 8,
    needWaterproof: !!w && w.maxPrecipProb >= 0.4,
    needWindbreak: !!w && w.maxWindMs >= 5,
    needUvProtection: !!w && w.maxUvIndex >= 6,
    targetBreathability,
    formalityFloor,
    avoidBold: formalityFloor >= 4,
    sceneryColors: ctx.course?.sceneryColors ?? [],
  };
}
