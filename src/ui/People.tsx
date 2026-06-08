import { useEffect, useState } from 'react';
import { repository } from '../data/indexeddb-repository';
import type { Person } from '../domain/types';
import { Field, Rating, PrimaryButton } from './components';

export default function People() {
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('친구');
  const [formalityExpectation, setFormality] = useState(3);

  const reload = () => repository.listPeople().then(setPeople);
  useEffect(() => { reload(); }, []);

  async function add() {
    if (!name.trim()) return;
    await repository.savePerson({
      id: crypto.randomUUID(), name, relationship, formalityExpectation,
    });
    setName('');
    reload();
  }

  return (
    <div className="rise">
      <h2>동반자 <span className="count">{people.length}</span></h2>
      {people.map(p => (
        <div key={p.id} className="glass row">
          <span><b>{p.name}</b> · {p.relationship}</span>
          <span className="meta">격식 {p.formalityExpectation}
            <button className="del-btn"
              onClick={async () => { await repository.deletePerson(p.id); reload(); }}>삭제</button>
          </span>
        </div>
      ))}
      <div className="glass card" style={{ marginTop: 14 }}>
        <Field label="이름"><input value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="관계"><input value={relationship} onChange={e => setRelationship(e.target.value)} /></Field>
        <Field label="격식 기대치"><Rating value={formalityExpectation} onChange={setFormality} /></Field>
        <PrimaryButton onClick={add}>추가</PrimaryButton>
      </div>
    </div>
  );
}
