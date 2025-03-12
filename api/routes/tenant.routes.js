import express from "express"
import {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getCurrentTenant,
} from "../controllers/tenant.controller.js"
import { authorize } from "../middleware/auth.middleware.js"
import { tenantMiddleware } from "../middleware/tenant.middleware.js"

const router = express.Router()

// Platform admin routes (no tenant middleware)
router.post("/", authorize("SuperAdmin"), createTenant)
router.get("/", authorize("SuperAdmin"), getAllTenants)
router.get("/:id", authorize("SuperAdmin"), getTenantById)
router.put("/:id", authorize("SuperAdmin"), updateTenant)
router.delete("/:id", authorize("SuperAdmin"), deleteTenant)

// Tenant-specific routes
router.get("/current", tenantMiddleware, getCurrentTenant)

export default router

