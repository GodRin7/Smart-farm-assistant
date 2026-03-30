const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const https = require("https");

dotenv.config();
connectDB();

const app = express();

// Allow cross-origin requests flexibly
app.use(
  cors({
    origin: function (origin, callback) {
      // Reflects the requested origin to allow credentials
      callback(null, true);
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
  
  // Render Free-Tier Keep-Alive Ping (Runs every 10 minutes)
  const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_EXTERNAL_URL) {
    console.log(`Keep-alive service initialized for ${RENDER_EXTERNAL_URL}`);
    setInterval(() => {
      https.get(RENDER_EXTERNAL_URL, (res) => {
        console.log(`Keep-alive ping successful: ${res.statusCode}`);
      }).on('error', (e) => {
        console.error(`Keep-alive ping failed: ${e.message}`);
      });
    }, 10 * 60 * 1000); // 10 minutes
  }
});