import puppeteer from "puppeteer";
import { invoiceTemplate } from "../utils/invoiceTemplate.js";
import { getTenantModels } from "../../lib/tenantModelsCache.js";
import throwIfTrue from "../../utils/throwIfTrue.js";

export const generateInvoiceService = async (tenantId, orderId) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    throwIfTrue(!orderId, "Order ID is required");
    const { orderModelDB } = await getTenantModels(tenantId);

    const order = await orderModelDB.findOne({ order_id: orderId }).lean();
    if (!order) throw new Error("Order not found");

    const html = invoiceTemplate(order,'Invoice1');

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
