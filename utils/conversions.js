// Utility to convert a query param into an array
export const toArray = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  return value.split(",").map((v) => v.trim());
};

// Utility to capitalize first letter of every word
export const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};
