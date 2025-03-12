"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Clock, DollarSign } from "lucide-react"
import { vehicleAPI, paymentAPI, handleApiError } from "@/lib/api"
import { differenceInMinutes, formatDuration, intervalToDuration } from "date-fns"

interface VehicleExitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VehicleExitModal({ open, onOpenChange }: VehicleExitModalProps) {
  const [plateNumber, setPlateNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [parkingDetails, setParkingDetails] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchParkingDetails = async () => {
      if (!plateNumber) {
        setParkingDetails(null)
        return
      }

      try {
        const response = await vehicleAPI.findVehicleByPlate(plateNumber)
        const details = response.data.data

        if (details.entryTime) {
          const entryTime = new Date(details.entryTime)
          const exitTime = details.exitTime ? new Date(details.exitTime) : new Date()
          const durationMinutes = differenceInMinutes(exitTime, entryTime)

          details.duration = formatDuration(intervalToDuration({ start: entryTime, end: exitTime }))
          details.amountDue = (durationMinutes / 60) * 5
        }

        setParkingDetails(details)
      } catch (error) {
        setParkingDetails(null)
      }
    }

    fetchParkingDetails()
  }, [plateNumber])

  const handleRegisterExit = async () => {
    if (!plateNumber || !parkingDetails) {
      toast({
        title: "Error",
        description: "Please enter a valid license plate number",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    // vehicleId, amount, method
    try {
      await paymentAPI.createPayment({
        vehicleId: parkingDetails._id,
        amount: parkingDetails.amountDue || 0,
        method: paymentMethod,
      })

      await vehicleAPI.registerExit({ plateNumber, paymentMethod })

      toast({
        title: "Exit Registered",
        description: `Vehicle ${plateNumber} has been registered for exit`,
      })
      onOpenChange(false)
    } catch (error) {
      const err = handleApiError(error)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register Vehicle Exit</DialogTitle>
          <DialogDescription>Process vehicle exit and payment</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="exit-plate">License Plate</Label>
            <Input
              id="exit-plate"
              placeholder="Enter license plate number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
            />
          </div>

          {parkingDetails && (
            <div className="space-y-2 pt-2">
              <Label>Parking Details</Label>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Entry Time</p>
                  <p className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(parkingDetails.entryTime).toLocaleString() || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p>{parkingDetails.duration || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Parking Slot</p>
                  <p>{parkingDetails.parkingSlot?.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="font-medium">${parkingDetails.amountDue?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="card" id="payment-card" />
                <Label htmlFor="payment-card" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Credit/Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="cash" id="payment-cash" />
                <Label htmlFor="payment-cash" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Cash
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRegisterExit} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Register Exit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
