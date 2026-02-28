import express from "express";
import { v4 as uuidv4 } from "uuid";
import { fetchCountryProfile } from "../services/countryService.js";
import { fetchWeather } from "../services/weatherService.js";
import { fetchAQI } from "../services/aqiService.js";
import { getWeights } from "../scoring/weightingEngine.js";
import {
  normalizeNegative,
  temperatureScore
} from "../scoring/normalization.js";
import { getCached, setCache } from "../cache/memoryCache.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const requestId = uuidv4();
  const { countries, riskTolerance, duration } = req.body;

  const weights = getWeights(riskTolerance, duration);

  const results = await Promise.all(
    countries.map(async (country) => {
      const cached = getCached(country);
      if (cached) return cached;

      const profile = await fetchCountryProfile(country);
      const weather = await fetchWeather(profile.capital);
      const aqi = await fetchAQI(weather.lat, weather.lon);

      const aqiScore = normalizeNegative(aqi.aqi, 0, 300);
      const tempScore = temperatureScore(weather.temperature);

      const travelRisk =
        aqiScore * 0.4 + tempScore * 0.3 + 70 * 0.3;

      const result = {
        country,
        scores: {
          travelRisk,
          healthInfrastructure: 70,
          environmentalStability: (aqiScore + tempScore) / 2
        }
      };

      setCache(country, result);

      return result;
    })
  );

  const ranked = results.sort(
    (a, b) => b.scores.travelRisk - a.scores.travelRisk
  );

  res.json({
    metadata: {
      requestId,
      riskTolerance,
      duration
    },
    ranking: ranked
  });
});

export default router;