import express from "express"
import {
  generateOccupancyReport,
  generateRevenueReport,
  getAllReports,
  getReportById,
  createScheduledReport,
  updateScheduledReport,
  deleteReport,
} from "../controllers/report.controller.js"
import { authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require authentication (applied in server.js)

// Admin only routes
router.post("/occupancy", authorize("Admin"), generateOccupancyReport)
router.post("/revenue", authorize("Admin"), generateRevenueReport)
router.get("/", authorize("Admin"), getAllReports)
router.get("/:id", authorize("Admin"), getReportById)
router.post("/scheduled", authorize("Admin"), createScheduledReport)
router.put("/scheduled/:id", authorize("Admin"), updateScheduledReport)
router.delete("/:id", authorize("Admin"), deleteReport)

export default router

