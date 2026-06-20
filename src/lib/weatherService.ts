interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    rain: number[];
  };
}

export type WeatherByDateHour = Map<string, Map<number, { rain: number; temperature: number }>>;

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
): Promise<WeatherByDateHour> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("hourly", "temperature_2m,rain");
  url.searchParams.set("timezone", "America/Sao_Paulo");
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Weather API unavailable");
  const data: OpenMeteoResponse = await res.json();

  const result: WeatherByDateHour = new Map();
  for (let i = 0; i < data.hourly.time.length; i++) {
    const [date, time] = data.hourly.time[i].split("T");
    const hour = parseInt(time.slice(0, 2), 10);
    if (!result.has(date)) result.set(date, new Map());
    result.get(date)!.set(hour, {
      rain: data.hourly.rain[i] ?? 0,
      temperature: data.hourly.temperature_2m[i] ?? 0,
    });
  }
  return result;
}

export function getWeatherAlert(
  weather: WeatherByDateHour,
  date: string,
  suggestedTime: string | null,
  isOutdoor: boolean,
): string | null {
  // Indoor attractions don't depend on weather
  if (!isOutdoor) return null;

  const dayWeather = weather.get(date);
  if (!dayWeather) return null;

  const baseHour = suggestedTime ? parseInt(suggestedTime.slice(0, 2), 10) : 12;
  let maxRain = 0;
  let totalTemp = 0;
  let tempCount = 0;
  for (let offset = 0; offset < 3; offset++) {
    const hw = dayWeather.get((baseHour + offset) % 24);
    if (hw) {
      if (hw.rain > maxRain) maxRain = hw.rain;
      totalTemp += hw.temperature;
      tempCount++;
    }
  }
  const avgTemp = tempCount > 0 ? totalTemp / tempCount : null;

  if (maxRain >= 5) return "Chuva intensa prevista — considere reagendar esta visita ao ar livre.";
  if (maxRain >= 2) return "Chuva forte prevista — leve guarda-chuva para esta atração ao ar livre.";
  if (maxRain >= 0.5) return `Chuva fraca prevista (${avgTemp?.toFixed(0) ?? "?"}°C) — leve guarda-chuva.`;

  if (avgTemp !== null) {
    if (avgTemp < 5) return `Temperatura muito baixa prevista (${avgTemp.toFixed(0)}°C) — agasalhe-se bem para esta atração ao ar livre.`;
    if (avgTemp < 10) return `Frio intenso previsto (${avgTemp.toFixed(0)}°C) — use roupas quentes, local ao ar livre.`;
    if (avgTemp < 15) return `Clima frio previsto (${avgTemp.toFixed(0)}°C) — leve casaco para esta atração ao ar livre.`;
  }

  return null;
}
