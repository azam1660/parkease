import express from "express"
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller.js"
import { authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require authentication (applied in server.js)

// Admin only routes
router.get("/", authorize("Admin"), getAllUsers)
router.post("/", authorize("Admin"), createUser)

// Admin only routes with ID parameter
router.get("/:id", authorize("Admin"), getUserById)
router.put("/:id", authorize("Admin"), updateUser)
router.delete("/:id", authorize("Admin"), deleteUser)

export default router

