import express from 'express'
import { getWishlistController, getWishlistProductsController, removeWishlistController, wishlistController } from './wishlistController.js'

const route = express.Router()

route.post("/createWishlist", wishlistController)
route.get("/getUserWishlists/:id", getWishlistProductsController)
route.get("/getAllWishlist/:id", getWishlistController)
route.delete("/removeWishlist/:id", removeWishlistController)

export default route