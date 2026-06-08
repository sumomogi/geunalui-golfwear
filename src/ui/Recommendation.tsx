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

  if (!ready) return <p>추천 계산 중…</p>;

  if (!round) return (
    <p>
      라운드를 찾을 수 없습니다.{' '}
      <button onClick={onBack} style={{ border: 'none', background: 'none', color: '#2f7d4f' }}>← 라운드</button>
    </p>
  );

  return (
    <div>
      <button onClick={onBack} style={{ border: 'none', background: 'none', color: '#2f7d4f' }}>← 라운드</button>
      <h2>추천 코디</h2>

      {round?.weather && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, fontSize: 12 }}>
          <Chip>🌡 {Math.round(round.weather.minTempC)}°C → {Math.round(round.weather.maxTempC)}°C (일교차 {Math.round(round.weather.tempSwingC)}°C)</Chip>
          <Chip>🌧 강수 {Math.round(round.weather.maxPrecipProb * 100)}%</Chip>
          <Chip>💨 {round.weather.maxWindMs.toFixed(0)}m/s</Chip>
          <Chip>☀️ UV {round.weather.maxUvIndex.toFixed(0)}</Chip>
        </div>
      )}
      {!round?.weather && <p style={{ color: '#999' }}>날씨 정보 없음 — 코스/동반자 기준으로만 추천</p>}

      {outfits.length === 0 && (
        <p>추천할 코디가 없습니다. 옷장에 상의·하의를 더 등록하거나 드레스코드 조건을 확인하세요.</p>
      )}

      {outfits.map((o, idx) => (
        <div key={idx} style={{
          background: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
          border: idx === 0 ? '2px solid #2f7d4f' : '1px solid #ddd',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <b>추천 {idx + 1} · 적합도 {o.score}</b>
            {idx === 0 && <span style={{ fontSize: 11, background: '#2f7d4f', color: '#fff', borderRadius: 20, padding: '3px 10px' }}>BEST</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {o.items.map(it => (
              <div key={it.id} style={{
                width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                background: it.colors[0] ?? '#ddd', position: 'relative',
                backgroundImage: urls.has(it.id) ? `url(${urls.get(it.id)})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} title={CATEGORY_LABEL[it.category]}>
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
                  fontSize: 9, background: 'rgba(0,0,0,.5)', color: '#fff', textAlign: 'center' }}>
                  {CATEGORY_LABEL[it.category]}
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
            {o.reasons.map((r, i) => <div key={i}>✓ {r}</div>)}
            {o.warnings.map((w, i) => <div key={i} style={{ color: '#c60' }}>⚠ {w}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ background: '#fff', borderRadius: 8, padding: '4px 8px', color: '#444' }}>{children}</span>;
}
