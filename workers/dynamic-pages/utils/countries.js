const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const getCountryName = (countryCode) =>
  regionNames.of(countryCode.trim()) || countryCode.trim();

export const parseCountryField = (countryField) => {
  if (!countryField) return null;
  const delimiters = [",", "/", "&", "and"];
  let countries = [countryField];
  delimiters.forEach(
    (delimiter) =>
      (countries = countries.flatMap((country) => country.split(delimiter)))
  );
  return countries.map(getCountryName).join(", ");
};
