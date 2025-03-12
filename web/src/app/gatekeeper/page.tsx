"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Camera, Car, QrCode, Search, Video } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import CameraModal from "./camera-modal"
import QRModal from "./qr-modal"
import VehicleExitModal from "./vehicle-exit-modal"
import FindVehicleModal from "./find-vehicle-modal"
import StreamFootageModal from "./stream-footage-modal"
import { parkingAPI, vehicleAPI } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GatekeeperPage() {
  const [plateNumber, setPlateNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [isFindVehicleModalOpen, setIsFindVehicleModalOpen] = useState(false)
  const [isStreamFootageModalOpen, setIsStreamFootageModalOpen] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [selectedSection, setSelectedSection] = useState("")
  const [slots, setSlots] = useState([])
  const [sections, setSections] = useState([])
  const [selectedSlot, setSelectedSlot] = useState("")
  const [vehicleType, setVehicleType] = useState("")

  useEffect(() => {
    fetchVehicles()
    fetchParkingSections()
  }, [])

  const fetchSlots = async (sectionId) => {
    try {
      const response = await parkingAPI.getAllSlots(sectionId)
      setSlots(response.data.data || []) // Ensure it's always an array
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch slots", variant: "destructive" })
    }
  }

  const fetchParkingSections = async () => {
    try {
      const response = await parkingAPI.getAllSections()
      setSections(response.data.data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch parking sections", variant: "destructive" })
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAllVehicles()
      setVehicles(response.data.data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch vehicles", variant: "destructive" })
    }
  }

  const handleVehicleEntry = async () => {
    if (!plateNumber || !vehicleType || !selectedSlot) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    setIsProcessing(true)

    try {
      await vehicleAPI.registerEntry({ plateNumber, type: vehicleType, slotId: selectedSlot })
      toast({ title: "Vehicle Registered", description: `Vehicle with plate ${plateNumber} has been registered` })
      setPlateNumber("")
      setVehicleType("")
      setSelectedSection("")
      setSelectedSlot("")
      setSlots([])
      fetchVehicles()
    } catch (error) {
      toast({ title: "Error", description: "Failed to register vehicle", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCameraCapture = (plateNumber: string) => {
    setPlateNumber(plateNumber)
    toast({ title: "Plate Captured", description: `License plate ${plateNumber} has been captured` })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gatekeeper Panel</h2>
        <p className="text-muted-foreground">Manage vehicle entries and exits</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Register Vehicle</CardTitle>
            <CardDescription>Record a new vehicle entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="plate-number">License Plate</Label>
                <Input
                  id="plate-number"
                  placeholder="Enter license plate number"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </div>
              <Button variant="outline" className="mb-0.5" onClick={() => setIsCameraModalOpen(true)}>
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <Label>Parking Section</Label>
            <Select
              onValueChange={(value) => {
                setSelectedSection(value)
                fetchSlots(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section._id} value={section._id}>
                    {section.name || "Unnamed Section"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Vehicle Type</Label>
            <Input
              placeholder="Enter vehicle type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />

            <Label>Parking Slot</Label>
            <Select onValueChange={setSelectedSlot} disabled={!selectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select Slot" />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot._id} value={slot._id}>
                    {slot.name || "Unnamed Slot"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleVehicleEntry} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Register Entry"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common gatekeeper operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => setIsExitModalOpen(true)}
              >
                <Car className="h-6 w-6 mb-1" />
                <span>Register Exit</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center" onClick={() => setIsQRModalOpen(true)}>
                <QrCode className="h-6 w-6 mb-1" />
                <span>Generate QR</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => setIsFindVehicleModalOpen(true)}
              >
                <Search className="h-6 w-6 mb-1" />
                <span>Find Vehicle</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => setIsStreamFootageModalOpen(true)}
              >
                <Video className="h-6 w-6 mb-1" />
                <span>Stream Footage</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Vehicles</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currently Parked Vehicles</CardTitle>
              <CardDescription>Vehicles currently in the parking facility</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles
                    .filter((vehicle) => vehicle.status === "Parked")
                    .map((vehicle) => (
                      <TableRow key={vehicle._id}>
                        <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                        <TableCell>{vehicle.type}</TableCell>
                        <TableCell>{new Date(vehicle.entryTime).toLocaleString()}</TableCell>
                        <TableCell>{vehicle.parkingSlot?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="default">{vehicle.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/vehicle/${vehicle._id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CameraModal open={isCameraModalOpen} onOpenChange={setIsCameraModalOpen} onCapture={handleCameraCapture} />
      <QRModal open={isQRModalOpen} onOpenChange={setIsQRModalOpen} />
      <VehicleExitModal open={isExitModalOpen} onOpenChange={setIsExitModalOpen} />
      <FindVehicleModal open={isFindVehicleModalOpen} onOpenChange={setIsFindVehicleModalOpen} />
      <StreamFootageModal open={isStreamFootageModalOpen} onOpenChange={setIsStreamFootageModalOpen} />
    </div>
  )
}
