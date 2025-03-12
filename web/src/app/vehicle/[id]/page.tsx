"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Car, Clock, MapPin, QrCode, AlertCircle } from "lucide-react"
import VehicleExitModal from "../../gatekeeper/vehicle-exit-modal"
import QRModal from "../../gatekeeper/qr-modal"
import { vehicleAPI } from "@/lib/api"
import { formatDuration, intervalToDuration } from "date-fns"
import { useParams } from 'next/navigation'

export default function VehicleDetailsPage() {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [vehicle, setVehicle] = useState<any>(null)
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams<{ tag: string; item: string }>()

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch vehicle details
        const response = await vehicleAPI.getVehicleById(params.id)
        const vehicleData = response.data.data

        if (!vehicleData) {
          throw new Error("Vehicle not found")
        }

        // Calculate duration if vehicle is still parked
        if (vehicleData.entryTime && vehicleData.status === "Parked") {
          const entryTime = new Date(vehicleData.entryTime)
          const now = new Date()
          vehicleData.duration = formatDuration(intervalToDuration({ start: entryTime, end: now }))
        }

        setVehicle(vehicleData)

        // Create activity log from vehicle data
        const logs = []

        if (vehicleData.entryTime) {
          logs.push({
            time: new Date(vehicleData.entryTime).toLocaleTimeString(),
            action: `Vehicle entered through ${vehicleData.entryGate || "Main Gate"}`,
            date: new Date(vehicleData.entryTime).toLocaleDateString(),
          })
        }

        if (vehicleData.parkingSlot) {
          logs.push({
            time: new Date(vehicleData.entryTime).toLocaleTimeString(),
            action: `Assigned to parking slot ${vehicleData.parkingSlot.name || "Unknown"}`,
            date: new Date(vehicleData.entryTime).toLocaleDateString(),
          })
        }

        if (vehicleData.payments && vehicleData.payments.length > 0) {
          vehicleData.payments.forEach((payment: any) => {
            logs.push({
              time: new Date(payment.createdAt).toLocaleTimeString(),
              action: `Payment of $${payment.amount?.toFixed(2)} processed (${payment.method})`,
              date: new Date(payment.createdAt).toLocaleDateString(),
            })
          })
        }

        if (vehicleData.exitTime) {
          logs.push({
            time: new Date(vehicleData.exitTime).toLocaleTimeString(),
            action: `Vehicle exited through ${vehicleData.exitGate || "Main Gate"}`,
            date: new Date(vehicleData.exitTime).toLocaleDateString(),
          })
        }

        setActivityLog(logs)
      } catch (error) {
        console.error("Error fetching vehicle details:", error)
        setError("Failed to load vehicle details. Please try again.")

      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicleDetails()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/gatekeeper">
            <Button variant="ghost" className="gap-2 p-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Gatekeeper Panel
            </Button>
          </Link>
        </div>

        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4 w-full" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/gatekeeper">
            <Button variant="ghost" className="gap-2 p-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Gatekeeper Panel
            </Button>
          </Link>
        </div>

        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Vehicle Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The vehicle you are looking for does not exist or has been removed.</p>
            <Link href="/gatekeeper">
              <Button className="mt-4 w-full">Return to Gatekeeper Panel</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/gatekeeper">
          <Button variant="ghost" className="gap-2 p-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Gatekeeper Panel
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Car className="h-6 w-6" />
            Vehicle Details
          </h1>
          <p className="text-muted-foreground">Information about vehicle {vehicle.plateNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsQRModalOpen(true)} disabled={vehicle.status !== "Parked"}>
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR
          </Button>
          <Button onClick={() => setIsExitModalOpen(true)} disabled={vehicle.status !== "Parked"}>
            Register Exit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>Details about the vehicle and its current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">License Plate</h3>
                  <p className="text-xl font-semibold">{vehicle.plateNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Vehicle Type</h3>
                  <p>{vehicle.type || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Make & Model</h3>
                  <p>
                    {vehicle.make || "Unknown"} {vehicle.model || ""}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
                  <p>{vehicle.color || "Not specified"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge className="mt-1" variant={vehicle.status === "Parked" ? "default" : "secondary"}>
                    {vehicle.status || "Unknown"}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Entry Time</h3>
                  <p className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Parking Slot</h3>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {vehicle.parkingSlot?.name || "Not assigned"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                  <p>{vehicle.duration || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                  <Badge
                    variant={
                      vehicle.paymentStatus === "Paid"
                        ? "default"
                        : vehicle.paymentStatus === "Pending"
                          ? "outline"
                          : "destructive"
                    }
                    className="mt-1"
                  >
                    {vehicle.paymentStatus || "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Image</CardTitle>
            <CardDescription>Captured at entry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
              {vehicle.imageUrl ? (
                <Image src={vehicle.imageUrl || "/placeholder.svg"} alt="Vehicle" fill className="object-cover" />
              ) : (
                <Image src="/placeholder.svg?height=200&width=300" alt="Vehicle" fill className="object-cover" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="owner">Owner Information</TabsTrigger>
            <TabsTrigger value="footage">Recorded Footage</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Record of vehicle activities</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLog.length > 0 ? (
                  <div className="space-y-4">
                    {activityLog.map((log, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="min-w-[100px] text-sm text-muted-foreground">{log.time}</div>
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No activity records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
                <CardDescription>Details about the vehicle owner</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicle.owner ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p>{vehicle.owner.name || "Not provided"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Contact Number</h3>
                        <p>{vehicle.owner.contactNumber || "Not provided"}</p>
                      </div>
                      {vehicle.owner.email && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                          <p>{vehicle.owner.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No owner information available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="footage">
            <Card>
              <CardHeader>
                <CardTitle>Recorded Footage</CardTitle>
                <CardDescription>Security camera footage of the vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicle.footageUrls && vehicle.footageUrls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicle.footageUrls.map((url: string, index: number) => (
                      <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
                        <video
                          src={url}
                          controls
                          className="w-full h-full object-cover"
                          poster="/placeholder.svg?height=200&width=300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                    <p className="text-muted-foreground">No footage available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <VehicleExitModal open={isExitModalOpen} onOpenChange={setIsExitModalOpen} />

      <QRModal open={isQRModalOpen} onOpenChange={setIsQRModalOpen} />
    </div>
  )
}
