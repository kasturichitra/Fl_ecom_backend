// Generate Unique ID used for industries and categories

const generateUniqueId = async (Db, prefix, key) => {
  const latestElement = await Db.findOne()
    .sort({ createdAt: -1 })
    .select(key);

  console.log("latestElement", latestElement);

  // If no previous element → start at 000001
  if (!latestElement) {
    const startNumber = "0001";
    return `${prefix}-${startNumber}`;
  }

  // Extract numeric part
  const parts = latestElement[key].split("-");
  const numeric = parts[1];          // e.g. "002" or "000543"
  const length = numeric.length;     // preserve total digits

  const latestId = Number(numeric);
  const newId = latestId + 1;

  // Zero-pad
  const padded = String(newId).padStart(length, "0");

  return `${prefix}-${padded}`;
};


export default generateUniqueId;
