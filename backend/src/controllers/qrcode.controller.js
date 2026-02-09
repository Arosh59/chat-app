import Community from "../models/community.model.js";
import User from "../models/user.model.js";

const BASE_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const generateQRData = async (req, res) => {
  try {
    // Ensure route is authenticated and `req.user` is present
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Return a simple QR payload the frontend can render as a QR code
    const payload = {
      type: "qr_invite",
      userId: req.user._id,
      timestamp: Date.now(),
    };

    // Frontend can encode this JSON as a QR or we can provide a share URL
    const shareUrl = `${BASE_URL}/qr-scan?user=${req.user._id}`;

    res.status(200).json({ payload, shareUrl });
  } catch (error) {
    console.error("Error in generateQRData:", error);
    res.status(500).json({ error: "Failed to generate QR data" });
  }
};

export const getQRScanCommunities = async (req, res) => {
  try {
    // Accept userId from params or query, prefer authenticated user's age
    const paramUserId = req.params.userId || req.query.userId;

    let userAge = null;
    if (req.user && typeof req.user.age === "number") {
      userAge = req.user.age;
    } else if (paramUserId) {
      const user = await User.findById(paramUserId).select("age");
      userAge = user ? user.age : null;
    }

    // Build query similar to community controller logic
    let query = {};
    if (userAge != null) {
      if (userAge >= 31) {
        query = { isElderly: true };
      } else {
        query = { minAge: { $lte: userAge }, maxAge: { $gte: userAge } };
      }
    }

    const communities = await Community.find(query);
    res.status(200).json(communities);
  } catch (error) {
    console.error("Error in getQRScanCommunities:", error);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
};

export const shareCommunityLink = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ error: "Community not found" });

    const shareLink = `${BASE_URL}/join-community/${communityId}`;
    res.status(200).json({ shareLink, communityId, communityName: community.name });
  } catch (error) {
    console.log("Error in shareCommunityLink:", error.message);
    res.status(500).json({ error: "Failed to create share link" });
  }
};
