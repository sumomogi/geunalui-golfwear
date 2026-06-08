import type { Repository } from './repository';
import type { ClothingItem, Person, Course, Round } from '../domain/types';
import { db } from './db';

export class IndexedDBRepository implements Repository {
  async listItems() { return db.items.toArray(); }
  async saveItem(item: ClothingItem) { await db.items.put(item); }
  async deleteItem(id: string) { await db.items.delete(id); }

  async listPeople() { return db.people.toArray(); }
  async savePerson(p: Person) { await db.people.put(p); }
  async deletePerson(id: string) { await db.people.delete(id); }

  async listCourses() { return db.courses.toArray(); }
  async saveCourse(c: Course) { await db.courses.put(c); }
  async deleteCourse(id: string) { await db.courses.delete(id); }

  async listRounds() { return db.rounds.orderBy('date').reverse().toArray(); }
  async saveRound(r: Round) { await db.rounds.put(r); }
  async getRound(id: string) { return db.rounds.get(id); }
}

export const repository: Repository = new IndexedDBRepository();
