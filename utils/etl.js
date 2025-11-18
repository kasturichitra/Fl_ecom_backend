import ExcelJS from "exceljs";
import { staticExcelHeaders } from "../Products/config/staticExcelHeaders.js";

/* ----------------------------------------------------------
   Build header map: Excel column → DB key
---------------------------------------------------------- */
function buildHeaderMap(sheet) {
  const excelHeaders = sheet.getRow(1).values; // 1-indexed
  const headerMap = {};

  staticExcelHeaders.forEach(h => {
    const colIndex = excelHeaders.findIndex(v => v === h.header);
    if (colIndex === -1) {
      throw new Error(`Missing required column in Excel: "${h.header}"`);
    }
    headerMap[h.key] = colIndex;
  });

  return headerMap;
}

/* ----------------------------------------------------------
   1. EXTRACT — Read Excel → JSON rows
---------------------------------------------------------- */
export async function extractExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  const headerMap = buildHeaderMap(sheet);

  const extracted = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const jsonRow = {};
    for (const { key } of staticExcelHeaders) {
      jsonRow[key] = row.getCell(headerMap[key]).value ?? null;
    }

    extracted.push({ rowNumber, raw: jsonRow });
  });

  return extracted;
}

/* ----------------------------------------------------------
   2. VALIDATE — Auto validate required (*) fields
---------------------------------------------------------- */
export function validateRow(rawRow) {
  const errors = [];

  staticExcelHeaders.forEach(h => {
    if (h.header.includes("*")) {
      if (!rawRow[h.key] || rawRow[h.key].toString().trim() === "") {
        errors.push(`${h.header.replace("*", "").trim()} is required`);
      }
    }
  });

  // Optional: Numeric fields auto-check
  const numeric = ["price", "stock_quantity", "min_order_limit", "max_order_limit"];
  numeric.forEach(field => {
    if (rawRow[field] && isNaN(Number(rawRow[field]))) {
      errors.push(`${field} must be a number`);
    }
  });

  return errors;
}

/* ----------------------------------------------------------
   3. TRANSFORM — Convert types, trim strings
---------------------------------------------------------- */
export function transformRow(rawRow) {
  const transformed = {};

  staticExcelHeaders.forEach(h => {
    let value = rawRow[h.key];

    if (typeof value === "string") value = value.trim();
    if (value === "") value = null;

    // Number conversion
    if (value !== null && value !== "" && !isNaN(value)) {
      value = Number(value);
    }

    transformed[h.key] = value;
  });

  transformed.createdAt = new Date();
  return transformed;
}