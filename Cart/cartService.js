import throwIfTrue from "../utils/throwIfTrue.js";
import CartModel from "./cartModel.js";
import ProductModel from "../Products/productModel.js";

export const addToCartService = async (tenantID, cartData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!cartData?.user_id, "User ID is required");
  throwIfTrue(!cartData?.product_unique_id, "Product unique ID is required");
  throwIfTrue(!cartData?.quantity || cartData?.quantity < 1, "Valid quantity is required");

  const cartModelDB = await CartModel(tenantID);

  let cart = await cartModelDB.findOne({ user_id: cartData.user_id });

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
  }

  return cart;
};

export const getCartByUserIdService = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const cartModelDB = await CartModel(tenantID);
  const productModelDB = await ProductModel(tenantID);

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
      price: 1,
      product_color: 1,
      discount_percentage: 1,
      cgst: 1,
      sgst: 1,
      igst: 1,
      tax_value: 1,
      product_image: 1,
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
    ...cart.toObject(),
    products: enrichedProducts,
  };
};

export const removeFromCartService = async (tenantID, user_id, product_unique_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_unique_id, "Product unique ID is required");

  const cartModelDB = await CartModel(tenantID);

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

  const cartModelDB = await CartModel(tenantID);

  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");

  const productIndex = cart.products.findIndex((item) => item.product_unique_id === product_unique_id);
  throwIfTrue(productIndex === -1, "Product not found in cart");

  cart.products[productIndex].quantity = quantity;

  await cart.save();

  return cart;
};

export const clearCartService = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const cartModelDB = await CartModel(tenantID);

  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");

  cart.products = [];
  await cart.save();

  return cart;
};
