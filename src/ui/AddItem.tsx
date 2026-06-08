import { useEffect, useRef, useState } from 'react';
import { repository } from '../data/indexeddb-repository';
import { processImage } from '../lib/image';
import { CATEGORIES, CATEGORY_LABEL, type Category, type ClothingItem } from '../domain/types';
import { Field, Rating, PrimaryButton } from './components';

export default function AddItem({ onDone }: { onDone: () => void }) {
  const [photo, setPhoto] = useState<Blob | undefined>();
  const [preview, setPreview] = useState<string>();
  const previewRef = useRef<string>();
  const [category, setCategory] = useState<Category>('top');
  const [color, setColor] = useState('#1f3a5f');
  const [warmth, setWarmth] = useState(3);
  const [formality, setFormality] = useState(3);
  const [breathability, setBreathability] = useState(3);
  const [waterproof, setWaterproof] = useState(false);
  const [uvProtection, setUvProtection] = useState(false);
  const [brand, setBrand] = useState('');

  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const blob = await processImage(f);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(blob);
    previewRef.current = url;
    setPhoto(blob);
    setPreview(url);
  }

  async function save() {
    const item: ClothingItem = {
      id: crypto.randomUUID(),
      photoBlob: photo, category, colors: [color],
      warmth, formality, breathability, waterproof, uvProtection,
      materials: [], brand: brand || undefined,
    };
    await repository.saveItem(item);
    onDone();
  }

  return (
    <div>
      <h2>옷 등록</h2>
      <Field label="사진">
        <input type="file" accept="image/*" onChange={onFile} />
      </Field>
      {preview && <img src={preview} alt="" style={{ width: 120, borderRadius: 10, marginBottom: 12 }} />}
      <Field label="종류">
        <select value={category} onChange={e => setCategory(e.target.value as Category)}
          style={{ padding: 8, borderRadius: 8 }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
      </Field>
      <Field label="대표 색"><input type="color" value={color} onChange={e => setColor(e.target.value)} /></Field>
      <Field label="보온성"><Rating value={warmth} onChange={setWarmth} /></Field>
      <Field label="격식"><Rating value={formality} onChange={setFormality} /></Field>
      <Field label="통풍성"><Rating value={breathability} onChange={setBreathability} /></Field>
      <Field label="방수">
        <input type="checkbox" checked={waterproof} onChange={e => setWaterproof(e.target.checked)} />
      </Field>
      <Field label="자외선 차단">
        <input type="checkbox" checked={uvProtection} onChange={e => setUvProtection(e.target.checked)} />
      </Field>
      <Field label="브랜드"><input value={brand} onChange={e => setBrand(e.target.value)} style={{ padding: 8 }} /></Field>
      <PrimaryButton onClick={save}>저장</PrimaryButton>
    </div>
  );
}
