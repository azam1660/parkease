import Payment from "../models/payment.model.js"
import Vehicle from "../models/vehicle.model.js"
import { ApiError } from "../utils/api-error.js"

// Create payment
export const createPayment = async (req, res, next) => {
  try {
    const { vehicleId, amount, method } = req.body
    console.log(vehicleId, amount, method);

    // Validate input
    if (!vehicleId || !amount || !method) {
      throw new ApiError(400, "Vehicle ID, amount and payment method are required")
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found")
    }

    // Create payment
    const payment = new Payment({
      vehicle: vehicleId,
      amount,
      method,
      entryTime: vehicle.entryTime,
      exitTime: vehicle.exitTime || new Date(),
      status: "Completed",
      tenant: req.user.tenant,
    })

    await payment.save()

    // Add payment to vehicle
    vehicle.payments.push(payment._id)
    await vehicle.save()

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    })
  } catch (error) {
    next(error)
  }
}

// Get all payments
export const getAllPayments = async (req, res, next) => {
  try {
    // Pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Filtering
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.method) filter.method = req.query.method

    // Date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      }
    }

    // Get payments
    const payments = await Payment.find(filter)
      .populate("vehicle", "plateNumber type")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    // Get total count
    const total = await Payment.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get payment by ID
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("vehicle")

    if (!payment) {
      throw new ApiError(404, "Payment not found")
    }

    res.status(200).json({
      success: true,
      data: payment,
    })
  } catch (error) {
    next(error)
  }
}

// Update payment status
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    if (!status) {
      throw new ApiError(400, "Status is required")
    }

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      throw new ApiError(404, "Payment not found")
    }

    payment.status = status
    await payment.save()

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    })
  } catch (error) {
    next(error)
  }
}

// Generate receipt
export const generateReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("vehicle")

    if (!payment) {
      throw new ApiError(404, "Payment not found")
    }

    // In a real implementation, this would generate a PDF receipt
    // For now, we'll just return the payment data

    res.status(200).json({
      success: true,
      message: "Receipt generated successfully",
      data: {
        receiptNumber: payment.receiptNumber,
        date: payment.createdAt,
        vehiclePlate: payment.vehicle.plateNumber,
        entryTime: payment.entryTime,
        exitTime: payment.exitTime,
        duration: payment.duration,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
      },
    })
  } catch (error) {
    next(error)
  }
}
