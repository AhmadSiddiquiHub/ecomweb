const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const Order = require("../models/orderModel");

const registerUser = async (req, res) => {
  const { name, email, phone, address, password, answer } = req.body;

  if (!name || !email || !password || !phone || !address || !answer) {
    return res.send({ success: false, message: "Plz fill all the fields!" });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.send({ success: false, message: "User Already Existed!" });
    } else {
      const user = await User.create({
        name,
        email,
        password,
        phone,
        address,
        answer,
      });
      const token = await user.generateAuthToken();
      res.json({
        success: true,
        message: "User Registered Successfully!",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
        },
        token: token,
      });
    }
  } catch (error) {
    return res.send(error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send({ success: false, message: "Plz fill all the fields!" });
  }

  try {
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.send({ success: false, message: "User not Found!" });
    }

    const passwordMatched = await bcrypt.compare(password, userExists.password);

    if (!passwordMatched) {
      return res.send({ success: false, message: "Invalid Credentials!" });
    }

    const token = await userExists.generateAuthToken();
    return res.status(200).json({
      success: true,
      message: "User Login Successfully!",
      user: {
        name: userExists.name,
        email: userExists.email,
        phone: userExists.phone,
        address: userExists.address,
        role: userExists.role,
      },
      token: token,
    });
  } catch (error) {
    return res.send(error);
  }
};

const forgotPassword = async (req, res) => {
  const { email, newPassword, answer } = req.body;

  if (!email || !newPassword || !answer) {
    return res.send({ success: false, message: "Plz fill all the fields!" });
  }

  try {
    const user = await User.findOne({ email, answer });

    if (!user) {
      return res.send({ success: false, message: "Invalid Information!" });
    }
    const hashed = await bcrypt.hash(newPassword, 12);

    const updated = await User.findByIdAndUpdate(user._id, {
      password: hashed,
    });

    if (updated) {
      res.send({ success: true, message: "Password Reset Successfully!" });
    }
  } catch (error) {
    return res.send(error);
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    const user = await User.findById(req.user._id);

    const hashed = password ? await bcrypt.hash(password, 12) : undefined;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashed || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    return res.send({
      success: true,
      message: "Profile Updated Successfully!",
      updatedUser,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "Error while Updating Profile!",
      error,
    });
  }
};

// Fetch User Orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");

    if (!orders) {
      return res.send({
        success: false,
        message: "No Orders Found!",
      });
    }

    return res.send({
      success: true,
      orders,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error while fetching user orders!",
      error,
    });
  }
};

// Fetch Admin Orders
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });

    if (!orders) {
      return res.send({
        success: false,
        message: "No Orders Found!",
      });
    }

    return res.send({
      success: true,
      orders,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error while fetching Admin Orders!",
      error,
    });
  }
};

// Update Orders Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.send({
        success: false,
        message: "No Orders Found!",
      });
    }

    return res.send({
      success: true,
      message: "Order Updated Successfully!",
      order,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error while Updating Admin Orders Status!",
      error,
    });
  }
};

// Admin All Users
const allUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 1 } });

    if (!users) {
      return res.send({
        success: false,
        message: "No Users Found!",
      });
    }

    return res.send({
      success: true,
      users,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error while Fetching Admin Users!",
      error,
    });
  }
};

// Admin Users Delete
const deleteUsers = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.send({
        success: false,
        message: "No Users Found!",
      });
    }
    await User.findByIdAndDelete(id);
    await Order.deleteMany({ buyer: id });
    return res.send({
      success: true,
      message: "User Deleted Successfully!",
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error while Fetching Admin Users!",
      error,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  updateProfile,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
  allUsers,
  deleteUsers,
};
