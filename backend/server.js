const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Farm Assistant API is running...");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/harvests", require("./routes/harvestRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});