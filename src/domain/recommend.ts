import type { RoundContext, ClothingItem } from './types';

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

const WARM_CATS = new Set(['top', 'midlayer', 'outer']);

export function layeredWarmth(items: ClothingItem[]): number {
  return items
    .filter(i => WARM_CATS.has(i.category))
    .reduce((s, i) => s + i.warmth, 0);
}

export function scoreOutfit(
  items: ClothingItem[],
  targets: Targets,
): { score: number; reasons: string[]; warnings: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 보온성: 목표 점수와 레이어 합산의 차이만큼 감점
  const warmth = layeredWarmth(items);
  score -= Math.min(40, Math.abs(targets.warmthPoints - warmth) * 8);

  // 탈착 레이어
  const hasRemovable = items.some(i => i.category === 'midlayer' || i.category === 'outer');
  if (targets.needRemovableLayer) {
    if (hasRemovable) { score += 12; reasons.push('일교차가 커서 탈착 가능한 레이어 포함'); }
    else { score -= 12; warnings.push('일교차가 큰데 탈착 레이어가 없습니다'); }
  }

  // 방수
  if (targets.needWaterproof) {
    if (items.some(i => i.waterproof)) { score += 10; reasons.push('강수 대비 방수 아우터 포함'); }
    else { score -= 15; warnings.push('비 예보가 있는데 방수 아이템이 없습니다 — 우산 챙기세요'); }
  }

  // 바람
  if (targets.needWindbreak) {
    if (items.some(i => i.category === 'outer')) { score += 6; reasons.push('바람 대비 아우터 포함'); }
    else { score -= 6; }
  }

  // 자외선
  if (targets.needUvProtection) {
    if (items.some(i => i.uvProtection || i.category === 'hat')) {
      score += 6; reasons.push('자외선 대비(모자/차단 의류)');
    } else { score -= 6; warnings.push('자외선이 강한데 모자/차단 아이템이 없습니다'); }
  }

  // 통풍성
  const avgBreath = items.length
    ? items.reduce((s, i) => s + i.breathability, 0) / items.length : 3;
  score -= Math.min(15, Math.abs(targets.targetBreathability - avgBreath) * 4);

  // 격식: 상의가 하한선 미달이면 큰 감점(후보 생성에서 걸러지지만 안전망)
  const top = items.find(i => i.category === 'top');
  if (top) {
    if (top.formality >= targets.formalityFloor) {
      if (targets.formalityFloor >= 4) reasons.push('격식 있는 자리에 맞는 상의(드레스코드 충족)');
    } else { score -= 30; warnings.push('드레스코드에 비해 상의가 캐주얼합니다'); }
  }

  return { score: Math.max(0, Math.round(score)), reasons, warnings };
}
