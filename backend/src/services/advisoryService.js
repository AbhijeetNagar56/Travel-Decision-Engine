import axios from "axios";

export const fetchAdvisory = async (countryCode) => {
  try {
    const res = await axios.get(
      `https://www.travel-advisory.info/api?countrycode=${countryCode}`
    );

    const score =
      res.data.data[countryCode]?.advisory?.score || null;

    return {
      advisoryScore: score
    };
  } catch (error) {
    console.error("Advisory API failed:", error.message);
    return { advisoryScore: null };
  }
};