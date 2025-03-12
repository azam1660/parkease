import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    dateRange: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    format: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    scheduled: {
      isScheduled: Boolean,
      frequency: String,
      time: String,
      sendEmail: Boolean,
      recipients: [
        {
          type: String,
        },
      ],
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for tenant-specific queries
reportSchema.index({ tenant: 1, createdAt: -1 })
reportSchema.index({ type: 1, tenant: 1 })
reportSchema.index({ "scheduled.isScheduled": 1, tenant: 1 })

const Report = mongoose.model("Report", reportSchema)

export default Report

