import Setting from "../models/setting.model.js";
import { ApiError } from "../utils/api-error.js";

// Get settings for the authenticated user's tenant
export const getSettings = async (req, res, next) => {
  try {
    const tenantId = req.user.tenant;

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID is required");
    }

    const settings = await Setting.findOne({ tenant: tenantId });

    if (!settings) {
      throw new ApiError(404, "Settings not found");
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update settings for the authenticated user's tenant
export const updateSettings = async (req, res, next) => {
  try {
    const tenantId = req.user.tenant;

    if (!tenantId) {
      throw new ApiError(400, "Tenant ID is required");
    }

    const updatedSettings = await Setting.findOneAndUpdate(
      { tenant: tenantId },
      { settings: req.body.settings }, // Ensure req.body.settings matches the new schema structure
      { new: true, runValidators: true }
    );

    if (!updatedSettings) {
      throw new ApiError(404, "Settings not found");
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
};
