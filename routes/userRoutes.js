const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  updateProfile,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
  allUsers,
  deleteUsers,
} = require("../controllers/userControllers");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const Product = require("../models/productModel");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

// User Protected Route
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

// Admin Protected Route
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

// Update Profile
router.put("/profile", requireSignIn, updateProfile);

// User Orders
router.get("/orders", requireSignIn, getUserOrders);

// Admin Orders
router.get("/all-orders", requireSignIn, isAdmin, getAdminOrders);

// Update Orders Status
router.put("/order-status/:orderId", requireSignIn, isAdmin, updateOrderStatus);

// All Users
router.get("/all-users", requireSignIn, isAdmin, allUsers);

// All Users
router.delete("/delete-users/:id", requireSignIn, isAdmin, deleteUsers);

module.exports = router;
