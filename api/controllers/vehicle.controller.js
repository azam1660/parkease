import Vehicle from "../models/vehicle.model.js"
import ParkingSlot from "../models/parking-slot.model.js"
import ParkingSection from "../models/parking-section.model.js"
import { ApiError } from "../utils/api-error.js"

// Register vehicle entry
export const registerEntry = async (req, res, next) => {
  try {
    const { plateNumber, type, slotId } = req.body

    if (!plateNumber) {
      throw new ApiError(400, "Plate number is required")
    }

    // Check if vehicle already exists and is parked
    const existingVehicle = await Vehicle.findOne({
      plateNumber,
      tenant: req.user.tenant,
      status: "Parked",
    })

    if (existingVehicle) {
      throw new ApiError(400, "Vehicle is already parked")
    }

    // Check if slot exists and is available
    let slot = null
    if (slotId) {
      slot = await ParkingSlot.findOne({
        _id: slotId,
        tenant: req.user.tenant,
      })

      if (!slot) {
        throw new ApiError(404, "Parking slot not found")
      }

      if (slot.status !== "Available") {
        throw new ApiError(400, "Parking slot is not available")
      }
    }

    // Create new vehicle or update existing
    let vehicle

    const anyExistingVehicle = await Vehicle.findOne({
      plateNumber,
      tenant: req.user.tenant,
    })

    if (anyExistingVehicle) {
      // Update existing vehicle
      anyExistingVehicle.status = "Parked"
      anyExistingVehicle.entryTime = new Date()
      anyExistingVehicle.exitTime = null
      anyExistingVehicle.parkingSlot = slotId || null
      anyExistingVehicle.type = type || anyExistingVehicle.type || "Sedan"

      vehicle = await anyExistingVehicle.save()
    } else {
      // Create new vehicle
      vehicle = new Vehicle({
        plateNumber,
        type: type || "Sedan",
        status: "Parked",
        entryTime: new Date(),
        parkingSlot: slotId || null,
        tenant: req.user.tenant,
      })

      vehicle = await vehicle.save()
    }

    // Update slot status if provided
    if (slotId && slot) {
      slot.status = "Occupied"
      slot.currentVehicle = vehicle._id
      await slot.save()

      // Update section availability
      if (slot.section) {
        const section = await ParkingSection.findById(slot.section)
        if (section) {
          // Initialize available if not set
          if (section.available === undefined) {
            section.available = section.capacity
          }

          section.available = Math.max(0, section.available - 1)
          await section.save()
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Vehicle entry registered successfully",
      data: vehicle,
    })
  } catch (error) {
    next(error)
  }
}

// Register vehicle exit
export const registerExit = async (req, res, next) => {
  try {
    const { plateNumber } = req.body

    if (!plateNumber) {
      throw new ApiError(400, "Plate number is required")
    }

    // Find vehicle
    const vehicle = await Vehicle.findOne({
      plateNumber,
      status: "Parked",
      tenant: req.user.tenant,
    })

    if (!vehicle) {
      throw new ApiError(404, "Parked vehicle not found with this plate number")
    }

    // Update vehicle status
    vehicle.status = "Exited"
    vehicle.exitTime = new Date()

    // Free up parking slot if assigned
    if (vehicle.parkingSlot) {
      const slot = await ParkingSlot.findById(vehicle.parkingSlot)
      if (slot) {
        slot.status = "Available"
        slot.currentVehicle = null
        await slot.save()

        // Update section availability
        if (slot.section) {
          const section = await ParkingSection.findById(slot.section)
          if (section) {
            // Initialize available if not set
            if (section.available === undefined) {
              section.available = 0
            }

            section.available = Math.min(section.capacity, section.available + 1)
            await section.save()
          }
        }
      }

      vehicle.parkingSlot = null
    }

    await vehicle.save()

    res.status(200).json({
      success: true,
      message: "Vehicle exit registered successfully",
      data: vehicle,
    })
  } catch (error) {
    next(error)
  }
}

// Get all vehicles for tenant
export const getAllVehicles = async (req, res, next) => {
  try {
    console.log(req.user.tenant);

    const vehicles = await Vehicle.find({ tenant: req.user.tenant })
      .populate('parkingSlot')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

// Get vehicle by ID
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      tenant: req.user.tenant
    }).populate('parkingSlot');

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Find vehicle by plate number
export const findVehicleByPlate = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      plateNumber: req.params.plateNumber.toUpperCase(),
      tenant: req.user.tenant
    }).populate('parkingSlot');

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Update vehicle details
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, tenant: req.user.tenant },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};
