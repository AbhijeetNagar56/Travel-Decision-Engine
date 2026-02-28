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

  if (!countries || countries.length < 1) {
    return res.status(400).json({
      error: "At least 1 country required"
    });
  }

  try {
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
          aqiScore * 0.4 +
          tempScore * 0.3 +
          70 * 0.3; // fixed health placeholder

        const environmentalStability =
          (aqiScore + tempScore) / 2;

        const overall =
          travelRisk * weights.travelWeight +
          70 * weights.healthWeight +
          environmentalStability * weights.environmentWeight;

        const result = {
          country,
          scores: {
            travelRisk: Number(travelRisk.toFixed(2)),
            healthInfrastructure: 70,
            environmentalStability: Number(
              environmentalStability.toFixed(2)
            ),
            overall: Number(overall.toFixed(2))
          }
        };

        setCache(country, result);

        return result;
      })
    );

    const ranked = results.sort(
      (a, b) => b.scores.overall - a.scores.overall
    );

    res.json({
      metadata: {
        requestId,
        riskTolerance,
        duration
      },
      ranking: ranked
    });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message
    });
  }
});

export default router;