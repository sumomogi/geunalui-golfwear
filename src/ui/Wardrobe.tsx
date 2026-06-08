import { useEffect, useMemo, useState } from 'react';
import { repository } from '../data/indexeddb-repository';
import { CATEGORY_LABEL, type ClothingItem } from '../domain/types';
import { PrimaryButton } from './components';

export default function Wardrobe({ onAdd }: { onAdd: () => void }) {
  const [items, setItems] = useState<ClothingItem[]>([]);

  useEffect(() => { repository.listItems().then(setItems); }, []);

  const urls = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(it => { if (it.photoBlob) map.set(it.id, URL.createObjectURL(it.photoBlob)); });
    return map;
  }, [items]);

  useEffect(() => () => { urls.forEach(u => URL.revokeObjectURL(u)); }, [urls]);

  return (
    <div className="rise">
      <h2>옷장 <span className="count">{items.length}</span></h2>
      {items.length === 0 && (
        <p className="muted" style={{ marginBottom: 16 }}>아직 등록된 옷이 없어요. 아래에서 첫 옷을 등록해보세요.</p>
      )}
      <div className="grid">
        {items.map((it, i) => (
          <div key={it.id} className="glass tile rise" style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="img" style={{
              background: it.colors[0] ?? '#ddd',
              backgroundImage: urls.has(it.id) ? `url(${urls.get(it.id)})` : undefined,
            }} />
            <div className="cap">{CATEGORY_LABEL[it.category]}</div>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={onAdd}>+ 옷 등록</PrimaryButton>
    </div>
  );
}
