// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";

// import analyzeRoute from "./routes/analyze.js";



// const app = express();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["POST"],
//   })
// );

// app.use(express.json());

// app.use("/api/analyze", analyzeRoute);

// const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import analyzeRoute from "./routes/analyze.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const FRONTEND_DIST = path.join(__dirname, "../../frontend/dist");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.use("/api/analyze", analyzeRoute);

// Serve frontend static files
app.use(express.static(FRONTEND_DIST));

// Catch-all route to support client-side routing (e.g. React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});