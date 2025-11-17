import ExcelJS from "exceljs";
import throwIfTrue from "../../utils/throwIfTrue.js";

export const generateExcelTemplate = (headers) => {
  throwIfTrue(!Array.isArray(headers) || !headers.length, "Headers must be a non empty array.");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Template");

  sheet.columns = headers;

  sheet.addRow({}); // empty row

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = {
    wrapText: true, 
    vertical: "bottom"
  }

  return workbook;
};
