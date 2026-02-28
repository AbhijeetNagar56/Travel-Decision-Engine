export const getWeights = (riskTolerance, duration) => {
  let travelWeight = 0.33;
  let healthWeight = 0.33;
  let environmentWeight = 0.34;

  if (riskTolerance === "Low") {
    travelWeight += 0.1;
  }

  if (duration === "Long-term") {
    healthWeight += 0.15;
    travelWeight -= 0.05;
  }

  return {
    travelWeight,
    healthWeight,
    environmentWeight
  };
};