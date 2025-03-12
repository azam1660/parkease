"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Upload, Play, Pause, RefreshCw } from "lucide-react"

interface CameraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (plateNumber: string) => void
}

export default function CameraModal({ open, onOpenChange, onCapture }: CameraModalProps) {
  const [activeTab, setActiveTab] = useState("camera")
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState("entrance")
  const [plateNumber, setPlateNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const [rtspUrl, setRtspUrl] = useState("")
  const [showRtspInput, setShowRtspInput] = useState(false)

  // Handle camera stream
  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      if (open && activeTab === "camera" && isStreaming && videoRef.current) {
        try {
          // For real implementation, this would connect to the selected camera
          // For now, we're using the user's webcam
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }

          toast({
            title: "Camera Connected",
            description: `Live feed from ${selectedCamera === "entrance" ? "Entrance" : "Exit"} camera`,
          })
        } catch (error) {
          console.error("Error accessing camera:", error)
          toast({
            title: "Camera Error",
            description: "Could not access camera",
            variant: "destructive",
          })
          setIsStreaming(false)
        }
      }
    }

    startCamera()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [open, activeTab, isStreaming, selectedCamera, toast])

  const handleStartStream = () => {
    if (selectedCamera === "custom" && !rtspUrl) {
      toast({
        title: "RTSP URL Required",
        description: "Please enter an RTSP URL for the custom camera",
        variant: "destructive",
      })
      return
    }

    setIsStreaming(true)
    toast({
      title: "Connecting to Camera",
      description: `Connecting to ${selectedCamera === "entrance" ? "Entrance" : selectedCamera === "exit" ? "Exit" : "Custom"} camera...`,
    })
  }

  const handleStopStream = () => {
    setIsStreaming(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    toast({
      title: "Camera Disconnected",
      description: "The camera stream has been stopped",
    })
  }

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsProcessing(true)

    try {
      // Capture frame from video
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Could not get canvas context")
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else throw new Error("Could not create blob from canvas")
          },
          "image/jpeg",
          0.95,
        )
      })

      // Create FormData for API request
      const formData = new FormData()
      formData.append("upload", blob, "capture.jpg")

      // Call PlateRecognizer API
      const response = await fetch("/api/recognize-plate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to recognize plate")
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const detectedPlate = data.results[0].plate.toUpperCase()
        setPlateNumber(detectedPlate)

        // Create data URL from canvas for preview
        const dataUrl = canvas.toDataURL("image/jpeg")
        setImagePreview(dataUrl)

        toast({
          title: "Plate Detected",
          description: `License plate ${detectedPlate} detected`,
        })
      } else {
        toast({
          title: "No Plate Detected",
          description: "Could not detect a license plate in the image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error capturing plate:", error)
      toast({
        title: "Error",
        description: "Failed to process the image",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setIsProcessing(true)

      try {
        // Preview the uploaded image
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagePreview(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)

        // Create FormData for API request
        const formData = new FormData()
        formData.append("upload", file)

        // Call PlateRecognizer API
        const response = await fetch("/api/recognize-plate", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to recognize plate")
        }

        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const detectedPlate = data.results[0].plate.toUpperCase()
          setPlateNumber(detectedPlate)

          toast({
            title: "Plate Detected",
            description: `License plate ${detectedPlate} detected from image`,
          })
        } else {
          toast({
            title: "No Plate Detected",
            description: "Could not detect a license plate in the image",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error processing image:", error)
        toast({
          title: "Error",
          description: "Failed to process the image",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleConfirm = () => {
    if (plateNumber) {
      onCapture(plateNumber)
      onOpenChange(false)
      setImagePreview(null)
      setPlateNumber("")
    } else {
      toast({
        title: "No Plate Detected",
        description: "Please capture or enter a license plate number",
        variant: "destructive",
      })
    }
  }

  const handleCameraChange = (value: string) => {
    setSelectedCamera(value)
    setShowRtspInput(value === "custom")
    if (isStreaming) {
      handleStopStream()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Vehicle License Plate</DialogTitle>
          <DialogDescription>Capture or upload an image of the vehicle license plate</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">Live Camera</TabsTrigger>
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="camera-select">Select Camera</Label>
              <Select value={selectedCamera} onValueChange={handleCameraChange} disabled={isStreaming}>
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrance">Entrance Camera</SelectItem>
                  <SelectItem value="exit">Exit Camera</SelectItem>
                  <SelectItem value="parking-a">Parking Area A</SelectItem>
                  <SelectItem value="parking-b">Parking Area B</SelectItem>
                  <SelectItem value="custom">Custom RTSP Stream</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showRtspInput && (
              <div className="space-y-2">
                <Label htmlFor="rtsp-url">RTSP URL</Label>
                <Input
                  id="rtsp-url"
                  placeholder="rtsp://username:password@ip:port/stream"
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  disabled={isStreaming}
                />
              </div>
            )}

            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              {isStreaming ? (
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              ) : imagePreview ? (
                <img src={imagePreview || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Camera feed will appear here</p>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" width="640" height="480" />
            </div>

            <div className="flex justify-between">
              {!isStreaming ? (
                <Button onClick={handleStartStream}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Stream
                </Button>
              ) : (
                <Button variant="outline" onClick={handleStopStream}>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Stream
                </Button>
              )}

              <Button onClick={handleCapture} disabled={!isStreaming || isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Plate
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Upload Vehicle Image</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleFileUpload} disabled={isProcessing} />
            </div>

            <div className="h-[200px] bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Processing image...</p>
                </div>
              ) : imagePreview ? (
                <img src={imagePreview || "/placeholder.svg"} alt="Uploaded" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload an image to process</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 mt-4">
          <Label htmlFor="plate-number">License Plate Number</Label>
          <div className="flex gap-2">
            <Input
              id="plate-number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="Enter or confirm license plate"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
