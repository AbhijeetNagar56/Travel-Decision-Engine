import express from "express";
import cors from "cors";
import analyzeRoute from "./routes/analyze.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRoute);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});