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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Download, QrCode } from "lucide-react"

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function QRModal({ open, onOpenChange }: QRModalProps) {
  const [validityPeriod, setValidityPeriod] = useState("24h")
  const [accessLevel, setAccessLevel] = useState("standard")
  const [plateNumber, setPlateNumber] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setQrCodeUrl(null)
      setQrCodeData(null)
    }
  }, [open])

  const handleGenerate = async () => {
    if (!plateNumber) {
      toast({
        title: "Error",
        description: "Please enter a license plate number",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Get the domain from environment or use a default
      const domain = process.env.NEXT_PUBLIC_DOMAIN || window.location.origin

      // Create the URL for the QR code
      const qrData = `${domain}/footage/${plateNumber}`
      setQrCodeData(qrData)

      // Generate QR code using the QR code API
      const response = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200&margin=10`,
      )

      if (!response.ok) {
        throw new Error("Failed to generate QR code")
      }

      // Convert the response to a blob URL
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setQrCodeUrl(url)

      toast({
        title: "QR Code Generated",
        description: `QR code valid for ${validityPeriod} with ${accessLevel} access`,
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!qrCodeUrl) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `qr-${plateNumber}-${validityPeriod}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been downloaded",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate QR Code</DialogTitle>
          <DialogDescription>Create a QR code for vehicle access</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plate-number">License Plate</Label>
            <Input
              id="plate-number"
              placeholder="Enter license plate number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validity">Validity Period</Label>
              <Select value={validityPeriod} onValueChange={setValidityPeriod}>
                <SelectTrigger id="validity">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="12h">12 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="access">Access Level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger id="access">
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !plateNumber}>
              {isGenerating ? (
                <>
                  <QrCode className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>

          {qrCodeUrl && (
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-md">
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="h-32 w-32 mb-2" />
              <p className="text-sm text-muted-foreground">QR Code for vehicle access: {plateNumber}</p>
              {qrCodeData && <p className="text-xs text-muted-foreground mt-1 mb-3">{qrCodeData}</p>}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
