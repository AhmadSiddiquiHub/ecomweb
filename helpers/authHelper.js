const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  try {
    const saltRounds = bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
