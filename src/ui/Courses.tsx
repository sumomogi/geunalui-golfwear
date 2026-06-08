import { useEffect, useState } from 'react';
import { repository } from '../data/indexeddb-repository';
import type { Course } from '../domain/types';
import { Field, Rating, PrimaryButton } from './components';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState('');
  const [dressCodeLevel, setDress] = useState(3);
  const [terrain, setTerrain] = useState<'flat' | 'hilly'>('flat');
  const [scenery, setScenery] = useState('#3a7d44');

  const reload = () => repository.listCourses().then(setCourses);
  useEffect(() => { reload(); }, []);

  async function add() {
    if (!name.trim()) return;
    await repository.saveCourse({
      id: crypto.randomUUID(), name, dressCodeLevel, terrain, sceneryColors: [scenery],
    });
    setName('');
    reload();
  }

  return (
    <div>
      <h2>코스</h2>
      {courses.map(c => (
        <div key={c.id} style={{ background: '#fff', borderRadius: 10, padding: 12, marginBottom: 8,
          display: 'flex', justifyContent: 'space-between' }}>
          <span><b>{c.name}</b> · {c.terrain === 'hilly' ? '산악' : '평지'}</span>
          <span style={{ color: '#888' }}>드레스코드 {c.dressCodeLevel}
            <button onClick={async () => { await repository.deleteCourse(c.id); reload(); }}
              style={{ marginLeft: 8, border: 'none', background: 'none', color: '#c33' }}>삭제</button>
          </span>
        </div>
      ))}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginTop: 12 }}>
        <Field label="코스 이름"><input value={name} onChange={e => setName(e.target.value)} style={{ padding: 8 }} /></Field>
        <Field label="드레스코드 레벨"><Rating value={dressCodeLevel} onChange={setDress} /></Field>
        <Field label="지형">
          <select value={terrain} onChange={e => setTerrain(e.target.value as 'flat' | 'hilly')} style={{ padding: 8 }}>
            <option value="flat">평지</option><option value="hilly">산악</option>
          </select>
        </Field>
        <Field label="경관 색감"><input type="color" value={scenery} onChange={e => setScenery(e.target.value)} /></Field>
        <PrimaryButton onClick={add}>추가</PrimaryButton>
      </div>
    </div>
  );
}
