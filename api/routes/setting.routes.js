import express from "express"
import {
  getSettings,
  updateSettings,
} from "../controllers/setting.controller.js"
import { authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require authentication (applied in server.js)

// Routes accessible by all authenticated users
router.get("/", getSettings)

// Admin only routes
router.put("/", authorize("Admin"), updateSettings)

export default router
