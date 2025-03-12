"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Plus, Trash2 } from "lucide-react"
import { parkingAPI, handleApiError } from "@/lib/api"

interface Section {
  _id: string;
  name: string;
  floor: string;
  capacity: number;
  available: number;
  reserved: number;
  status: "Active" | "Inactive" | "Maintenance";
}

interface Slot {
  _id: string;
  name: string;
  type: "Standard" | "Compact" | "Handicap" | "Electric" | "Motorcycle";
  status: "Available" | "Occupied" | "Maintenance";
  reserved: boolean;
}

export default function ParkingManagementPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false)
  const [isAddingSlotOpen, setIsAddingSlotOpen] = useState(false)
  const [newSection, setNewSection] = useState({
    name: "",
    floor: "",
    capacity: "",
    status: "Active",
  })
  const [newSlot, setNewSlot] = useState({
    name: "",
    type: "Standard",
    status: "Available",
    reserved: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchSectionsAndSlots = async () => {
      try {
        const [sectionsResponse, slotsResponse] = await Promise.all([
          parkingAPI.getAllSections(),
          parkingAPI.getAllSlots(),
        ])
        setSections(sectionsResponse.data.data)
        setSlots(slotsResponse.data.data)
      } catch (error) {
        console.error('Error fetching sections and slots:', handleApiError(error))
      }
    }

    fetchSectionsAndSlots()
  }, [])

  const handleAddSection = async () => {
    if (!newSection.name || !newSection.floor || !newSection.capacity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const section = {
        name: newSection.name,
        floor: newSection.floor,
        capacity: Number.parseInt(newSection.capacity),
        status: newSection.status,
      }
      const response = await parkingAPI.createSection(section)
      setSections([...sections, response.data])
      setNewSection({
        name: "",
        floor: "",
        capacity: "",
        status: "Active",
      })
      setIsAddingSectionOpen(false)
      toast({
        title: "Section Added",
        description: `${section.name} has been added successfully`,
      })
    } catch (error) {
      console.error('Error adding section:', handleApiError(error))
    }
  }

  const handleAddSlot = async () => {
    if (!newSlot.name || !newSlot.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const slot = {
        name: newSlot.name,
        type: newSlot.type,
        status: newSlot.status,
        reserved: newSlot.reserved,
      }
      const response = await parkingAPI.createSlot(slot)
      setSlots([...slots, response.data])
      setNewSlot({
        name: "",
        type: "Standard",
        status: "Available",
        reserved: false,
      })
      setIsAddingSlotOpen(false)
      toast({
        title: "Slot Added",
        description: `Slot ${slot.name} has been added successfully`,
      })
    } catch (error) {
      console.error('Error adding slot:', handleApiError(error))
    }
  }

  const handleDeleteSection = async (id: string) => {
    try {
      await parkingAPI.deleteSection(id)
      setSections(sections.filter((section) => section._id !== id))
      toast({
        title: "Section Deleted",
        description: "The parking section has been deleted",
      })
    } catch (error) {
      console.error('Error deleting section:', handleApiError(error))
    }
  }

  const handleDeleteSlot = async (id: string) => {
    try {
      await parkingAPI.deleteSlot(id)
      setSlots(slots.filter((slot) => slot._id !== id))
      toast({
        title: "Slot Deleted",
        description: "The parking slot has been deleted",
      })
    } catch (error) {
      console.error('Error deleting slot:', handleApiError(error))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parking Management</h2>
          <p className="text-muted-foreground">Manage parking sections and slots</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddingSectionOpen} onOpenChange={setIsAddingSectionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Parking Section</DialogTitle>
                <DialogDescription>Create a new parking section with the details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="section-name"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., Section A"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section-floor" className="text-right">
                    Floor
                  </Label>
                  <Input
                    id="section-floor"
                    value={newSection.floor}
                    onChange={(e) => setNewSection({ ...newSection, floor: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., Ground Floor"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section-capacity" className="text-right">
                    Capacity
                  </Label>
                  <Input
                    id="section-capacity"
                    type="number"
                    value={newSection.capacity}
                    onChange={(e) => setNewSection({ ...newSection, capacity: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., 50"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newSection.status}
                    onValueChange={(value) => setNewSection({ ...newSection, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingSectionOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSection}>Add Section</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="layout">Layout View</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parking Sections</CardTitle>
              <CardDescription>View and manage all parking sections</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section._id}>
                      <TableCell className="font-medium">{section.name}</TableCell>
                      <TableCell>{section.floor}</TableCell>
                      <TableCell>{section.capacity}</TableCell>
                      <TableCell>{section.available}</TableCell>
                      <TableCell>{section.reserved}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            section.status === "Active"
                              ? "default"
                              : section.status === "Inactive"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {section.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedSection(section._id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(section._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Parking Slots</CardTitle>
                <CardDescription>View and manage individual parking slots</CardDescription>
              </div>
              <Dialog open={isAddingSlotOpen} onOpenChange={setIsAddingSlotOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Parking Slot</DialogTitle>
                    <DialogDescription>Create a new parking slot with the details below.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="slot-name" className="text-right">
                        Name/Number
                      </Label>
                      <Input
                        id="slot-name"
                        value={newSlot.name}
                        onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., A-01"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="slot-type" className="text-right">
                        Type
                      </Label>
                      <Select value={newSlot.type} onValueChange={(value) => setNewSlot({ ...newSlot, type: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Compact">Compact</SelectItem>
                          <SelectItem value="Handicap">Handicap</SelectItem>
                          <SelectItem value="Electric">Electric Vehicle</SelectItem>
                          <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="slot-status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={newSlot.status}
                        onValueChange={(value) => setNewSlot({ ...newSlot, status: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Occupied">Occupied</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="slot-reserved" className="text-right">
                        Reserved
                      </Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Switch
                          id="slot-reserved"
                          checked={newSlot.reserved}
                          onCheckedChange={(checked) => setNewSlot({ ...newSlot, reserved: checked })}
                        />
                        <Label htmlFor="slot-reserved">{newSlot.reserved ? "Yes" : "No"}</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingSlotOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSlot}>Add Slot</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="filter-section">Filter by Section</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full max-w-xs mt-1">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section._id} value={section._id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot._id}>
                      <TableCell className="font-medium">{slot.name}</TableCell>
                      <TableCell>{slot.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            slot.status === "Available"
                              ? "default"
                              : slot.status === "Occupied"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {slot.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{slot.reserved ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parking Layout</CardTitle>
              <CardDescription>Visual representation of parking sections and slots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="layout-section">Select Section</Label>
                <Select defaultValue="section-1">
                  <SelectTrigger className="w-full max-w-xs mt-1">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section._id} value={section._id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md p-4">
                <div className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 24 }).map((_, index) => {
                    const slotStatus = index % 5 === 0 ? "Occupied" : index % 7 === 0 ? "Maintenance" : "Available"
                    const isReserved = index % 4 === 0

                    return (
                      <div
                        key={index}
                        className={`aspect-[4/3] rounded-md flex flex-col items-center justify-center p-2 border-2 ${slotStatus === "Available"
                          ? "bg-green-100 border-green-500"
                          : slotStatus === "Occupied"
                            ? "bg-blue-100 border-blue-500"
                            : "bg-red-100 border-red-500"
                          } ${isReserved ? "ring-2 ring-yellow-400" : ""}`}
                      >
                        <div className="text-sm font-medium">A-{(index + 1).toString().padStart(2, "0")}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {slotStatus === "Available" ? "Free" : slotStatus}
                        </div>
                        {isReserved && (
                          <Badge variant="outline" className="mt-1 text-[10px] h-4">
                            Reserved
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded-sm"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded-sm"></div>
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded-sm"></div>
                  <span className="text-sm">Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 ring-2 ring-yellow-400 rounded-sm"></div>
                  <span className="text-sm">Reserved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedSection && (
        <Dialog open={!!selectedSection} onOpenChange={(open) => !open && setSelectedSection(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Parking Section</DialogTitle>
              <DialogDescription>Update the details of this parking section.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-section-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-section-name"
                  defaultValue={sections.find((s) => s._id === selectedSection)?.name}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-section-floor" className="text-right">
                  Floor
                </Label>
                <Input
                  id="edit-section-floor"
                  defaultValue={sections.find((s) => s._id === selectedSection)?.floor}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-section-capacity" className="text-right">
                  Capacity
                </Label>
                <Input
                  id="edit-section-capacity"
                  type="number"
                  defaultValue={sections.find((s) => s._id === selectedSection)?.capacity}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-section-status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={sections.find((s) => s._id === selectedSection)?.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSection(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Section Updated",
                    description: "The parking section has been updated successfully",
                  })
                  setSelectedSection(null)
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
