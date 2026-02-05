import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import Community from "../models/community.model.js";
import User from "../models/user.model.js";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateQRData = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrCodeUrl = `${baseUrl}/qr-scan?user=${req.user._id}`;
    res.status(200).json({ qrCodeUrl, userId: req.user._id });
  } catch (error) {
    console.log("Error in generateQRData:", error.message);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
};

export const getQRScanCommunities = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let query;
    if (user.age >= 31) {
      query = { isElderly: true };
    } else {
      query = { minAge: { $lte: user.age }, maxAge: { $gte: user.age } };
    }
    const communities = await Community.find(query);
    res.status(200).json(communities);
  } catch (error) {
    console.log("Error in getQRScanCommunities:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const shareCommunityLink = async (req, res) => {
  try {
    const { communityId } = req.params;
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }
    const shareLink = `${baseUrl}/join-community/${communityId}`;
    res.status(200).json({ shareLink, communityId, communityName: community.name });
  } catch (error) {
    console.log("Error in shareCommunityLink:", error.message);
    res.status(500).json({ error: "Failed to generate share link" });
  }
};

export default cloudinary;
