import express from "express"
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  generateReceipt,
} from "../controllers/payment.controller.js"
import { authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require authentication (applied in server.js)

// Routes accessible by both Admin and Gatekeeper
router.post("/", authorize("Admin", "Gatekeeper"), createPayment)
router.get("/", authorize("Admin", "Gatekeeper"), getAllPayments)
router.get("/:id", authorize("Admin", "Gatekeeper"), getPaymentById)
router.get("/:id/receipt", authorize("Admin", "Gatekeeper"), generateReceipt)

// Admin only routes
router.put("/:id/status", authorize("Admin"), updatePaymentStatus)

export default router

