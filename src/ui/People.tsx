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
    <div>
      <h2>동반자</h2>
      {people.map(p => (
        <div key={p.id} style={{ background: '#fff', borderRadius: 10, padding: 12, marginBottom: 8,
          display: 'flex', justifyContent: 'space-between' }}>
          <span><b>{p.name}</b> · {p.relationship}</span>
          <span style={{ color: '#888' }}>격식 {p.formalityExpectation}
            <button onClick={async () => { await repository.deletePerson(p.id); reload(); }}
              style={{ marginLeft: 8, border: 'none', background: 'none', color: '#c33' }}>삭제</button>
          </span>
        </div>
      ))}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginTop: 12 }}>
        <Field label="이름"><input value={name} onChange={e => setName(e.target.value)} style={{ padding: 8 }} /></Field>
        <Field label="관계">
          <input value={relationship} onChange={e => setRelationship(e.target.value)} style={{ padding: 8 }} />
        </Field>
        <Field label="격식 기대치"><Rating value={formalityExpectation} onChange={setFormality} /></Field>
        <PrimaryButton onClick={add}>추가</PrimaryButton>
      </div>
    </div>
  );
}
