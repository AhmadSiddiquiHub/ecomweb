const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const fs = require("fs");
const slugify = require("slugify");
var braintree = require("braintree");
const dotenv = require("dotenv");

dotenv.config();

// Braintree Gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// Fetch All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 })
      .populate("category");

    return res.send({ success: true, totalCount: products.length, products });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Fetching all the Products!",
      error,
    });
  }
};

// Get Single Product
const getSingleProduct = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug })
      .select("-photo")
      .populate("category");

    return res.send({ success: true, product });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Fetching single Product!",
      error,
    });
  }
};

// Get Product Photo
const getProductPhoto = async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await Product.findById(pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.send(product.photo.data);
    } else {
      return res.send("Photo not Found!");
    }
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Fetching Product's Photo!",
      error,
    });
  }
};

// Create Product
const createProduct = async (req, res) => {
  const { name, description, price, category, quantity } = req.fields;
  const { photo } = req.files;

  if (!name || !description || !price || !quantity || !category) {
    return res.send({ success: false, message: "Plz fill all the fields!" });
  }
  if (!photo || photo.size > 1000000) {
    return res.send({
      success: false,
      message: "Photo is Required and should be less than 1MB!",
    });
  }

  try {
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      return res.send({
        success: false,
        message: "Product is already existed!",
      });
    }

    const product = await Product.create({
      ...req.fields,
      slug: slugify(name),
    });
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    return res.send({
      success: true,
      message: "Product Created Successfully!",
      product,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Creating the Product!",
      error,
    });
  }
};

//Update Product
const updateProduct = async (req, res) => {
  const { name, description, price, category, quantity, shipping } = req.fields;
  const { photo } = req.files;

  if (!name || !description || !price || !quantity || !category) {
    return res.send({ success: false, message: "Plz fill all the fields!" });
  }
  if (photo && photo.size > 1000000) {
    return res.send({
      success: false,
      message: "Photo is Required and should be less than 1MB!",
    });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    return res.send({
      success: true,
      message: "Product Updated Successfully!",
      product,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Updating the Product!",
      error,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  const { pid } = req.params;
  try {
    await Product.findByIdAndDelete(pid).select("-photo");

    return res.send({
      success: true,
      message: "Product Deleted Successfully!",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Fetching single Product!",
      error,
    });
  }
};

const productFilters = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await Product.find(args);
    res.send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// Products Count
const productCountController = async (req, res) => {
  try {
    const totalProducts = await Product.find({}).estimatedDocumentCount();
    return res.send({
      success: true,
      totalProducts,
    });
  } catch (error) {
    console.log(error);
    res.send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// Pagination
const productList = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await Product.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "Error in Pagination",
      error,
    });
  }
};

const pagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 6;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  try {
    // Perform MongoDB query using skip and limit
    const products = await Product.find()
      .select("-photo")
      .skip(skip)
      .limit(limit);

    // Retrieve the total count of items
    const totalCount = await Product.countDocuments();

    res.send({
      products,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    res.send({ error: "Internal Server Error" });
  }
};

// Braintree Token
const braintreeToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        return res.send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    return res.send({
      success: false,
      error: "Error while generating token from Braintree!",
    });
  }
};

// Braintree Payment
const braintreePayment = async (req, res) => {
  try {
    const { nonce, cartItems } = req.body;

    const total = cartItems.reduce(
      (acc, cartItem) => acc + cartItem.price * cartItem.qty,
      0
    );

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) {
        if (result) {
          const order = await Order.create({
            products: cartItems,
            payment: result,
            buyer: req.user._id,
          });

          if (order) {
            return res.json({
              ok: true,
            });
          }
        } else {
          return res.send({
            error: error,
          });
        }
      }
    );
  } catch (error) {
    return res.send({
      success: false,
      error: "Error while payment process from Braintree!",
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    return res.json(results);
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Searching Product!",
      error,
    });
  }
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  getProductPhoto,
  deleteProduct,
  updateProduct,
  productFilters,
  productCountController,
  productList,
  pagination,
  braintreeToken,
  braintreePayment,
  searchProducts,
};
