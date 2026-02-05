import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
// Check this line carefully:
import { getMyCommunities, sendCommunityMessage, getCommunityMessages } from "../controllers/community.controller.js";
import { generateQRData, getQRScanCommunities, shareCommunityLink } from "../controllers/qrcode.controller.js";

const router = express.Router();

router.get("/", protectRoute, getMyCommunities);

// This line was causing the crash because getCommunityMessages wasn't imported above
router.get("/messages/:communityId", protectRoute, getCommunityMessages);

router.post("/send/:communityId", protectRoute, sendCommunityMessage);

router.get("/qr/generate", protectRoute, generateQRData);
router.get("/qr/scan/:userId", getQRScanCommunities);
router.get("/share-link/:communityId", protectRoute, shareCommunityLink);

export default router;