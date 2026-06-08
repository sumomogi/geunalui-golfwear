import { useEffect, useMemo, useState } from 'react';
import { repository } from '../data/indexeddb-repository';
import { recommend } from '../domain/recommend';
import { CATEGORY_LABEL, type Outfit, type RoundContext, type Round } from '../domain/types';

export default function Recommendation(
  { roundId, onBack }: { roundId: string; onBack: () => void },
) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [round, setRound] = useState<Round>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const r = await repository.getRound(roundId);
      if (!active) return;
      if (!r) { setReady(true); return; }
      setRound(r);
      const [items, courses, people] = await Promise.all([
        repository.listItems(), repository.listCourses(), repository.listPeople(),
      ]);
      if (!active) return;
      const ctx: RoundContext = {
        weather: r.weather,
        course: courses.find(c => c.id === r.courseId),
        companions: people.filter(p => r.companionIds.includes(p.id)),
      };
      setOutfits(recommend(items, ctx));
      setReady(true);
    })();
    return () => { active = false; };
  }, [roundId]);

  const urls = useMemo(() => {
    const map = new Map<string, string>();
    outfits.forEach(o => o.items.forEach(it => {
      if (it.photoBlob && !map.has(it.id)) map.set(it.id, URL.createObjectURL(it.photoBlob));
    }));
    return map;
  }, [outfits]);

  useEffect(() => () => { urls.forEach(u => URL.revokeObjectURL(u)); }, [urls]);

  if (!ready) return <p className="muted">추천 계산 중…</p>;

  if (!round) return (
    <p>라운드를 찾을 수 없습니다.{' '}
      <button className="link-btn" onClick={onBack}>← 라운드</button>
    </p>
  );

  return (
    <div className="rise">
      <button className="link-btn" onClick={onBack}>← 라운드</button>
      <h2 style={{ marginTop: 8 }}>추천 코디</h2>

      {round.weather && (
        <div className="wchips">
          <span className="wchip">🌡 {Math.round(round.weather.minTempC)}°C → {Math.round(round.weather.maxTempC)}°C (일교차 {Math.round(round.weather.tempSwingC)}°C)</span>
          <span className="wchip">🌧 강수 {Math.round(round.weather.maxPrecipProb * 100)}%</span>
          <span className="wchip">💨 {round.weather.maxWindMs.toFixed(0)}m/s</span>
          {round.weather.maxUvIndex > 0 && <span className="wchip">☀️ UV {round.weather.maxUvIndex.toFixed(0)}</span>}
        </div>
      )}
      {!round.weather && <p className="muted">날씨 정보 없음 — 코스·동반자 기준으로만 추천</p>}

      {outfits.length === 0 && (
        <p className="muted">추천할 코디가 없습니다. 옷장에 상의·하의를 더 등록하거나 드레스코드 조건을 확인하세요.</p>
      )}

      {outfits.map((o, idx) => (
        <div key={idx} className={idx === 0 ? 'glass outfit best rise' : 'glass outfit rise'}
          style={{ animationDelay: `${idx * 0.06}s` }}>
          <div className="outfit-head">
            <b>추천 {idx + 1} · 적합도 {o.score}</b>
            {idx === 0 && <span className="best-badge">BEST</span>}
          </div>
          <div className="flatlay">
            {o.items.map(it => (
              <div key={it.id} className="piece" title={CATEGORY_LABEL[it.category]}
                style={{
                  background: it.colors[0] ?? '#ddd',
                  backgroundImage: urls.has(it.id) ? `url(${urls.get(it.id)})` : undefined,
                }}>
                <span>{CATEGORY_LABEL[it.category]}</span>
              </div>
            ))}
          </div>
          <div className="reasons">
            {o.reasons.map((r, i) => <div key={i} className="ok">✓ {r}</div>)}
            {o.warnings.map((w, i) => <div key={i} className="warn">⚠ {w}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}
