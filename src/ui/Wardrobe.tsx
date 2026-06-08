import { useEffect, useState } from 'react';
import { repository } from '../data/indexeddb-repository';
import { blobUrl } from '../lib/image';
import { CATEGORY_LABEL, type ClothingItem } from '../domain/types';
import { PrimaryButton } from './components';

export default function Wardrobe({ onAdd }: { onAdd: () => void }) {
  const [items, setItems] = useState<ClothingItem[]>([]);

  useEffect(() => { repository.listItems().then(setItems); }, []);

  return (
    <div>
      <h2>옷장 ({items.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {items.map(it => (
          <div key={it.id} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              aspectRatio: '1', background: it.colors[0] ?? '#ddd',
              backgroundSize: 'cover', backgroundPosition: 'center',
              backgroundImage: it.photoBlob ? `url(${blobUrl(it.photoBlob)})` : undefined,
            }} />
            <div style={{ fontSize: 11, padding: 4, color: '#555' }}>
              {CATEGORY_LABEL[it.category]}
            </div>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={onAdd}>+ 옷 등록</PrimaryButton>
    </div>
  );
}
