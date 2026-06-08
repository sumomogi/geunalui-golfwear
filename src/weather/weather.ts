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

// OpenWeatherMap One Call 3.0 응답 → 해당 라운드 시간대(티오프~+5h)만 추출
interface OwmHour {
  dt: number; temp: number; wind_speed: number; uvi: number;
  humidity: number; pop: number;
}
interface OwmResponse { hourly: OwmHour[] }

export async function fetchWeather(
  lat: number, lon: number, dateISO: string, teeOff: string, apiKey: string,
): Promise<WeatherSnapshot> {
  const url = `https://api.openweathermap.org/data/3.0/onecall`
    + `?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,daily,alerts&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`);
  const data: OwmResponse = await res.json();

  const start = new Date(`${dateISO}T${teeOff}:00`).getTime() / 1000;
  const end = start + 5 * 3600;
  const hourly: HourlyWeather[] = data.hourly
    .filter(h => h.dt >= start && h.dt <= end)
    .map(h => ({
      time: new Date(h.dt * 1000).toISOString(),
      tempC: h.temp,
      precipProb: h.pop,
      windMs: h.wind_speed,
      uvIndex: h.uvi,
      humidity: h.humidity / 100,
    }));
  return snapshotFromHourly(hourly);
}
