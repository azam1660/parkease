import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    status: {
      type: String,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      // Not required for SuperAdmin users who manage the platform
    },
    lastActive: {
      type: Date,
    },
    phoneNumber: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    preferences: {
      language: String,
      notifications: {
        email: Boolean,
        sms: Boolean,
      },
      theme: String,
    },
  },
  {
    timestamps: true,
  },
)

// Email uniqueness within a tenant
userSchema.index({ email: 1, tenant: 1 }, { unique: true })

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User

