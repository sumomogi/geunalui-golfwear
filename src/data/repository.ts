import type { ClothingItem, Person, Course, Round } from '../domain/types';

export interface Repository {
  // ClothingItem
  listItems(): Promise<ClothingItem[]>;
  saveItem(item: ClothingItem): Promise<void>;
  deleteItem(id: string): Promise<void>;
  // Person
  listPeople(): Promise<Person[]>;
  savePerson(p: Person): Promise<void>;
  deletePerson(id: string): Promise<void>;
  // Course
  listCourses(): Promise<Course[]>;
  saveCourse(c: Course): Promise<void>;
  deleteCourse(id: string): Promise<void>;
  // Round
  listRounds(): Promise<Round[]>;
  saveRound(r: Round): Promise<void>;
  getRound(id: string): Promise<Round | undefined>;
}
