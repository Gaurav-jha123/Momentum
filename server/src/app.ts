import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; 

connectDB();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.get("/", (req: Request, res: Response) => {
  res.send("SyncHub MVP API Running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); 

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});