import Dexie, { type Table } from 'dexie';
import type { ClothingItem, Person, Course, Round } from '../domain/types';

export class AppDB extends Dexie {
  items!: Table<ClothingItem, string>;
  people!: Table<Person, string>;
  courses!: Table<Course, string>;
  rounds!: Table<Round, string>;

  constructor() {
    super('geunalui-golfwear');
    this.version(1).stores({
      items: 'id, category',
      people: 'id',
      courses: 'id',
      rounds: 'id, date',
    });
  }
}

export const db = new AppDB();
