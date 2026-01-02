import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

export const addToCartService = async (tenantID, cartData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!cartData?.user_id, "User ID is required");
  throwIfTrue(!cartData?.product_unique_id, "Product unique ID is required");
  throwIfTrue(!cartData?.quantity || cartData?.quantity < 1, "Valid quantity is required");

  const { cartModelDB, wishlistModelDB } = await getTenantModels(tenantID);

  let cart = await cartModelDB.findOne({ user_id: cartData.user_id });

  let isNewlyAdded = null;

  if (cart) {
    const productIndex = cart.products.findIndex((item) => item.product_unique_id === cartData.product_unique_id);

    if (productIndex > -1) {
      cart.products[productIndex].quantity += cartData.quantity;
    } else {
      cart.products.push({
        product_unique_id: cartData.product_unique_id,
        quantity: cartData.quantity,
      });
    }

    await cart.save();
    isNewlyAdded = false;
  } else {
    cart = await cartModelDB.create({
      user_id: cartData.user_id,
      products: [
        {
          product_unique_id: cartData.product_unique_id,
          quantity: cartData.quantity,
        },
      ],
    });
    isNewlyAdded = true;
  }

  // Remove only the products that are added to cart from wishlist
  // const existingWishlist = await wishlistModelDB.findOne({
  //   user_id: cartData.user_id,
  //   products: cartData.product_unique_id,
  // });
  // if (existingWishlist) {
  //   existingWishlist.products = existingWishlist.products.filter((item) => item !== cartData.product_unique_id);
  //   await existingWishlist.save();
  // }

  return { cart, isNewlyAdded };
};

export const getCartByUserIdService = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const { cartModelDB, productModelDB } = await getTenantModels(tenantID);

  const cart = await cartModelDB.findOne({ user_id });

  if (!cart) {
    return null;
  }

  const productUniqueIds = cart.products.map((item) => item.product_unique_id);

  const products = await productModelDB.find(
    { product_unique_id: { $in: productUniqueIds } },
    {
      product_name: 1,
      product_unique_id: 1,
      base_price: 1,
      tax_value: 1,
      discount_price: 1,
      final_price: 1,
      product_color: 1,
      stock_quantity: 1,
      max_order_limit: 1,
      product_image: 1,
      discount_percentage: 1,
    }
  );

  const enrichedProducts = cart.products.map((cartItem) => {
    const productDetails = products.find((p) => p.product_unique_id === cartItem.product_unique_id);
    return {
      product_unique_id: cartItem.product_unique_id,
      quantity: cartItem.quantity,
      product_details: productDetails || null,
    };
  });

  return {
    data: {
      ...cart.toObject(),
      products: enrichedProducts,
    },
    totalCount: enrichedProducts.length,
  };
};

export const removeFromCartService = async (tenantID, user_id, product_unique_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_unique_id, "Product unique ID is required");

  const { cartModelDB } = await getTenantModels(tenantID);

  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");

  cart.products = cart.products.filter((item) => item.product_unique_id !== product_unique_id);

  await cart.save();

  return cart;
};

export const updateCartQuantityService = async (tenantID, user_id, product_unique_id, quantity) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_unique_id, "Product unique ID is required");
  throwIfTrue(!quantity || quantity < 1, "Valid quantity is required");

  const { cartModelDB, productModelDB } = await getTenantModels(tenantID);

  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");

  const existingProduct = await productModelDB.findOne({ product_unique_id });
  throwIfTrue(!existingProduct, "Product not found");

  const productIndex = cart.products.findIndex((item) => item.product_unique_id === product_unique_id);
  throwIfTrue(productIndex === -1, "Product not found in cart");

  // Handle out of stock error and max order limit error
  const max_order_limit = existingProduct.max_order_limit;
  throwIfTrue(
    max_order_limit && quantity > max_order_limit,
    `Quantity can't exceed max order limit : ${max_order_limit}`
  );
  throwIfTrue(existingProduct.stock_quantity < quantity, "Not enough stock available");

  cart.products[productIndex].quantity = quantity;

  await cart.save();

  return cart;
};

export const clearCartService = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const { cartModelDB } = await getTenantModels(tenantID);

  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");

  cart.products = [];
  await cart.save();

  return cart;
};
