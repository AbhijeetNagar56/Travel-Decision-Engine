import axios from "axios";

const API_KEY = process.env.OPENWEATHER_KEY;

export const fetchAQI = async (lat, lon) => {
  const res = await axios.get(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );

  return {
    aqi: res.data.list[0].main.aqi * 50
  };
};