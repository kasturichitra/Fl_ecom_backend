import { generateInvoiceService } from "./invoiceService.js";

export const generateInvoiceController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: order_id } = req.params;
    const user_id = req?.user?._id;

    const pdfBuffer = await generateInvoiceService(tenantId, order_id, user_id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=invoice-${order_id}.pdf`);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Invoice generation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate invoice",
    });
  }
};
