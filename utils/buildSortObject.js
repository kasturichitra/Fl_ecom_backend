export const buildSortObject = (sortParam, defaultSort = { createdAt: -1 }) => {
  if (!sortParam || typeof sortParam !== "string") return defaultSort;

  const sortObj = {};
  const sortFields = sortParam.split(","); 
  // Example: ["price:asc", "createdAt:desc"]

  for (const item of sortFields) {
    const [field, direction] = item.split(":").map(v => v?.trim());

    if (!field) continue;

    // asc => 1, desc => -1
    const order = direction === "asc" ? 1 : -1;
    sortObj[field] = order;
  }

  // If nothing valid is parsed, return default
  return Object.keys(sortObj).length ? sortObj : defaultSort;
};
