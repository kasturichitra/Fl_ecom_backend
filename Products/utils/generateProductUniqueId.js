const generateProductUniqueId = async (DB, brand_unique_id) => {
  const latestElement = await DB.findOne({
    brand_unique_id: brand_unique_id,
  })
    .sort({ createdAt: -1 })
    .select("product_unique_id brand_name");

    console.log("latestElement", latestElement);
    console.log("Brand unique id", brand_unique_id);

  const prefix = latestElement["brand_name"].toUpperCase().split(3);
  console.log("Prefix", prefix);

  if (!latestElement) {
    const startNumber = "0001";
    return `${prefix}-${startNumber}`;
  }

  // Extract numeric part
  const parts = latestElement["product_unique_id"].split("-");
  const numeric = parts[1]; // e.g. "002" or "000543"
  const length = numeric.length; // preserve total digits

  const latestId = Number(numeric);
  const newId = latestId + 1;

  // Zero-pad
  const padded = String(newId).padStart(length, "0");

  return `${prefix}-${padded}`;
};

export default generateProductUniqueId;