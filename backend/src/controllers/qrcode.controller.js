import Community from "../models/community.model.js";
import User from "../models/user.model.js";

const BASE_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const generateQRData = async (req, res) => {
  try {
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
    console.log("Error in generateQRData:", error.message);
    res.status(500).json({ error: "Failed to generate QR data" });
  }
};

export const getQRScanCommunities = async (req, res) => {
  try {
    const { userId } = req.params;

    // If userId provided, fetch age; otherwise allow query param
    const user = await User.findById(userId).select("age");
    const userAge = user ? user.age : null;

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
    console.log("Error in getQRScanCommunities:", error.message);
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
