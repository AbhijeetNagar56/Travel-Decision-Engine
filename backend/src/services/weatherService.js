import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  family: 4 // force IPv4
});

export const fetchWeather = async (capital) => {
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${capital}&count=1`,
    { httpsAgent }
  );

  if (!geoRes.data.results || geoRes.data.results.length === 0) {
    throw new Error(`Geocoding failed for ${capital}`);
  }

  const { latitude, longitude } = geoRes.data.results[0];

  const weatherRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
    { httpsAgent }
  );

  return {
    temperature: weatherRes.data.current.temperature_2m,
    lat: latitude,
    lon: longitude
  };
};