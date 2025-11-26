function generateNextOrderId(lastOrderId) {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  const dateString = `${day}${month}${year}`; // DDMMYYYY

  let nextSeq = 1;

  // If last order exists → extract sequence & increment
  if (lastOrderId) {
    const lastParts = lastOrderId.split("-");  // ["OD", "01122025", "00000000123"]
    const lastSeq = parseInt(lastParts[2], 10); // convert "00000000123" → 123
    nextSeq = lastSeq + 1;
  }

  const seqString = String(nextSeq).padStart(6, "0"); // 6 digits

  return `OD-${dateString}-${seqString}`;
}

export default generateNextOrderId;