import express from "express";
import {
  addToCartController,
  getCartByUserIdController,
  removeFromCartController,
  updateCartQuantityController,
  clearCartController,
} from "./cartController.js";

const router = express.Router();


router.post("/", addToCartController);

router.get("/:user_id", getCartByUserIdController);

router.put("/remove", removeFromCartController);

router.put("/update-quantity", updateCartQuantityController);

router.delete("/clear", clearCartController);

export default router;
