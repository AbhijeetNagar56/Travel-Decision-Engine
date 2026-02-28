import { NORMALIZATION_RANGES } from "../config/constants.js";

export const normalizePositive = (value, min, max) =>
  ((value - min) / (max - min)) * 100;

export const normalizeNegative = (value, min, max) =>
  ((max - value) / (max - min)) * 100;

export const temperatureScore = (temp) => {
  const { idealMin, idealMax } = NORMALIZATION_RANGES.temperature;

  if (temp >= idealMin && temp <= idealMax) return 100;

  const diff = Math.abs(temp - 22);
  return Math.max(0, 100 - diff * 5);
};