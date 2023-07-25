const express = require("express");
const connectDB = require("./db/connectDB");
const dotenv = require("dotenv");
const colors = require("colors");
const app = express();
const cors = require("cors");
const path = require("path");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");

// configs
dotenv.config();
connectDB();

// middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);

const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(
    `Server is listening on ${process.env.DEV_MODE} mode on port ${PORT}...`
      .bgGreen.black
  );
});
