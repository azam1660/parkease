import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import Tenant from "../models/tenant.model.js"
import { ApiError } from "../utils/api-error.js"
import { isValidUserRole } from "../utils/validation.js"

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password"); // Ensure password is retrieved

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.status !== "Active") {
      throw new ApiError(403, "Account is inactive. Please contact administrator");
    }

    console.log("Stored Hashed Password:", user.password);

    const isPasswordValid = await user.comparePassword(password);
    console.log("Is Password Valid:", isPasswordValid);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenant: user.tenant,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.lastActive = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenant || null,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Register new user (admin only)
export const register = async (req, res, next) => {
  try {
    const { tenantName, domain, contactEmail, name, email, password, phoneNumber } = req.body;

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ domain });
    if (existingTenant) {
      throw new ApiError(409, "Tenant with this domain already exists");
    }

    // Create new tenant
    const tenant = new Tenant({
      name: tenantName,
      domain,
      contactEmail,
      status: "Active",
    });
    await tenant.save();

    // Create SuperAdmin user for the tenant
    const user = new User({
      name,
      email,
      password,
      role: "SuperAdmin",
      status: "Active",
      tenant: tenant._id,
      phoneNumber,
      lastActive: new Date(),
    });
    await user.save();

    // Create default settings for the tenant
    const defaultSettings = {
      tenant: tenant._id,
      settings: {
        general: {
          companyName: tenantName,
          contactEmail,
        },
        pricing: {
          hourlyRate: 10,
        },
        notifications: {
          emailNotifications: true,
        },
      },
    };
    await Setting.create(defaultSettings);

    res.status(201).json({
      success: true,
      message: "Tenant and SuperAdmin registered successfully",
      data: {
        tenant: {
          id: tenant._id,
          name: tenant.name,
          domain: tenant.domain,
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};



// Change password for authenticated user
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Old password and new password are required")
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      throw new ApiError(404, "User not found")
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword)
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect")
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    })
  } catch (error) {
    next(error)
  }
}

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      throw new ApiError(404, "User not found")
    }

    let tenantData = null
    if (user.tenant) {
      const tenant = await Tenant.findById(user.tenant)
      if (tenant) {
        tenantData = {
          id: tenant._id,
          name: tenant.name,
          domain: tenant.domain,
          plan: tenant.plan
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        status: user.status,
        lastActive: user.lastActive,
        tenant: tenantData
      }
    })
  } catch (error) {
    next(error)
  }
}

// Other auth controller methods remain the same
