import { describe, it, expect } from 'vitest';
import { MemoryRepository } from './memory-repository';
import type { ClothingItem } from '../domain/types';

const sample: ClothingItem = {
  id: '1', category: 'top', colors: ['#000'], warmth: 3, formality: 3,
  waterproof: false, uvProtection: false, breathability: 3, materials: [],
};

describe('MemoryRepository', () => {
  it('아이템 저장 후 조회', async () => {
    const repo = new MemoryRepository();
    await repo.saveItem(sample);
    expect(await repo.listItems()).toHaveLength(1);
  });

  it('같은 id 저장은 덮어쓰기(upsert)', async () => {
    const repo = new MemoryRepository();
    await repo.saveItem(sample);
    await repo.saveItem({ ...sample, warmth: 5 });
    const items = await repo.listItems();
    expect(items).toHaveLength(1);
    expect(items[0].warmth).toBe(5);
  });

  it('삭제', async () => {
    const repo = new MemoryRepository();
    await repo.saveItem(sample);
    await repo.deleteItem('1');
    expect(await repo.listItems()).toHaveLength(0);
  });
});
