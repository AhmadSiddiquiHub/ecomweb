const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getProductPhoto,
  deleteProduct,
  updateProduct,
  productFilters,
  productCountController,
  productList,
  pagination,
  braintreePayment,
  braintreeToken,
  searchProducts,
} = require("../controllers/productControllers");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const formidable = require("express-formidable");

// Crud Routes
router.get("/", getAllProducts);
router.get("/get-product/:slug", getSingleProduct);
router.get("/product-photo/:pid", getProductPhoto);
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProduct
);
router.delete("/delete-product/:pid", requireSignIn, isAdmin, deleteProduct);
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProduct
);

// Filter Routes
router.post("/product-filters", productFilters);
router.get("/count", productCountController);
router.get("/product-list/:page", productList);
router.get("/pagination", pagination);

// Payment Routes
router.get("/braintree/token", braintreeToken);
router.post("/braintree/payment", requireSignIn, braintreePayment);

// Search
router.get("/search/:keyword", searchProducts);

module.exports = router;
