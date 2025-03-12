import mongoose from "mongoose"

const parkingSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    available: {
      type: Number,
    },
    reserved: {
      type: Number,
    },
    status: {
      type: String,
    },
    slots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingSlot",
      },
    ],
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    description: {
      type: String,
    },
    features: [
      {
        type: String,
      },
    ],
    hourlyRate: {
      type: Number,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Section name uniqueness within a tenant
parkingSectionSchema.index({ name: 1, tenant: 1 }, { unique: true })

// Virtual for occupancy percentage
parkingSectionSchema.virtual("occupancyPercentage").get(function () {
  if (!this.capacity || this.capacity === 0) return 0
  if (this.available === undefined) return 0
  return ((this.capacity - this.available) / this.capacity) * 100
})

const ParkingSection = mongoose.model("ParkingSection", parkingSectionSchema)

export default ParkingSection

