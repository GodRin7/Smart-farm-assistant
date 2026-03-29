const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Allow both Vite dev ports and production Vercel frontend
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined/null strings locally

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsers MUST come before route definitions in Express 5
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Smart Farm Assistant API is running...");
});

app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/crops",     require("./routes/cropRoutes"));
app.use("/api/expenses",  require("./routes/expenseRoutes"));
app.use("/api/activities",require("./routes/activityRoutes"));
app.use("/api/harvests",  require("./routes/harvestRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/assistant", require("./routes/assistantRoutes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});