import { ApiError } from "../utils/api-error.js"
import Tenant from "../models/tenant.model.js"

// Middleware to extract tenant information from request
export const tenantMiddleware = async (req, res, next) => {
  try {
    console.log(req.headers);
    // Get tenant identifier from various possible sources
    const tenantId = req.headers["x-tenant-id"] || req.query.tenantId

    // For API key authentication
    const apiKey = req.headers["x-api-key"]

    // For domain-based identification
    const hostname = req.headers.host

    if (!tenantId && !apiKey && !hostname) {
      return next(new ApiError(400, "Tenant identifier is required"))
    }

    let tenant

    // Find tenant by ID
    if (tenantId) {
      tenant = await Tenant.findById(tenantId)
    }
    // Find tenant by API key
    else if (apiKey) {
      // In a real implementation, you would have a separate API key model
      // or a secure way to store and retrieve API keys
      tenant = await Tenant.findOne({ apiKey: apiKey })
    }
    // Find tenant by domain
    else if (hostname) {
      // Check for custom domain or subdomain
      tenant = await Tenant.findOne({
        $or: [{ domain: hostname }, { "settings.customDomain": hostname }],
      })
    }

    if (!tenant) {
      return next(new ApiError(404, "Tenant not found"))
    }

    // Check if tenant is active
    if (tenant.status !== "Active" && tenant.status !== "Trial") {
      return next(new ApiError(403, `Tenant account is ${tenant.status.toLowerCase()}`))
    }

    // Add tenant to request
    req.tenant = tenant

    next()
  } catch (error) {
    next(error)
  }
}

// Middleware to check tenant plan features
export const checkTenantPlan = (requiredPlan) => {
  return (req, res, next) => {
    const planHierarchy = {
      Free: 0,
      Basic: 1,
      Premium: 2,
      Enterprise: 3,
    }

    if (!req.tenant) {
      return next(new ApiError(400, "Tenant information is missing"))
    }

    const tenantPlanLevel = planHierarchy[req.tenant.plan] || 0
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0

    if (tenantPlanLevel < requiredPlanLevel) {
      return next(new ApiError(403, `This feature requires a ${requiredPlan} plan or higher`))
    }

    next()
  }
}
