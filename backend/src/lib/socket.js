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

  // --- MESSAGE STATUS TRACKING ---
  
  // When sender sends a message, mark as "sent" immediately and notify receiver
  socket.on("messageSent", (messageData) => {
    const { messageId, receiverId, senderId, groupId } = messageData;
    
    // If 1v1 chat: emit to receiver
    if (receiverId && !groupId) {
      io.to(receiverId).emit("messageDelivered", {
        messageId,
        senderId,
        status: "delivered",
        deliveredAt: new Date(),
      });
    }
    // If community/group: emit to community room
    else if (groupId) {
      io.to(groupId).emit("messageDelivered", {
        messageId,
        senderId,
        status: "delivered",
        deliveredAt: new Date(),
      });
    }
    
    console.log(`Message ${messageId} delivered to user/group`);
  });

  // When receiver reads a message
  socket.on("messageRead", (messageData) => {
    const { messageId, senderId, receiverId, groupId } = messageData;
    
    // If 1v1 chat: notify sender
    if (receiverId && !groupId) {
      io.to(senderId).emit("messageReadReceipt", {
        messageId,
        userId: receiverId,
        status: "read",
        readAt: new Date(),
      });
    }
    // If community/group: notify community
    else if (groupId) {
      io.to(groupId).emit("messageReadReceipt", {
        messageId,
        userId,
        status: "read",
        readAt: new Date(),
      });
    }
    
    console.log(`Message ${messageId} read by user ${userId}`);
  });

  // When user starts typing
  socket.on("userTyping", (data) => {
    const { receiverId, groupId, senderName } = data;
    
    if (receiverId && !groupId) {
      io.to(receiverId).emit("userTyping", { senderId: userId, senderName });
    } else if (groupId) {
      socket.broadcast.to(groupId).emit("userTyping", { userId, senderName });
    }
  });

  // When user stops typing
  socket.on("userStoppedTyping", (data) => {
    const { receiverId, groupId } = data;
    
    if (receiverId && !groupId) {
      io.to(receiverId).emit("userStoppedTyping", { senderId: userId });
    } else if (groupId) {
      socket.broadcast.to(groupId).emit("userStoppedTyping", { userId });
    }
  });

  // --- END MESSAGE STATUS TRACKING ---

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

