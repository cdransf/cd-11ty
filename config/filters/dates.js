export default {
  stringToRFC822Date: (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date)) return "";

    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    const formatter = new Intl.DateTimeFormat("en-GB", options);

    return formatter.format(date).replace(",", "");
  },
  stringToRFC3339: (dateString) => {
    const date = new Date(dateString);

    return isNaN(date) ? "" : date.toISOString();
  },
};
