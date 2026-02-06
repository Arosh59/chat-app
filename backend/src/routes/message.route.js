import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, markMessageAsDelivered, markMessageAsRead } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

// Message status routes
router.put("/:messageId/delivered", protectRoute, markMessageAsDelivered);
router.put("/:messageId/read", protectRoute, markMessageAsRead);

export default router;