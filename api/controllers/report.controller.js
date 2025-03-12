import Report from "../models/report.model.js"
import Vehicle from "../models/vehicle.model.js"
import Payment from "../models/payment.model.js"
import ParkingSection from "../models/parking-section.model.js"
import { ApiError } from "../utils/api-error.js"

// Generate occupancy report
export const generateOccupancyReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.body

    // Validate input
    if (!startDate || !endDate || !type) {
      throw new ApiError(400, "Start date, end date and report type are required")
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Get occupancy data
    const sections = await ParkingSection.find()

    // Get vehicle entries in date range
    const vehicles = await Vehicle.find({
      entryTime: { $gte: start, $lte: end },
    }).sort({ entryTime: 1 })

    // Calculate hourly occupancy
    const hourlyData = {}
    vehicles.forEach((vehicle) => {
      const hour = new Date(vehicle.entryTime).getHours()
      hourlyData[hour] = (hourlyData[hour] || 0) + 1
    })

    // Create report
    const report = new Report({
      name: `Occupancy Report (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`,
      type,
      dateRange: { start, end },
      data: {
        totalVehicles: vehicles.length,
        sections: sections.map((section) => ({
          name: section.name,
          capacity: section.capacity,
          available: section.available,
        })),
        hourlyOccupancy: hourlyData,
      },
      createdBy: req.user.id,
    })

    await report.save()

    res.status(201).json({
      success: true,
      message: "Occupancy report generated successfully",
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

// Generate revenue report
export const generateRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.body

    // Validate input
    if (!startDate || !endDate || !type) {
      throw new ApiError(400, "Start date, end date and report type are required")
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Get payment data in date range
    const payments = await Payment.find({
      createdAt: { $gte: start, $lte: end },
      status: "Completed",
    })

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

    // Calculate revenue by payment method
    const revenueByMethod = {}
    payments.forEach((payment) => {
      revenueByMethod[payment.method] = (revenueByMethod[payment.method] || 0) + payment.amount
    })

    // Calculate daily revenue
    const dailyRevenue = {}
    payments.forEach((payment) => {
      const date = payment.createdAt.toISOString().split("T")[0]
      dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount
    })

    // Create report
    const report = new Report({
      name: `Revenue Report (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`,
      type,
      dateRange: { start, end },
      data: {
        totalRevenue,
        totalTransactions: payments.length,
        averageTransaction: totalRevenue / (payments.length || 1),
        revenueByMethod,
        dailyRevenue,
      },
      createdBy: req.user.id,
    })

    await report.save()

    res.status(201).json({
      success: true,
      message: "Revenue report generated successfully",
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

// Get all reports
export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find().populate("createdBy", "name email").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: reports,
    })
  } catch (error) {
    next(error)
  }
}

// Get report by ID
export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate("createdBy", "name email")

    if (!report) {
      throw new ApiError(404, "Report not found")
    }

    res.status(200).json({
      success: true,
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

// Create scheduled report
export const createScheduledReport = async (req, res, next) => {
  try {
    const { name, type, frequency, time, sendEmail, recipients } = req.body

    // Create report template
    const report = new Report({
      name,
      type,
      dateRange: {
        start: new Date(),
        end: new Date(),
      },
      scheduled: {
        isScheduled: true,
        frequency,
        time,
        sendEmail,
        recipients,
      },
      createdBy: req.user.id,
    })

    await report.save()

    res.status(201).json({
      success: true,
      message: "Scheduled report created successfully",
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

// Update scheduled report
export const updateScheduledReport = async (req, res, next) => {
  try {
    const { name, frequency, time, sendEmail, recipients } = req.body

    const report = await Report.findById(req.params.id)
    if (!report) {
      throw new ApiError(404, "Report not found")
    }

    // Update fields
    if (name) report.name = name

    if (report.scheduled) {
      if (frequency) report.scheduled.frequency = frequency
      if (time) report.scheduled.time = time
      if (sendEmail !== undefined) report.scheduled.sendEmail = sendEmail
      if (recipients) report.scheduled.recipients = recipients
    } else {
      report.scheduled = {
        isScheduled: true,
        frequency: frequency || "Weekly",
        time: time || "08:00",
        sendEmail: sendEmail !== undefined ? sendEmail : true,
        recipients: recipients || [],
      }
    }

    await report.save()

    res.status(200).json({
      success: true,
      message: "Scheduled report updated successfully",
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

// Delete report
export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) {
      throw new ApiError(404, "Report not found")
    }

    await report.deleteOne()

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

