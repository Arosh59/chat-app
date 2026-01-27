import Community from "../models/community.model.js";
import Message from "../models/message.model.js";
import { io } from "../lib/socket.js";

export const sendCommunityMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { communityId } = req.params;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      groupId: communityId, // Add this field to your Message model
      text,
      image,
    });

    await newMessage.save();

    // SOCKET.IO: Broadcast to everyone in this community "room"
    io.to(communityId).emit("newCommunityMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};