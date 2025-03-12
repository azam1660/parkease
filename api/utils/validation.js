// Utility functions for validation without relying on database constraints

// Validate user role
export const isValidUserRole = (role) => {
  const validRoles = ["SuperAdmin", "Admin", "Gatekeeper", "Viewer"]
  return validRoles.includes(role)
}

// Validate user status
export const isValidUserStatus = (status) => {
  const validStatuses = ["Active", "Inactive"]
  return validStatuses.includes(status)
}

// Validate tenant plan
export const isValidTenantPlan = (plan) => {
  const validPlans = ["Free", "Basic", "Premium", "Enterprise"]
  return validPlans.includes(plan)
}

// Validate tenant status
export const isValidTenantStatus = (status) => {
  const validStatuses = ["Active", "Inactive", "Suspended", "Trial"]
  return validStatuses.includes(status)
}

// Validate vehicle type
export const isValidVehicleType = (type) => {
  const validTypes = ["Sedan", "SUV", "Hatchback", "Truck", "Motorcycle", "Other"]
  return validTypes.includes(type)
}

// Validate vehicle status
export const isValidVehicleStatus = (status) => {
  const validStatuses = ["Parked", "Exited", "Reserved"]
  return validStatuses.includes(status)
}

// Validate parking slot type
export const isValidParkingSlotType = (type) => {
  const validTypes = ["Standard", "Compact", "Handicap", "Electric", "Motorcycle"]
  return validTypes.includes(type)
}

// Validate parking slot status
export const isValidParkingSlotStatus = (status) => {
  const validStatuses = ["Available", "Occupied", "Maintenance"]
  return validStatuses.includes(status)
}

// Validate parking section status
export const isValidParkingSectionStatus = (status) => {
  const validStatuses = ["Active", "Inactive", "Maintenance"]
  return validStatuses.includes(status)
}

// Validate payment method
export const isValidPaymentMethod = (method) => {
  const validMethods = ["Credit Card", "Cash", "Mobile Payment", "Subscription", "Invoice"]
  return validMethods.includes(method)
}

// Validate payment status
export const isValidPaymentStatus = (status) => {
  const validStatuses = ["Completed", "Pending", "Failed"]
  return validStatuses.includes(status)
}

// Validate report type
export const isValidReportType = (type) => {
  const validTypes = ["Daily", "Weekly", "Monthly", "Custom", "Occupancy", "Revenue", "Activity"]
  return validTypes.includes(type)
}

// Validate report format
export const isValidReportFormat = (format) => {
  const validFormats = ["PDF", "CSV", "Excel", "JSON"]
  return validFormats.includes(format)
}

// Validate setting category
export const isValidSettingCategory = (category) => {
  const validCategories = ["General", "Pricing", "API", "Notifications", "Security", "Appearance"]
  return validCategories.includes(category)
}

