export type Category =
  | 'top' | 'bottom' | 'outer' | 'midlayer' | 'hat' | 'shoes' | 'accessory';

export const CATEGORIES: Category[] =
  ['top', 'bottom', 'outer', 'midlayer', 'hat', 'shoes', 'accessory'];

export const CATEGORY_LABEL: Record<Category, string> = {
  top: '상의', bottom: '하의', outer: '아우터', midlayer: '미드레이어',
  hat: '모자', shoes: '신발', accessory: '소품',
};

export interface ClothingItem {
  id: string;
  photoBlob?: Blob;
  category: Category;
  colors: string[];        // hex 문자열
  warmth: number;          // 1-5
  formality: number;       // 1-5 (캐주얼→격식)
  waterproof: boolean;
  uvProtection: boolean;
  breathability: number;   // 1-5
  materials: string[];
  brand?: string;
  notes?: string;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  formalityExpectation: number; // 1-5
  notes?: string;
}

export interface Course {
  id: string;
  name: string;
  dressCodeLevel: number;  // 1-5
  sceneryColors: string[]; // hex
  terrain: 'flat' | 'hilly';
  notes?: string;
}

export interface HourlyWeather {
  time: string;       // ISO
  tempC: number;
  precipProb: number; // 0-1
  windMs: number;
  uvIndex: number;
  humidity: number;   // 0-1
}

export interface WeatherSnapshot {
  hourly: HourlyWeather[];
  minTempC: number;
  maxTempC: number;
  tempSwingC: number;
  maxPrecipProb: number;
  maxWindMs: number;
  maxUvIndex: number;
  avgHumidity: number;
}

export interface Round {
  id: string;
  date: string;        // ISO date (YYYY-MM-DD)
  teeOffTime: string;  // "06:30"
  courseId?: string;
  companionIds: string[];
  weather?: WeatherSnapshot;
}

export interface RoundContext {
  weather?: WeatherSnapshot;
  course?: Course;
  companions: Person[];
}

export interface Outfit {
  items: ClothingItem[];
  score: number;       // 0-100
  reasons: string[];
  warnings: string[];
}
