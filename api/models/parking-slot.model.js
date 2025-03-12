import mongoose from "mongoose"

const parkingSlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSection",
      required: true,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
    },
    reserved: {
      type: Boolean,
    },
    currentVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    dimensions: {
      length: Number,
      width: Number,
    },
    location: {
      x: Number,
      y: Number,
    },
    features: [
      {
        type: String,
      },
    ],
    customRate: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Slot name uniqueness within a section and tenant
parkingSlotSchema.index({ name: 1, section: 1, tenant: 1 }, { unique: true })
parkingSlotSchema.index({ section: 1, tenant: 1 })
parkingSlotSchema.index({ status: 1, tenant: 1 })

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema)

export default ParkingSlot

