import puppeteer from "puppeteer";
import { generateInvoiceTemplate } from "../utils/generateInvoiceTemplate.js";
import { getTenantModels } from "../../lib/tenantModelsCache.js";
import throwIfTrue from "../../utils/throwIfTrue.js";

export const generateInvoiceService = async (tenantId, orderId, user_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!orderId, "Order ID is required");
  const { orderModelDB, businessModelDB, contactInfoModelDB } = await getTenantModels(tenantId);

  const order = await orderModelDB.findOne({ order_id: orderId }).lean();
  throwIfTrue(!order, "Order not found");

  console.log("order.user_id", order.user_id);
  console.log("user_id", user_id);

  throwIfTrue(order.user_id.toString() !== user_id.toString(), "Unauthorized");

  const business = await businessModelDB.findOne({ user_id: order.user_id }).lean();
  //   throwIfTrue(!business, "Business not found");

  order.business_details = business;

  // Fetch the admin selected invoice template from db if not found then use default invoice template
  const selectedgenerateInvoiceTemplate = await contactInfoModelDB.findOne().lean();
  const invoiceTemplate = selectedgenerateInvoiceTemplate.invoice_template;

  const html = generateInvoiceTemplate(order, invoiceTemplate);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdf;
};
