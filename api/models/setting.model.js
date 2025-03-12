import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      unique: true, // Ensure one settings document per tenant
      required: true,
    },
    settings: {
      general: {
        companyName: String,
        address: String,
        contactEmail: String,
        contactPhone: String,
        darkMode: Boolean,
      },
      pricing: {
        hourlyRate: Number,
        dailyRate: Number,
        monthlyRate: Number,
        weekendPricing: Boolean,
      },
      api: {
        plateRecognizerKey: String,
        paymentGatewayKey: String,
      },
      notifications: {
        emailEnabled: Boolean,
        smsEnabled: Boolean,
        capacityAlertsEnabled: Boolean,
      },
    },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
