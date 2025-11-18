import ExcelJS from "exceljs";
import { staticExcelHeaders } from "../Products/config/staticExcelHeaders.js";

/* ----------------------------------------------------------
   Build header map for:
   - Static headers: map Excel header → static key
   - Dynamic headers: attr_* → attr_*
---------------------------------------------------------- */
function buildHeaderMap(sheet) {
  const headerRow = sheet.getRow(1);
  const headerMap = {}; // final map: key → column index

  headerRow.eachCell((cell, colNumber) => {
    const excelHeader = String(cell.value || "").trim();

    if (!excelHeader) return;

    // 1️⃣ STATIC HEADERS: match by "header" field
    const staticMatch = staticExcelHeaders.find((h) => h.header === excelHeader);

    if (staticMatch) {
      headerMap[staticMatch.key] = colNumber;
      return;
    }

    // 2️⃣ DYNAMIC ATTRIBUTES: prefix attr_
    if (excelHeader.startsWith("attr_")) {
      headerMap[excelHeader.replace("*", "").trim().replaceAll(" ", "_")] = colNumber;
      return;
    }
  });

  return headerMap;
}

/* ----------------------------------------------------------
   1. EXTRACT — Read Excel → JSON rows
   Extracts BOTH static keys + dynamic attr_ keys
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

    for (const key in headerMap) {
      const colIndex = headerMap[key];
      const value = row.getCell(colIndex).value;
      jsonRow[key] = value ?? null;
    }

    extracted.push({
      rowNumber,
      raw: jsonRow,
    });
  });

  return extracted;
}
/* ----------------------------------------------------------
   2. VALIDATE — Auto validate required (*) fields
---------------------------------------------------------- */
export function validateRow(rawRow) {
  const errors = [];

  staticExcelHeaders.forEach((h) => {
    if (h.header.includes("*")) {
      if (!rawRow[h.key] || rawRow[h.key].toString().trim() === "") {
        errors.push(`${h.header.replace("*", "").trim()} is required`);
      }
    }
  });

  // Optional: Numeric fields auto-check
  const numeric = ["price", "stock_quantity", "min_order_limit", "max_order_limit"];
  numeric.forEach((field) => {
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
  const productAttributes = [];

  // 1) Process only the static keys (defined in config)
  // This ensures you don't accidentally carry unknown/extra Excel columns
  staticExcelHeaders.forEach((h) => {
    const key = h.key; // db key from config
    let value = rawRow[key]; // rawRow uses keys produced by extractExcel

    // skip absent / null / empty values entirely
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;

    // normalize string values
    if (typeof value === "string") value = value.trim();

    // numeric conversion (simple heuristic)
    if (!isNaN(value) && value !== "") {
      value = Number(value);
    }

    transformed[key] = value;
  });

  // 2) Extract dynamic attributes from rawRow (any keys that start with attr_, case-insensitive)
  // Note: these attr keys are not part of staticExcelHeaders
  Object.keys(rawRow).forEach((rawKey) => {
    if (!rawKey) return;

    // match attr_ prefix (case-insensitive)
    const m = rawKey.match(/^attr_(.+)/i);
    if (!m) return;

    let attrValue = rawRow[rawKey];
    if (attrValue === null || attrValue === undefined) return;
    if (typeof attrValue === "string" && attrValue.trim() === "") return;

    if (typeof attrValue === "string") attrValue = attrValue.trim();
    if (!isNaN(attrValue) && attrValue !== "") attrValue = Number(attrValue);

    const attributeCode = m[1] // the part after attr_
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    productAttributes.push({
      attribute_code: attributeCode,
      value: attrValue,
    });
  });

  if (productAttributes.length > 0) {
    transformed.product_attributes = productAttributes;
  }
  
  return transformed;
}
