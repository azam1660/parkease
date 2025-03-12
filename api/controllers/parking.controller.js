import ParkingSection from "../models/parking-section.model.js"
import ParkingSlot from "../models/parking-slot.model.js"
import { ApiError } from "../utils/api-error.js"

// SECTIONS

// Get all parking sections
export const getAllSections = async (req, res, next) => {
  try {
    const sections = await ParkingSection.find().populate({
      path: "slots",
      select: "name type status reserved currentVehicle",
    })

    res.status(200).json({
      success: true,
      data: sections,
    })
  } catch (error) {
    next(error)
  }
}

// Get section by ID
export const getSectionById = async (req, res, next) => {
  try {
    const section = await ParkingSection.findById(req.params.id).populate({
      path: "slots",
      select: "name type status reserved currentVehicle",
      populate: {
        path: "currentVehicle",
        select: "plateNumber type entryTime",
      },
    })

    if (!section) {
      throw new ApiError(404, "Parking section not found")
    }

    res.status(200).json({
      success: true,
      data: section,
    })
  } catch (error) {
    next(error)
  }
}

// Create new section
export const createSection = async (req, res, next) => {
  try {
    const { name, floor, capacity, status } = req.body

    // Validate input
    if (!name || !floor || !capacity) {
      throw new ApiError(400, "Name, floor and capacity are required")
    }

    // Create section
    const section = new ParkingSection({
      name,
      floor,
      capacity,
      available: capacity,
      status: status || "Active",
      tenant: req.user.tenant
    })

    await section.save()

    res.status(201).json({
      success: true,
      message: "Parking section created successfully",
      data: section,
    })
  } catch (error) {
    next(error)
  }
}

// Update section
export const updateSection = async (req, res, next) => {
  try {
    const { name, floor, capacity, status } = req.body

    // Find section
    const section = await ParkingSection.findById(req.params.id)
    if (!section) {
      throw new ApiError(404, "Parking section not found")
    }

    // Update fields
    if (name) section.name = name
    if (floor) section.floor = floor

    // Handle capacity change
    if (capacity && capacity !== section.capacity) {
      // If reducing capacity, ensure it's not less than occupied slots
      const occupiedCount = section.capacity - section.available
      if (capacity < occupiedCount) {
        throw new ApiError(400, `Cannot reduce capacity below occupied count (${occupiedCount})`)
      }

      section.available = section.available + (capacity - section.capacity)
      section.capacity = capacity
    }

    if (status) section.status = status

    await section.save()

    res.status(200).json({
      success: true,
      message: "Parking section updated successfully",
      data: section,
    })
  } catch (error) {
    next(error)
  }
}

// Delete section
export const deleteSection = async (req, res, next) => {
  try {
    const section = await ParkingSection.findById(req.params.id)

    if (!section) {
      throw new ApiError(404, "Parking section not found")
    }

    // Check if section has occupied slots
    const occupiedSlots = await ParkingSlot.countDocuments({
      section: section._id,
      status: "Occupied",
    })

    if (occupiedSlots > 0) {
      throw new ApiError(400, "Cannot delete section with occupied slots")
    }

    // Delete all slots in this section
    await ParkingSlot.deleteMany({ section: section._id })

    // Delete section
    await section.deleteOne()

    res.status(200).json({
      success: true,
      message: "Parking section deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// SLOTS

// Get all slots
export const getAllSlots = async (req, res, next) => {
  try {
    // Filtering
    const filter = {}
    if (req.query.section) filter.section = req.query.section
    if (req.query.status) filter.status = req.query.status
    if (req.query.type) filter.type = req.query.type
    if (req.query.reserved) filter.reserved = req.query.reserved === "true"

    const slots = await ParkingSlot.find(filter)
      .populate("section", "name floor")
      .populate("currentVehicle", "plateNumber type entryTime")

    res.status(200).json({
      success: true,
      data: slots,
    })
  } catch (error) {
    next(error)
  }
}

// Get slot by ID
export const getSlotById = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id).populate("section", "name floor").populate("currentVehicle")

    if (!slot) {
      throw new ApiError(404, "Parking slot not found")
    }

    res.status(200).json({
      success: true,
      data: slot,
    })
  } catch (error) {
    next(error)
  }
}

// Create new slot
export const createSlot = async (req, res, next) => {
  try {
    const { name, sectionId, type, status, reserved } = req.body
    console.log({ name, sectionId, type, status, reserved });

    // Validate input
    if (!name || !sectionId) {
      throw new ApiError(400, "Name and section ID are required")
    }

    // Check if section exists
    const section = await ParkingSection.findById(sectionId)
    if (!section) {
      throw new ApiError(404, "Parking section not found")
    }

    // Create slot
    const slot = new ParkingSlot({
      name,
      section: sectionId,
      type: type || "Standard",
      status: status || "Available",
      reserved: reserved || false,
      tenant: req.user.tenant
    })

    await slot.save()

    // Add slot to section
    section.slots.push(slot._id)
    await section.save()

    res.status(201).json({
      success: true,
      message: "Parking slot created successfully",
      data: slot,
    })
  } catch (error) {
    next(error)
  }
}

// Update slot
export const updateSlot = async (req, res, next) => {
  try {
    const { name, type, status, reserved, sectionId } = req.body

    // Find slot
    const slot = await ParkingSlot.findById(req.params.id)
    if (!slot) {
      throw new ApiError(404, "Parking slot not found")
    }

    // Update fields
    if (name) slot.name = name
    if (type) slot.type = type

    // Handle status change
    if (status && status !== slot.status) {
      // If changing to occupied, ensure no vehicle is assigned
      if (status === "Occupied" && !slot.currentVehicle) {
        throw new ApiError(400, "Cannot mark slot as occupied without a vehicle")
      }

      // If changing from occupied, remove vehicle reference
      if (slot.status === "Occupied" && status !== "Occupied") {
        slot.currentVehicle = null
      }

      slot.status = status
    }

    if (reserved !== undefined) slot.reserved = reserved

    // Handle section change
    if (sectionId && sectionId !== slot.section.toString()) {
      // Check if new section exists
      const newSection = await ParkingSection.findById(sectionId)
      if (!newSection) {
        throw new ApiError(404, "New parking section not found")
      }

      // Remove from old section
      const oldSection = await ParkingSection.findById(slot.section)
      if (oldSection) {
        oldSection.slots = oldSection.slots.filter((s) => s.toString() !== slot._id.toString())
        await oldSection.save()
      }

      // Add to new section
      newSection.slots.push(slot._id)
      await newSection.save()

      slot.section = sectionId
    }

    await slot.save()

    res.status(200).json({
      success: true,
      message: "Parking slot updated successfully",
      data: slot,
    })
  } catch (error) {
    next(error)
  }
}

// Delete slot
export const deleteSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id)

    if (!slot) {
      throw new ApiError(404, "Parking slot not found")
    }

    // Check if slot is occupied
    if (slot.status === "Occupied") {
      throw new ApiError(400, "Cannot delete occupied slot")
    }

    // Remove from section
    const section = await ParkingSection.findById(slot.section)
    if (section) {
      section.slots = section.slots.filter((s) => s.toString() !== slot._id.toString())
      await section.save()
    }

    // Delete slot
    await slot.deleteOne()

    res.status(200).json({
      success: true,
      message: "Parking slot deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}
