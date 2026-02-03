import { v4 as uuidv4 } from "uuid";

import { getTenantModels } from "../../lib/tenantModelsCache.js";
import throwIfTrue from "../../utils/throwIfTrue.js";
import { updateStockOnOrder } from "../utils/updateStockOnOrder.js";
import { verifyOrderProducts } from "../utils/verifyOrderProducts.js";
import { validateOrderCreate } from "../validations/validateOrderCreate.js";

/*
  Example JSON
  {
  "order_id": "OD_1736666666666_...", 
  "order_products": [
    {
      "product_unique_id": "PROD_001", 
      "product_name": "Premium T-Shirt",
      "quantity": 2,
      "unit_base_price": 500, 
      "unit_discount_price": 50, 
      "unit_tax_value": 0, 
      "unit_final_price": 450, 
      "additional_discount_percentage": 0,
      "additional_discount_amount": 0,
      "additional_discount_type": "percentage", 
      "gst": 0, 
    }
  ],
  "customer_name": "John Doe",
  "mobile_number": "9876543210",
  "address": {
    "first_name": "John",
    "last_name": "Doe",
    "mobile_number": "9876543210",
    "house_number": "123",
    "street": "Main Street",
    "landmark": "Near Park",
    "city": "Mumbai",
    "district": "Mumbai Suburban",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India",
    "address_type": "Home",
    "save_addres": true 
  }
  "additional_discount_percentage": 10, 
  "additional_discount_amount": 100,
  "additional_discount_type": "percentage"
}
*/
export const createOfflineOrderService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  console.log("Payload coming into create offline order service ===>", payload);

  const { offlineOrderModelDB, productModelDB } = await getTenantModels(tenantId);

  // Calculate Order Totals from Products
  const { order_products = [] } = payload;

  // Step 1: Calculate total values for EACH product
  // For each product, multiply unit values by quantity
  const productsWithTotals = await Promise.all(
    order_products.map(async (item) => {
      let quantity = Number(item.quantity);
      let unit_base_price = Number(item.unit_base_price); // Tax-inclusive MRP
      let unit_discount_price = Number(item.unit_discount_price || 0); // Discount amount
      let unit_discounted_price = Number(item.unit_discounted_price || 0); // Price after product discount
      let unit_gross_price = Number(item.unit_gross_price || 0); // Price after product discount
      let unit_tax_percentage = Number(item.unit_tax_percentage) || 0;
      let unit_tax_value = Number(item.unit_tax_value || 0); // Tax extracted from discounted price
      let unit_final_price = Number(item.unit_final_price); // Final price per unit (tax-inclusive)

      // Additional order-level discount fields
      let additional_discount_percentage = Number(item.additional_discount_percentage || 0);
      let additional_discount_amount = Number(item.additional_discount_amount || 0);
      let additional_discount_type = item.additional_discount_type || null;

      // Apply additional discount if provided
      if (additional_discount_type === "percentage" && additional_discount_percentage > 0) {
        // Calculate additional discount amount on the already-discounted price
        additional_discount_amount = Math.ceil((unit_discounted_price * additional_discount_percentage) / 100);

        // Apply additional discount
        const price_after_additional_discount = unit_discounted_price - additional_discount_amount;

        // Use reverse GST to extract tax from the final discounted price
        const taxableValue = price_after_additional_discount / (1 + unit_tax_percentage / 100);
        unit_tax_value = Math.ceil(price_after_additional_discount - taxableValue);

        // Final price is the price after all discounts (still tax-inclusive)
        unit_final_price = Math.ceil(price_after_additional_discount);
      } else if (additional_discount_type === "amount" && additional_discount_amount > 0) {
        // Apply additional discount amount
        const price_after_additional_discount = unit_discounted_price - additional_discount_amount;

        // Use reverse GST to extract tax from the final discounted price
        const taxableValue = price_after_additional_discount / (1 + unit_tax_percentage / 100);
        unit_tax_value = Math.ceil(price_after_additional_discount - taxableValue);

        // Final price is the price after all discounts (still tax-inclusive)
        unit_final_price = Math.ceil(price_after_additional_discount);
      }

      // Check if product exists
      const existingProduct = await productModelDB.findOne({ product_unique_id: item.product_unique_id });
      throwIfTrue(!existingProduct, `Product not found with id: ${item.product_unique_id}`);

      // Check if order quantity exceeds available stock
      throwIfTrue(
        existingProduct.stock_quantity < quantity,
        `Insufficient stock for product "${existingProduct.product_name}"`,
      );

      // Check if order quantity exceeds max_order_limit
      if (existingProduct.max_order_limit) {
        throwIfTrue(
          quantity > existingProduct.max_order_limit,
          `Order quantity exceeds maximum limit for product "${existingProduct.product_name}". Maximum allowed: ${existingProduct.max_order_limit}, Requested: ${quantity}`,
        );
      }

      return {
        product_unique_id: item.product_unique_id,
        product_name: existingProduct.product_name,

        quantity,
        unit_base_price,
        unit_discount_price,
        unit_discounted_price,
        unit_tax_percentage,
        unit_tax_value,
        unit_final_price,
        unit_gross_price,

        // Additional discount details if provided
        additional_discount_percentage,
        additional_discount_amount,
        additional_discount_type,

        // Calculate totals by multiplying unit values by quantity
        total_base_price: Math.ceil(unit_base_price * quantity),
        total_gross_price: Math.ceil(unit_gross_price * quantity),
        total_discount_price: Math.ceil(unit_discount_price * quantity),
        total_tax_value: Math.ceil(unit_tax_value * quantity),
        total_final_price: Math.ceil(unit_final_price * quantity), // Total price (tax-inclusive)
      };
    }),
  );

  // Step 2: Calculate ORDER-LEVEL totals by summing from all products
  // These represent the aggregate values across all products in the order
  let base_price = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_base_price, 0));

  let gross_price = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_gross_price, 0));

  let discount_price = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_discount_price, 0));

  let tax_value = Math.ceil(productsWithTotals.reduce((sum, item) => sum + item.total_tax_value, 0)); // Tax on discounted amounts

  let shipping_charges = Math.ceil(Number(payload.shipping_charges ?? 0));

  let additional_discount_percentage = Number(payload.additional_discount_percentage ?? 0);
  let additional_discount_amount = Math.ceil(Number(payload.additional_discount_amount ?? 0));
  let additional_discount_type = payload.additional_discount_type ?? null;
  // Total amount = Σ(final_price of all products) + shipping
  // where each product's final_price = (base - discount) + tax
  let total_amount = Math.ceil(
    productsWithTotals.reduce((sum, item) => sum + item.total_final_price, 0) + shipping_charges,
  );

  // Check for additional order level discounts
  if (additional_discount_type === "percentage") {
    additional_discount_amount = Math.ceil((total_amount * additional_discount_percentage) / 100);
    total_amount = Math.ceil(total_amount - additional_discount_amount);
  } else if (additional_discount_type === "amount") {
    additional_discount_amount = Math.ceil(additional_discount_amount);
    total_amount = Math.ceil(total_amount - additional_discount_amount);
  } else if (additional_discount_type === "coupon") {
    total_amount = Math.ceil(total_amount - additional_discount_amount);
  }

  let order_id = `OD_${Date.now()}_${uuidv4().slice(-6)}`;

  // Remove unwanted fields from payload
  const { order_products: _removed, ...rest } = payload;

  // Construct final orderDoc
  const orderDoc = {
    ...rest,
    order_products: productsWithTotals, // Use calculated products with totals
    order_type: "Offline",
    base_price,
    gross_price,
    tax_value,
    discount_price,
    total_amount,
    additional_discount_amount,
    additional_discount_percentage,
    additional_discount_type,
    order_id,

    order_status_history: [
      {
        status: "Delivered",
        updated_at: new Date(),
        updated_by: payload.user_id || "system",
        updated_name: "System",
        note: "Order created",
      },
    ],
  };
  console.log("orderDoc=====>", orderDoc);

  // Verify order products exist
  await verifyOrderProducts(tenantId, order_products);

  // Schema validation
  const { isValid, message } = validateOrderCreate(orderDoc);
  throwIfTrue(!isValid, message);

  const { order_type, ...restOfOrderDoc } = orderDoc;
  // Create order
  const order = await offlineOrderModelDB.create(restOfOrderDoc);

  await updateStockOnOrder(tenantId, order.order_products);

  return order;
};
