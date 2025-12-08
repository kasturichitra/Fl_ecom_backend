import ExcelJS from "exceljs";
import throwIfTrue from "../../utils/throwIfTrue.js";

export const generateExcelTemplate = (headers, dropdownData) => {
  throwIfTrue(!Array.isArray(headers) || !headers.length, "Headers must be a non empty array.");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Template");

  sheet.columns = headers;

  // Add empty row for default values
  sheet.addRow({});

  // Style header row
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = {
    wrapText: true,
    vertical: "bottom",
  };

  // // Insert default ID in 2nd row, 1st column
  // sheet.getRow(2).getCell(1).value = defaultId;

  // ------------------------------
  // ✅ Add dropdown to A2:A200 (WORKING)
  // ------------------------------
  // for (let row = 2; row <= 200; row++) {
  //   const cell = sheet.getCell(`A${row}`);
  //   cell.dataValidation = {
  //     type: "list",
  //     allowBlank: true,
  //     formulae: ['"value1,value2,value3"'], // dropdown values
  //   };
  // }
  // ------------------------------

  for (let row = 2; row <= 200; row++) {
    sheet.getCell(`A${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [dropdownData],
    };
  }
  return workbook;
};
