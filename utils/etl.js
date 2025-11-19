import ExcelJS from "exceljs";

/* =========================================================
   Build a dynamic header map from sheet + passed headers[]
   Supports:
   - Static headers: matched by "header"
   - Dynamic headers: attr_*
========================================================= */
function buildHeaderMap(sheet, excelHeaders) {
  const headerRow = sheet.getRow(1);
  const headerMap = {};

  headerRow.eachCell((cell, colNumber) => {
    const excelHeader = String(cell.value || "").trim();
    if (!excelHeader) return;

    // STATIC MATCH
    const match = excelHeaders.find(h => h.header === excelHeader);
    if (match) {
      headerMap[match.key] = colNumber;
      return;
    }

    // DYNAMIC ATTRIBUTES
    if (excelHeader.startsWith("attr_")) {
      const normalized = excelHeader.replace("*", "").trim().replace(/\s+/g, "_");
      headerMap[normalized] = colNumber;
    }
  });

  return headerMap;
}

/* =========================================================
   1. EXTRACT — no static dependency, fully dynamic
========================================================= */
export async function extractExcel(filePath, excelHeaders) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  const headerMap = buildHeaderMap(sheet, excelHeaders);

  const extracted = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const jsonRow = {};
    for (const key in headerMap) {
      const colIndex = headerMap[key];
      const value = row.getCell(colIndex).value;
      jsonRow[key] = value ?? null;
    }

    extracted.push({ rowNumber, raw: jsonRow });
  });

  return extracted;
}

/* =========================================================
   2. VALIDATE — fully dynamic based on excelHeaders metadata
========================================================= */
export function validateRow(rawRow, excelHeaders) {
  const errors = [];

  excelHeaders.forEach(h => {
    const val = rawRow[h.key];

    // REQUIRED logic
    if (h.required && (val === null || val === undefined || String(val).trim() === "")) {
      errors.push(`${h.header.replace("*", "")} is required`);
    }

    // TYPE = number
    if (h.type === "number" && val !== null && val !== undefined && isNaN(Number(val))) {
      errors.push(`${h.header} must be a number`);
    }
  });

  return errors;
}

/* =========================================================
   3. TRANSFORM — clean, minimal, metadata-driven
========================================================= */
export function transformRow(rawRow, excelHeaders) {
  const transformed = {};
  const productAttributes = [];

  // STATIC HEADERS (only those passed by user)
  excelHeaders.forEach(h => {
    let val = rawRow[h.key];

    // skip empty/null
    if (val === null || val === undefined) return;
    if (typeof val === "string" && val.trim() === "") return;

    if (typeof val === "string") val = val.trim();

    // If field type is number -> cast
    if (h.type === "number" && !isNaN(val)) val = Number(val);

    transformed[h.key] = val;
  });

  // DYNAMIC attr_ fields
  Object.entries(rawRow).forEach(([key, val]) => {
    if (!key.toLowerCase().startsWith("attr_")) return;
    if (val === null || val === undefined || val === "") return;

    if (typeof val === "string") val = val.trim();
    if (!isNaN(val)) val = Number(val);

    const attribute_code = key
      .slice(5)
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    productAttributes.push({ attribute_code, value: val });
  });

  if (productAttributes.length) {
    transformed.product_attributes = productAttributes;
  }

  return transformed;
}
