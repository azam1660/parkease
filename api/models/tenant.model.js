import mongoose from "mongoose"

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    plan: {
      type: String,
    },
    status: {
      type: String,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    subscription: {
      startDate: Date,
      endDate: Date,
      paymentMethod: String,
      autoRenew: Boolean,
    },
    settings: {
      theme: String,
      logo: String,
      customDomain: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

const Tenant = mongoose.model("Tenant", tenantSchema)

export default Tenant

