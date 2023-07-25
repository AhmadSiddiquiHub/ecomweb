const Category = require("../models/categoryModel");
const slugify = require("slugify");

// Fetch All Categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});

    if (categories) {
      return res.send({
        success: true,
        categories,
      });
    }
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Fetching Categories!",
      error,
    });
  }
};

// Fetch Single Category
const getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.send({
        success: false,
        message: "Category Not Found!",
      });
    }
    return res.send({
      success: true,
      category,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Fetching Category!",
      error,
    });
  }
};

// Create Category
const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.send({ success: false, message: "Category Name is Required!" });
  }

  try {
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.send({ success: false, message: "Category Already Existed!" });
    }

    const category = await Category.create({
      name,
      slug: slugify(name),
    });
    if (category) {
      return res.send({
        success: true,
        message: "Category Created Successfully!",
        category,
      });
    }
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Creating Category!",
      error,
    });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.send({ success: false, message: "Category Name is Required!" });
  }

  try {
    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug: slugify(name),
      },
      { new: true }
    );

    if (category) {
      return res.send({
        success: true,
        message: "Category Updated Successfully!",
        category,
      });
    }
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Updating Category!",
      error,
    });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);

    if (category) {
      return res.send({
        success: true,
        message: "Category Deleted Successfully!",
      });
    }
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Deleting Category!",
      error,
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  getSingleCategory,
  deleteCategory,
};
