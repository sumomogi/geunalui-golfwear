import type { Repository } from './repository';
import type { ClothingItem, Person, Course, Round } from '../domain/types';

function upsert<T extends { id: string }>(arr: T[], v: T): void {
  const i = arr.findIndex(x => x.id === v.id);
  if (i >= 0) arr[i] = v; else arr.push(v);
}

export class MemoryRepository implements Repository {
  private items: ClothingItem[] = [];
  private people: Person[] = [];
  private courses: Course[] = [];
  private rounds: Round[] = [];

  async listItems() { return [...this.items]; }
  async saveItem(item: ClothingItem) { upsert(this.items, item); }
  async deleteItem(id: string) { this.items = this.items.filter(i => i.id !== id); }

  async listPeople() { return [...this.people]; }
  async savePerson(p: Person) { upsert(this.people, p); }
  async deletePerson(id: string) { this.people = this.people.filter(p => p.id !== id); }

  async listCourses() { return [...this.courses]; }
  async saveCourse(c: Course) { upsert(this.courses, c); }
  async deleteCourse(id: string) { this.courses = this.courses.filter(c => c.id !== id); }

  async listRounds() { return [...this.rounds]; }
  async saveRound(r: Round) { upsert(this.rounds, r); }
  async getRound(id: string) { return this.rounds.find(r => r.id === id); }
}
