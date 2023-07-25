const express = require("express");
const router = express.Router();
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  getSingleCategory,
  deleteCategory,
} = require("../controllers/categoryControllers");

router.get("/", getAllCategories);
router.get("/:slug", getSingleCategory);
router.post("/create-category", requireSignIn, isAdmin, createCategory);
router.put("/update-category/:id", requireSignIn, isAdmin, updateCategory);
router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteCategory);

module.exports = router;
