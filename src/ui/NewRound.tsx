import { useEffect, useState } from 'react';
import { repository } from '../data/indexeddb-repository';
import { fetchWeather } from '../weather/weather';
import type { Person, Course } from '../domain/types';
import { Field, PrimaryButton } from './components';

export default function NewRound({ onRecommend }: { onRecommend: (roundId: string) => void }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [date, setDate] = useState('');
  const [teeOff, setTeeOff] = useState('06:30');
  const [courseId, setCourseId] = useState('');
  const [companionIds, setCompanionIds] = useState<string[]>([]);
  const [lat, setLat] = useState('35.68');
  const [lon, setLon] = useState('139.76');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    repository.listPeople().then(setPeople);
    repository.listCourses().then(setCourses);
  }, []);

  function toggleCompanion(id: string) {
    setCompanionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function go() {
    if (loading) return;
    if (!date) { setErr('날짜를 선택하세요'); return; }
    setLoading(true); setErr('');
    const id = crypto.randomUUID();
    let weather;
    try {
      const key = import.meta.env.VITE_OWM_API_KEY as string;
      const w = await fetchWeather(Number(lat), Number(lon), date, teeOff, key);
      weather = w.hourly.length ? w : undefined;
    } catch {
      // 날씨 실패해도 라운드는 저장하고 진행(날씨 없이 추천)
      weather = undefined;
    }
    try {
      await repository.saveRound({
        id, date, teeOffTime: teeOff,
        courseId: courseId || undefined, companionIds, weather,
      });
    } catch {
      setErr('라운드 저장에 실패했습니다. 저장 공간을 확인하세요.');
      setLoading(false);
      return;
    }
    setLoading(false);
    onRecommend(id);
  }

  return (
    <div className="rise">
      <h2>라운드 만들기</h2>
      <div className="glass card">
        <Field label="날짜"><input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
        <Field label="티오프"><input type="time" value={teeOff} onChange={e => setTeeOff(e.target.value)} /></Field>
        <Field label="코스">
          <select value={courseId} onChange={e => setCourseId(e.target.value)}>
            <option value="">(선택 안 함)</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="위도 / 경도 (코스 위치)">
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={lat} onChange={e => setLat(e.target.value)} />
            <input value={lon} onChange={e => setLon(e.target.value)} />
          </div>
        </Field>
        <Field label="동반자">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {people.length === 0 && <span className="muted" style={{ fontSize: 13 }}>동반자 탭에서 먼저 등록하세요</span>}
            {people.map(p => (
              <button key={p.id} type="button" onClick={() => toggleCompanion(p.id)}
                className={companionIds.includes(p.id) ? 'chip-toggle on' : 'chip-toggle'}>{p.name}</button>
            ))}
          </div>
        </Field>
      </div>
      {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
      <PrimaryButton onClick={go} disabled={loading}>{loading ? '날씨 불러오는 중…' : '코디 추천받기'}</PrimaryButton>
    </div>
  );
}
