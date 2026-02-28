import axios from "axios";

export const fetchCountryProfile = async (country) => {
  try {
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${country}?fullText=true`
    );

    const data = response.data[0];

    if (!data) {
      throw new Error("Country not found");
    }

    return {
      name: data.name.common,
      capital: data.capital?.[0],
      population: data.population,
      countryCode: data.cca2
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch country profile for ${country}`
    );
  }
};