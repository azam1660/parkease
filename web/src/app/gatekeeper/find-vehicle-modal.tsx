"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Search, AlertCircle } from "lucide-react"
import { vehicleAPI } from "@/lib/api"

interface FindVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FindVehicleModal({ open, onOpenChange }: FindVehicleModalProps) {
  const [searchType, setSearchType] = useState("plate")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery) {
      setError("Please enter a search term")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      let response
      let vehicleId

      if (searchType === "plate") {
        // Search by license plate
        response = await vehicleAPI.findVehicleByPlate(searchQuery)
        if (response.data && response.data.data) {
          vehicleId = response.data.data._id
        }
      } else if (searchType === "slot") {
        // Search by parking slot
        // This would require a new API endpoint or parameter
        response = await vehicleAPI.getAllVehicles()
        const vehicles = response.data.data
        const vehicle = vehicles.find(
          (v) => v.parkingSlot && v.parkingSlot.name && v.parkingSlot.name.toLowerCase() === searchQuery.toLowerCase(),
        )
        if (vehicle) {
          vehicleId = vehicle._id
        }
      } else if (searchType === "ticket") {
        // Search by ticket number
        // This would require a new API endpoint
        response = await vehicleAPI.getAllVehicles()
        const vehicles = response.data.data
        const vehicle = vehicles.find((v) => v.ticketNumber === searchQuery)
        if (vehicle) {
          vehicleId = vehicle._id
        }
      }

      if (vehicleId) {
        // Navigate to vehicle details page
        router.push(`/vehicle/${vehicleId}`)
        onOpenChange(false)

        toast({
          title: "Vehicle Found",
          description: "Navigating to vehicle details",
        })
      } else {
        setError("No vehicle found with the provided information")
      }
    } catch (error) {
      console.error("Error searching for vehicle:", error)
      setError("Failed to search for vehicle. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Find Vehicle</DialogTitle>
          <DialogDescription>Search for a vehicle in the parking system</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Search By</Label>
            <RadioGroup value={searchType} onValueChange={setSearchType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="plate" id="search-plate" />
                <Label htmlFor="search-plate">License Plate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slot" id="search-slot" />
                <Label htmlFor="search-slot">Parking Slot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ticket" id="search-ticket" />
                <Label htmlFor="search-ticket">Ticket Number</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-query">
              {searchType === "plate" ? "License Plate" : searchType === "slot" ? "Parking Slot" : "Ticket Number"}
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-query"
                className="pl-8"
                placeholder={
                  searchType === "plate"
                    ? "Enter license plate (e.g., ABC-123)"
                    : searchType === "slot"
                      ? "Enter parking slot (e.g., A-15)"
                      : "Enter ticket number"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Find Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
