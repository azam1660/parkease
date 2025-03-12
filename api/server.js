import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"

// Import routes
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import vehicleRoutes from "./routes/vehicle.routes.js"
import parkingRoutes from "./routes/parking.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import reportRoutes from "./routes/report.routes.js"
import settingRoutes from "./routes/setting.routes.js"
import tenantRoutes from "./routes/tenant.routes.js"

// Import middleware
import { errorHandler } from "./middleware/error.middleware.js"
import { authMiddleware } from "./middleware/auth.middleware.js"
import { tenantMiddleware } from "./middleware/tenant.middleware.js"

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(morgan("dev"))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Platform-level routes (no tenant required)
app.use("/api/platform/auth", authRoutes) // For SuperAdmin login
app.use("/api/platform/tenants", authMiddleware, tenantRoutes)

// Tenant-specific routes
// Apply tenant middleware to all tenant-specific routes
app.use("/api/auth", authRoutes)
app.use("/api/users", authMiddleware, userRoutes)
app.use("/api/vehicles", authMiddleware, vehicleRoutes)
app.use("/api/parking", authMiddleware, parkingRoutes)
app.use("/api/payments", authMiddleware, paymentRoutes)
app.use("/api/reports", authMiddleware, reportRoutes)
app.use("/api/settings", authMiddleware, settingRoutes)

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
