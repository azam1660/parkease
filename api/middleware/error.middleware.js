import { ApiError } from "../utils/api-error.js"

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // If it's an ApiError, use its status code and message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    })
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    })
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
      errors: [`${field} already exists`],
    })
  }

  // Handle other errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [err.message],
  })
}

