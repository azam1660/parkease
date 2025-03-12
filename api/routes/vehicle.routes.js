import express from "express"
import {
  registerEntry,
  registerExit,
  getAllVehicles,
  getVehicleById,
  findVehicleByPlate,
  updateVehicle,
} from "../controllers/vehicle.controller.js"
import { authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require authentication (applied in server.js)

// Routes accessible by both Admin and Gatekeeper
router.post("/entry", authorize("Admin", "Gatekeeper"), registerEntry)
router.post("/exit", authorize("Admin", "Gatekeeper"), registerExit)
router.get("/", authorize("Admin", "Gatekeeper"), getAllVehicles)
router.get("/:id", authorize("Admin", "Gatekeeper"), getVehicleById)
router.get("/plate/:plateNumber", authorize("Admin", "Gatekeeper"), findVehicleByPlate)

// Admin only routes
router.put("/:id", authorize("Admin"), updateVehicle)

export default router

