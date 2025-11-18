import ExcelJS from "exceljs";
import { staticExcelHeaders } from "../Products/config/staticExcelHeaders.js";

/* ==========================================================
   0. HELPERS
========================================================== */

// Convert Excel header → internal DB key
const findStaticKey = (excelHeader) => staticExcelHeaders.find((h) => h.header === excelHeader)?.key || null;

// Is dynamic attribute column?
const isAttributeHeader = (header) => /^attr_/i.test(header);

// Normalize attribute code
const normalizeAttributeCode = (header) =>
  header
    .replace(/^attr_/i, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();

// Clean value (remove blanks, convert to number when possible)
const cleanValue = (v) => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") v = v.trim();
  if (v === "") return undefined;
  return isNaN(v) ? v : Number(v);
};

/* ==========================================================
   1. BUILD HEADER MAP
   Produces:  { dbKeyOrAttrKey: colIndex }
========================================================== */
const buildHeaderMap = (sheet) => {
  const headerMap = {};
  const headerRow = sheet.getRow(1);

  headerRow.eachCell((cell, col) => {
    const excelHeader = String(cell.value || "").trim();
    if (!excelHeader) return;

    const staticKey = findStaticKey(excelHeader);
    if (staticKey) {
      headerMap[staticKey] = col;
      return;
    }

    if (isAttributeHeader(excelHeader)) {
      const cleanKey = excelHeader.trim().replace(/\s+/g, "_");
      headerMap[cleanKey] = col;
    }
  });

  return headerMap;
};

/* ==========================================================
   2. EXTRACT — Read Excel rows into JSON
========================================================== */
export async function extractExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  const headerMap = buildHeaderMap(sheet);
  const rows = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const jsonRow = {};

    Object.entries(headerMap).forEach(([key, col]) => {
      jsonRow[key] = row.getCell(col).value ?? null;
    });

    rows.push({ rowNumber, raw: jsonRow });
  });

  return rows;
}

/* ==========================================================
   3. VALIDATE — Required fields + numeric
========================================================== */
export function validateRow(rawRow) {
  const errors = [];

  staticExcelHeaders.forEach(({ header, key }) => {
    if (!header.includes("*")) return;

    const v = rawRow[key];
    if (!v || String(v).trim() === "") {
      errors.push(`${header.replace("*", "").trim()} is required`);
    }
  });

  ["price", "stock_quantity", "min_order_limit", "max_order_limit"].forEach((field) => {
    if (rawRow[field] && isNaN(Number(rawRow[field]))) {
      errors.push(`${field} must be a number`);
    }
  });

  return errors;
}

/* ==========================================================
   4. TRANSFORM — Clean, convert, nest attr_ values
========================================================== */
export function transformRow(rawRow) {
  const transformed = {};
  const attributes = [];

  // Static fields
  staticExcelHeaders.forEach(({ key }) => {
    const cleaned = cleanValue(rawRow[key]);
    if (cleaned !== undefined) transformed[key] = cleaned;
  });

  // Dynamic attributes
  Object.keys(rawRow).forEach((k) => {
    if (!isAttributeHeader(k)) return;

    const cleaned = cleanValue(rawRow[k]);
    if (cleaned === undefined) return;

    attributes.push({
      attribute_code: normalizeAttributeCode(k),
      value: cleaned,
    });
  });

  if (attributes.length > 0) {
    transformed.product_attributes = attributes;
  }

  return transformed;
}
