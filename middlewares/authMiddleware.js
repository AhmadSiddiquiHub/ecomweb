const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireSignIn = async (req, res, next) => {
  try {
    const decode = await jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    res.send(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.role !== 1) {
      return res.send({ message: "Unauthorized Access!" });
    } else {
      next();
    }
  } catch (error) {
    res.send(error);
  }
};

module.exports = { requireSignIn, isAdmin };
