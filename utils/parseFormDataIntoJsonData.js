function parseFormData(inputData, keyToParse = "product_attributes") {
  const normalizedData = { ...inputData };

  // Check if a specific key contains a JSON string and try to parse it
  if (typeof normalizedData[keyToParse] === "string") {
    try {
      normalizedData[keyToParse] = JSON.parse(normalizedData[keyToParse]);
    } catch (error) {
      console.error(`Failed to parse ${keyToParse}:`, error);
    }
  }

  return normalizedData;
}

export default parseFormData;