import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  family: 4
});

export const fetchAQI = async (lat, lon) => {
  const res = await axios.get(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`,
    { httpsAgent }
  );

  return {
    aqi: res.data.current.us_aqi || 100
  };
};