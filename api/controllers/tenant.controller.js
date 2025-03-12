import Tenant from "../models/tenant.model.js"
import Setting from "../models/setting.model.js"
import { ApiError } from "../utils/api-error.js"

// Create new tenant (for platform admins)
export const createTenant = async (req, res, next) => {
  try {
    const { name, domain, plan, contactEmail, contactPhone, address, subscription } = req.body

    // Validate required fields
    if (!name || !domain || !contactEmail) {
      throw new ApiError(400, "Name, domain, and contact email are required")
    }

    // Check if domain is already in use
    const existingTenant = await Tenant.findOne({ domain })
    if (existingTenant) {
      throw new ApiError(409, "Domain is already in use")
    }

    // Create new tenant with sensible values but no defaults in schema
    const tenant = new Tenant({
      name,
      domain,
      plan: plan || "Basic",
      status: "Active",
      contactEmail,
      contactPhone,
      address,
      subscription: subscription || {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        autoRenew: true,
      },
      createdBy: req.user?.id,
    })

    await tenant.save()

    // Initialize settings for the tenant
    await initializeSettings(tenant._id)

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: tenant,
    })
  } catch (error) {
    next(error)
  }
}

// Initialize settings for a tenant
const initializeSettings = async (tenantId) => {
  const settings = [
    // General settings
    { category: "General", key: "companyName", value: "ParkSmart Inc.", description: "Company name" },
    { category: "General", key: "address", value: "", description: "Company address" },
    { category: "General", key: "contactEmail", value: "", description: "Contact email" },
    { category: "General", key: "contactPhone", value: "", description: "Contact phone" },
    { category: "General", key: "darkMode", value: false, description: "Enable dark mode" },

    // Pricing settings
    { category: "Pricing", key: "hourlyRate", value: 2.5, description: "Hourly parking rate" },
    { category: "Pricing", key: "dailyMaxRate", value: 15, description: "Daily maximum rate" },
    { category: "Pricing", key: "monthlyPassRate", value: 150, description: "Monthly pass rate" },
    { category: "Pricing", key: "weekendPricing", value: false, description: "Apply different rates on weekends" },

    // API settings
    { category: "API", key: "plateRecognizerApiKey", value: "", description: "Plate Recognizer API key" },
    { category: "API", key: "paymentGatewayApiKey", value: "", description: "Payment Gateway API key" },

    // Notification settings
    { category: "Notifications", key: "emailNotifications", value: true, description: "Send email notifications" },
    { category: "Notifications", key: "smsNotifications", value: false, description: "Send SMS notifications" },
    { category: "Notifications", key: "capacityAlerts", value: true, description: "Send capacity alerts" },
  ]

  // Insert settings for this tenant
  for (const setting of settings) {
    await Setting.create({
      ...setting,
      tenant: tenantId,
      isGlobal: false,
      dataType:
        typeof setting.value === "string"
          ? "string"
          : typeof setting.value === "number"
            ? "number"
            : typeof setting.value === "boolean"
              ? "boolean"
              : "json",
    })
  }
}

// Get tenant by ID (for platform admins)
export const getTenantById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
    if (!tenant) {
      throw new ApiError(404, "Tenant not found")
    }
    res.json({
      success: true,
      data: tenant,
    })
  } catch (error) {
    next(error)
  }
}

// Update tenant (for platform admins)
export const updateTenant = async (req, res, next) => {
  try {
    const { name, domain, plan, contactEmail, contactPhone, address, status, subscription } = req.body
    const tenant = await Tenant.findById(req.params.id)

    if (!tenant) {
      throw new ApiError(404, "Tenant not found")
    }

    // Check domain uniqueness if it's being changed
    if (domain && domain !== tenant.domain) {
      const existingTenant = await Tenant.findOne({ domain })
      if (existingTenant) {
        throw new ApiError(409, "Domain is already in use")
      }
    }

    tenant.name = name || tenant.name
    tenant.domain = domain || tenant.domain
    tenant.plan = plan || tenant.plan
    tenant.contactEmail = contactEmail || tenant.contactEmail
    tenant.contactPhone = contactPhone || tenant.contactPhone
    tenant.address = address || tenant.address
    tenant.status = status || tenant.status
    tenant.subscription = subscription || tenant.subscription
    tenant.updatedBy = req.user?.id

    await tenant.save()

    res.json({
      success: true,
      message: "Tenant updated successfully",
      data: tenant,
    })
  } catch (error) {
    next(error)
  }
}

// Delete tenant (for platform admins)
export const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
    if (!tenant) {
      throw new ApiError(404, "Tenant not found")
    }

    await Promise.all([
      Tenant.deleteOne({ _id: req.params.id }),
      Setting.deleteMany({ tenant: req.params.id })
    ])

    res.json({
      success: true,
      message: "Tenant deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Get current tenant (for tenant users)
export const getCurrentTenant = async (req, res, next) => {
  try {
    if (!req.tenantId) {
      throw new ApiError(400, "Tenant context is required")
    }

    const tenant = await Tenant.findById(req.tenantId)
    if (!tenant) {
      throw new ApiError(404, "Tenant not found")
    }

    res.json({
      success: true,
      data: tenant,
    })
  } catch (error) {
    next(error)
  }
}

// Get all tenants with pagination (for platform admins)
export const getAllTenants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      Tenant.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Tenant.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        tenants,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Other tenant controller methods remain the same
