export const isValidDateString = (dateStr) => {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};
