import type { HourlyWeather, WeatherSnapshot } from '../domain/types';

export function snapshotFromHourly(hourly: HourlyWeather[]): WeatherSnapshot {
  if (hourly.length === 0) {
    return {
      hourly: [], minTempC: 0, maxTempC: 0, tempSwingC: 0,
      maxPrecipProb: 0, maxWindMs: 0, maxUvIndex: 0, avgHumidity: 0,
    };
  }
  const temps = hourly.map(h => h.tempC);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  return {
    hourly,
    minTempC: min,
    maxTempC: max,
    tempSwingC: max - min,
    maxPrecipProb: Math.max(...hourly.map(h => h.precipProb)),
    maxWindMs: Math.max(...hourly.map(h => h.windMs)),
    maxUvIndex: Math.max(...hourly.map(h => h.uvIndex)),
    avgHumidity: hourly.reduce((s, h) => s + h.humidity, 0) / hourly.length,
  };
}

// OpenWeatherMap 5일/3시간 예보(무료 플랜) 응답 → 라운드 시간대(티오프~+5h)만 추출.
// 무료 플랜에는 자외선(UV) 정보가 없어 uvIndex는 0으로 둔다(엔진의 UV 규칙은 자동 비활성).
// 예보 범위는 5일 — 그 이후 날짜는 빈 결과가 되어 호출부에서 "날씨 없이 추천"으로 처리된다.
interface OwmForecastEntry {
  dt: number;
  main: { temp: number; humidity: number };
  wind: { speed: number };
  pop?: number;
}
interface OwmForecastResponse { list: OwmForecastEntry[] }

export async function fetchWeather(
  lat: number, lon: number, dateISO: string, teeOff: string, apiKey: string,
): Promise<WeatherSnapshot> {
  const url = `https://api.openweathermap.org/data/2.5/forecast`
    + `?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`);
  const data: OwmForecastResponse = await res.json();

  const start = new Date(`${dateISO}T${teeOff}:00`).getTime() / 1000;
  const end = start + 5 * 3600;
  const hourly: HourlyWeather[] = data.list
    .filter(e => e.dt >= start && e.dt <= end)
    .map(e => ({
      time: new Date(e.dt * 1000).toISOString(),
      tempC: e.main.temp,
      precipProb: e.pop ?? 0,
      windMs: e.wind.speed,
      uvIndex: 0,
      humidity: e.main.humidity / 100,
    }));
  return snapshotFromHourly(hourly);
}
