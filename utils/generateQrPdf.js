import { jsPDF } from "jspdf";
import { generateQRCodeBase64 } from "./generateQrCode.js";

export const generateQrPdfBuffer = async ({
  product_name,
  product_unique_id,
  quantity = 1,
  final_price,
  category_name,
  brand_name,
  product_color, 
}) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a6",
  });

  const qrData = JSON.stringify({
    product_unique_id,
    product_name,
    final_price,
    category_name,
    brand_name,
    product_color,
    link: `http://10.1.1.121:5174/product/${product_unique_id}`,
  });

  // const qrData = `http://10.1.1.121:5174/product/${product_unique_id}`;

  // Generate QR ONCE (important for performance)
  const qrImage = await generateQRCodeBase64(qrData);

  for (let i = 0; i < quantity; i++) {
    if (i !== 0) pdf.addPage(); // add new A6 page

    // Product name
    pdf.setFontSize(12);
    pdf.text(product_name, 10, 15);

    // QR code
    pdf.addImage(qrImage, "PNG", 20, 20, 65, 65);

    // Footer
    pdf.setFontSize(8);
    // pdf.text(`ID: ${product_unique_id}`, 10, 95);
    pdf.text(`Sticker ${i + 1} of ${quantity}`, 10, 100);
  }

  return Buffer.from(pdf.output("arraybuffer"));
};
