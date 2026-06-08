import { useState, useEffect } from 'react';
import Wardrobe from './ui/Wardrobe';
import AddItem from './ui/AddItem';
import People from './ui/People';
import Courses from './ui/Courses';
import NewRound from './ui/NewRound';
import Recommendation from './ui/Recommendation';

type Route =
  | { name: 'wardrobe' } | { name: 'addItem' }
  | { name: 'people' } | { name: 'courses' }
  | { name: 'newRound' } | { name: 'result'; roundId: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'wardrobe' });

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.fontFamily =
      "'Pretendard JP', system-ui, sans-serif";
    document.body.style.background = '#f4f1ea';
  }, []);

  const tabs: { key: Route['name']; label: string }[] = [
    { key: 'wardrobe', label: '옷장' },
    { key: 'people', label: '동반자' },
    { key: 'courses', label: '코스' },
    { key: 'newRound', label: '라운드' },
  ];

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', paddingBottom: 64 }}>
      <main style={{ padding: 16 }}>
        {route.name === 'wardrobe' && <Wardrobe onAdd={() => setRoute({ name: 'addItem' })} />}
        {route.name === 'addItem' && <AddItem onDone={() => setRoute({ name: 'wardrobe' })} />}
        {route.name === 'people' && <People />}
        {route.name === 'courses' && <Courses />}
        {route.name === 'newRound' && (
          <NewRound onRecommend={id => setRoute({ name: 'result', roundId: id })} />
        )}
        {route.name === 'result' && (
          <Recommendation roundId={route.roundId} onBack={() => setRoute({ name: 'newRound' })} />
        )}
      </main>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto',
        display: 'flex', background: '#fff', borderTop: '1px solid #e0ddd5',
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setRoute({ name: t.key } as Route)}
            style={{
              flex: 1, padding: 14, border: 'none', background: 'none',
              fontWeight: route.name === t.key ? 700 : 400,
              color: route.name === t.key ? '#2f7d4f' : '#888',
            }}>{t.label}</button>
        ))}
      </nav>
    </div>
  );
}
