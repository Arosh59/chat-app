import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMyCommunities, 
  sendCommunityMessage, 
  getCommunityMessages,
  getCommunityMembers,
  removeMember,
  promoteMember,
  createCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunity,
  getAllCommunities
} from "../controllers/community.controller.js";
import { generateQRData, getQRScanCommunities, shareCommunityLink } from "../controllers/qrcode.controller.js";

const router = express.Router();

// Specific routes (must come before /:communityId)
router.post("/create", protectRoute, createCommunity);
router.get("/all", getAllCommunities);

// QR code routes
router.get("/qr/generate", protectRoute, generateQRData);
router.get("/qr/scan/:userId", getQRScanCommunities);
router.get("/share-link/:communityId", protectRoute, shareCommunityLink);

// Community CRUD by ID
router.get("/", protectRoute, getMyCommunities);
router.get("/:communityId", protectRoute, getCommunity);
router.put("/:communityId", protectRoute, updateCommunity);
router.post("/:communityId/join", protectRoute, joinCommunity);
router.post("/:communityId/leave", protectRoute, leaveCommunity);

// Messages
router.get("/:communityId/messages", protectRoute, getCommunityMessages);
router.post("/:communityId/send", protectRoute, sendCommunityMessage);

// Member management routes
router.get("/:communityId/members", protectRoute, getCommunityMembers);
router.delete("/:communityId/members/:memberId", protectRoute, removeMember);
router.put("/:communityId/members/:memberId/promote", protectRoute, promoteMember);

export default router;