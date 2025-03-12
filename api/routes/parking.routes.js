import express from "express"
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
} from "../controllers/parking.controller.js"
import { authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require authentication (applied in server.js)

// Section routes
router.get("/sections", getAllSections)
router.get("/sections/:id", getSectionById)

// Admin only section routes
router.post("/sections", authorize("Admin"), createSection)
router.put("/sections/:id", authorize("Admin"), updateSection)
router.delete("/sections/:id", authorize("Admin"), deleteSection)

// Slot routes
router.get("/slots", getAllSlots)
router.get("/slots/:id", getSlotById)

// Admin only slot routes
router.post("/slots", authorize("Admin"), createSlot)
router.put("/slots/:id", authorize("Admin"), updateSlot)
router.delete("/slots/:id", authorize("Admin"), deleteSlot)

export default router

