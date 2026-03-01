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

import {
  getCached,
  setCache,
  getCacheSize
} from "../cache/memoryCache.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();
  const { countries, riskTolerance, duration } = req.body;

  if (!countries || countries.length < 1) {
    return res.status(400).json({
      error: "At least 1 country required"
    });
  }

  let cacheHits = 0;
  let newComputations = 0;

  try {
    const weights = getWeights(riskTolerance, duration);

    const results = await Promise.all(
      countries.map(async (country) => {
        const cacheKey = `${country}-${riskTolerance}-${duration}`;

        try {
          // 🔹 Check Cache
          const cached = getCached(cacheKey);
          if (cached) {
            cacheHits++;
            return cached;
          }

          newComputations++;

          // 🔹 Fetch Data
          const profile = await fetchCountryProfile(country);
          const weather = await fetchWeather(profile.capital);
          const aqi = await fetchAQI(weather.lat, weather.lon);

          // 🔹 Normalize Factors
          const aqiScore = normalizeNegative(aqi.aqi, 0, 300);
          const tempScore = temperatureScore(weather.temperature);

          // Travel Risk (higher = worse)
          const travelRisk =
            aqiScore * 0.4 +
            tempScore * 0.3 +
            70 * 0.3;

          // Convert risk → safety (higher = better)
          const travelSafety = 100 - travelRisk;

          // Environmental Stability (positive factor)
          const environmentalStability =
            (aqiScore + tempScore) / 2;

          // Health Infrastructure (placeholder positive)
          const healthInfrastructure = 70;

          // Final Overall Score (higher = better)
          const overall =
            travelSafety * weights.travelWeight +
            healthInfrastructure * weights.healthWeight +
            environmentalStability * weights.environmentWeight;

          const result = {
            country,
            scores: {
              travelRisk: Number(travelRisk.toFixed(2)), // kept for frontend
              healthInfrastructure,
              environmentalStability: Number(
                environmentalStability.toFixed(2)
              ),
              overall: Number(overall.toFixed(2))
            }
          };

          // 🔹 Store in Cache
          setCache(cacheKey, result);

          return result;

        } catch (err) {
          console.error(`Error processing ${country}:`, err.message);

          return {
            country,
            error: "Country not defined or data unavailable"
          };
        }
      })
    );

    // 🔹 Separate Success & Failed
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    const ranked = successful.sort(
      (a, b) => b.scores.overall - a.scores.overall
    );

    const finalResults = [...ranked, ...failed];

    const executionTimeMs = Date.now() - startTime;

    res.json({
      metadata: {
        requestId,
        riskTolerance,
        duration,
        totalCountriesRequested: countries.length,
        cacheHits,
        newComputations,
        currentCacheSize: getCacheSize(),
        executionTimeMs
      },
      ranking: finalResults
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