import express from "express"
import { login, register, getProfile, changePassword } from "../controllers/auth.controller.js"
import { authMiddleware, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes
router.post("/login", login)

// Protected routes
router.post("/register", authMiddleware, authorize("Admin"), register)
router.get("/profile", authMiddleware, getProfile)
router.post("/change-password", authMiddleware, changePassword)

export default router

