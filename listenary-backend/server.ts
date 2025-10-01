import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { transcriptionRoutes } from "./modules/transcription-example/controller";
import { authRoutes } from "./modules/user/controllers/authController";
import { userRoutes } from "./modules/user/controllers/userController";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transcriptions", transcriptionRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Listenary API");
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
