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
    <div className="rise">
      <h2>코스 <span className="count">{courses.length}</span></h2>
      {courses.map(c => (
        <div key={c.id} className="glass row">
          <span><b>{c.name}</b> · {c.terrain === 'hilly' ? '산악' : '평지'}</span>
          <span className="meta">드레스코드 {c.dressCodeLevel}
            <button className="del-btn"
              onClick={async () => { await repository.deleteCourse(c.id); reload(); }}>삭제</button>
          </span>
        </div>
      ))}
      <div className="glass card" style={{ marginTop: 14 }}>
        <Field label="코스 이름"><input value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="드레스코드 레벨"><Rating value={dressCodeLevel} onChange={setDress} /></Field>
        <Field label="지형">
          <select value={terrain} onChange={e => setTerrain(e.target.value as 'flat' | 'hilly')}>
            <option value="flat">평지</option><option value="hilly">산악</option>
          </select>
        </Field>
        <Field label="경관 색감"><input type="color" value={scenery} onChange={e => setScenery(e.target.value)} /></Field>
        <PrimaryButton onClick={add}>추가</PrimaryButton>
      </div>
    </div>
  );
}
