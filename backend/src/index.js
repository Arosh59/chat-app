import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app,server } from "./lib/socket.js";
import communityRoutes from "./routes/community.route.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" })); 
app.use(cookieParser());
app.use(cors({ 
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/communities", communityRoutes);

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();  
});

