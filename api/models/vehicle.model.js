import mongoose from "mongoose"

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
    },
    entryTime: {
      type: Date,
    },
    exitTime: {
      type: Date,
    },
    parkingSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSlot",
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    color: {
      type: String,
    },
    make: {
      type: String,
    },
    model: {
      type: String,
    },
    year: {
      type: Number,
    },
    ownerInfo: {
      name: String,
      phone: String,
      email: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Plate number uniqueness within a tenant
vehicleSchema.index({ plateNumber: 1, tenant: 1 }, { unique: true })
vehicleSchema.index({ status: 1, tenant: 1 })

const Vehicle = mongoose.model("Vehicle", vehicleSchema)

export default Vehicle

