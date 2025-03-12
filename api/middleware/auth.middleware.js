import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js"
import User from "../models/user.model.js"

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required")
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      throw new ApiError(401, "Invalid token")
    }

    // Check if user is active
    if (user.status !== "Active") {
      throw new ApiError(403, "Account is inactive")
    }

    // Add user to request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant: user.tenant,
    }

    // For SuperAdmin users, no tenant check is needed
    if (user.role === "SuperAdmin") {
      return next()
    }

    // For other users, ensure tenant matches if tenant middleware has been applied
    if (req.tenant && user.tenant) {
      if (user.tenant.toString() !== req.tenant._id.toString()) {
        throw new ApiError(403, "User does not belong to this tenant")
      }
    }

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"))
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"))
    }
    next(error)
  }
}

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"))
    }

    next()
  }
}
