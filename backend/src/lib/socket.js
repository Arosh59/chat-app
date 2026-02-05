import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    // The user automatically joins their own private room for 1v1 chats
    socket.join(userId); 
  }

  // Tell everyone who is online
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- NEW: COMMUNITY LOGIC ---
  
  // When a user clicks a Community on the frontend
  socket.on("joinCommunity", (communityId) => {
    socket.join(communityId);
    console.log(`User ${userId} joined community room: ${communityId}`);
  });

  // When a user switches to a different chat or logs out
  socket.on("leaveCommunity", (communityId) => {
    socket.leave(communityId);
    console.log(`User ${userId} left community room: ${communityId}`);
  });

  // --- END COMMUNITY LOGIC ---

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

