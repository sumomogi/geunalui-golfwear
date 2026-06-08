import { useState } from 'react';
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

  const tabs: { key: Route['name']; label: string }[] = [
    { key: 'wardrobe', label: '옷장' },
    { key: 'people', label: '동반자' },
    { key: 'courses', label: '코스' },
    { key: 'newRound', label: '라운드' },
  ];

  return (
    <div className="app">
      <main key={route.name}>
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
      <nav className="tabbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setRoute({ name: t.key } as Route)}
            className={route.name === t.key ? 'on' : ''}>{t.label}</button>
        ))}
      </nav>
    </div>
  );
}
