import axios from "axios";

const API_KEY = process.env.OPENWEATHER_KEY;

export const fetchWeather = async (capital) => {
  const res = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${API_KEY}`
  );

  return {
    temperature: res.data.main.temp,
    humidity: res.data.main.humidity,
    lat: res.data.coord.lat,
    lon: res.data.coord.lon
  };
};