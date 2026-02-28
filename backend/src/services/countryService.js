import axios from "axios";

export const fetchCountryProfile = async (country) => {
  const rest = await axios.get(
    `https://restcountries.com/v3.1/name/${country}`
  );

  const data = rest.data[0];

  return {
    name: data.name.common,
    capital: data.capital?.[0],
    population: data.population,
    currency: Object.keys(data.currencies || {})[0]
  };
};