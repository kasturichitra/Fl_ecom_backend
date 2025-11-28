import throwIfTrue from "../utils/throwIfTrue.js";
import CartModel from "./cartModel.js";
import ProductModel from "../Products/productModel.js";


export const addToCartService = async (tenantID, cartData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!cartData?.user_id, "User ID is required");
  throwIfTrue(!cartData?.product_id, "Product ID is required");
  throwIfTrue(!cartData?.quantity || cartData?.quantity < 1, "Valid quantity is required");

  const cartModelDB = await CartModel(tenantID);


  let cart = await cartModelDB.findOne({ user_id: cartData.user_id });

  if (cart) {

    const productIndex = cart.products.findIndex(
      (item) => item.product_id.toString() === cartData.product_id.toString()
    );

    if (productIndex > -1) {

      cart.products[productIndex].quantity += cartData.quantity;
    } else {

      cart.products.push({
        product_id: cartData.product_id,
        quantity: cartData.quantity,
      });
    }

    await cart.save();
  } else {

    cart = await cartModelDB.create({
      user_id: cartData.user_id,
      products: [
        {
          product_id: cartData.product_id,
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
  
  const cart = await cartModelDB
    .findOne({ user_id })
    .populate({
      path: "products.product_id",
      model: productModelDB,
      select: "product_name product_unique_id price product_color discount_percentage cgst sgst igst tax_value product_image",
    });

  return cart;
};


export const removeFromCartService = async (tenantID, user_id, product_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_id, "Product ID is required");

  const cartModelDB = await CartModel(tenantID);


  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");


  cart.products = cart.products.filter(
    (item) => item.product_id.toString() !== product_id.toString()
  );

  await cart.save();

  return cart;
};


export const updateCartQuantityService = async (tenantID, user_id, product_id, quantity) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_id, "Product ID is required");
  throwIfTrue(!quantity || quantity < 1, "Valid quantity is required");

  const cartModelDB = await CartModel(tenantID);


  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");


  const productIndex = cart.products.findIndex(
    (item) => item.product_id.toString() === product_id.toString()
  );
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
