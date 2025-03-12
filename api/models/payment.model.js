import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
    },
    method: {
      type: String,
      required: true,
    },
    entryTime: {
      type: Date,
      required: true,
    },
    exitTime: {
      type: Date,
    },
    duration: {
      type: Number, // Duration in minutes
    },
    receiptNumber: {
      type: String,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    taxAmount: {
      type: Number,
    },
    discountAmount: {
      type: Number,
    },
    discountCode: {
      type: String,
    },
    notes: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentDetails: {
      cardLast4: String,
      transactionId: String,
      gatewayResponse: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

// Generate receipt number before saving
paymentSchema.pre("save", async function (next) {
  if (!this.receiptNumber) {
    // Generate a unique receipt number: PAY-YYYYMMDD-XXXX
    const date = new Date()
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0")

    // Random 4-digit number
    const random = Math.floor(1000 + Math.random() * 9000)

    // Include tenant identifier (first 3 chars)
    const tenantId = this.tenant.toString().substring(0, 3)

    this.receiptNumber = `PAY-${tenantId}-${dateStr}-${random}`
  }

  // Calculate duration if exit time is available
  if (this.exitTime && this.entryTime) {
    const durationMs = this.exitTime - this.entryTime
    this.duration = Math.ceil(durationMs / (1000 * 60)) // Convert to minutes and round up
  }

  next()
})

// Index for tenant-specific queries
paymentSchema.index({ tenant: 1, createdAt: -1 })
paymentSchema.index({ vehicle: 1, tenant: 1 })
paymentSchema.index({ status: 1, tenant: 1 })

const Payment = mongoose.model("Payment", paymentSchema)

export default Payment

