const ordinal = require("ordinal");
const dateNames = require("date-names");

exports.date_format = function (format, date) {
  return format.replace(/(yyyy|do|m{1,4}|d{1,4})/g, (_, formatMatch) => {
    if (formatMatch === "yyyy") {
      return date.getFullYear();
    }
    if (formatMatch === "do") {
      return ordinal(date.getDate());
    }
    if (formatMatch === "d") {
      return date.getDate();
    }
    if (formatMatch === "m") {
      return date.getMonth() + 1;
    }
    if (formatMatch === "mm") {
      console.log(dateNames.abbreviated_months);
      return dateNames.abbreviated_months[date.getMonth()];
    }
    if (formatMatch === "mmmm") {
      return dateNames.months[date.getMonth()];
    }
    if (formatMatch === "dddd") {
      return dateNames.days[date.getDay()];
    } else {
      return formatMatch;
    }
  });
};
