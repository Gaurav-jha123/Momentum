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

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173', // Use env var for deployed frontend, fallback to local dev URL
  'http://localhost', // Sometimes needed if frontend served on :80 locally via Docker
];

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed methods
  credentials: true, // Allow sending cookies or authorization headers
};

app.use(cors(corsOptions));
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