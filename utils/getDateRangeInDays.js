export const getDateRangeInDays = ({ from, to, year }) => {
  // fallback
  let days = 1;

  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);

    if (isNaN(start) || isNaN(end)) return 1;

    const diffMs = end - start;

    days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusive
  } else if (year) {
    const y = Number(year);

    // leap year check
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

    days = isLeap ? 366 : 365;
  }

  return Math.max(days, 1);
};
