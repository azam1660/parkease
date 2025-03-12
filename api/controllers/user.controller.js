import User from "../models/user.model.js"
import { ApiError } from "../utils/api-error.js"

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Filtering
    const filter = {}
    if (req.query.role) filter.role = req.query.role
    if (req.query.status) filter.status = req.query.status

    // Search
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Get users
    const users = await User.find(filter).select("-password").skip(skip).limit(limit).sort({ createdAt: -1 })

    // Get total count
    const total = await User.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      throw new ApiError(404, "User not found")
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// Create new user
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists")
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "Viewer",
      status: status || "Active",
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body
    console.log({ name, email, role, status });

    // Find user
    const user = await User.findById(req.params.id)
    if (!user) {
      throw new ApiError(404, "User not found")
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new ApiError(409, "User with this email already exists")
      }
    }

    // Update user fields
    if (name) user.name = name
    if (email) user.email = email
    if (role) user.role = role
    if (status) user.status = status

    await user.save()

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      throw new ApiError(404, "User not found")
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}
