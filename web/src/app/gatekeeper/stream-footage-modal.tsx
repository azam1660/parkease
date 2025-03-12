"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Play, Pause, Video, RefreshCw, Camera } from "lucide-react"

interface StreamFootageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function StreamFootageModal({ open, onOpenChange }: StreamFootageModalProps) {
  const [activeTab, setActiveTab] = useState("live")
  const [selectedCamera, setSelectedCamera] = useState("entrance")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [rtspUrl, setRtspUrl] = useState("")
  const [showRtspInput, setShowRtspInput] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  // Clean up when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Reset streaming state when modal opens/closes
  useEffect(() => {
    if (!open) {
      handleStopStream()
      setIsRecording(false)
    }
  }, [open])

  const handleCameraChange = (value: string) => {
    setSelectedCamera(value)
    setShowRtspInput(value === "custom")
    if (isStreaming) {
      handleStopStream()
    }
  }

  const handleStartStream = async () => {
    if (selectedCamera === "custom" && !rtspUrl) {
      toast({
        title: "RTSP URL Required",
        description: "Please enter an RTSP URL for the custom camera",
        variant: "destructive",
      })
      return
    }

    setIsStreaming(true)

    try {
      // In a real implementation, this would connect to the selected camera
      // For now, we're using the user's webcam as a placeholder
      if (selectedCamera !== "custom") {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } else {
        // For RTSP streams, you would typically use a server-side proxy
        // or a WebRTC gateway to convert RTSP to WebRTC
        toast({
          title: "RTSP Connection",
          description: "Connecting to RTSP stream (simulated)",
        })

        // Simulate connection delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // In a real implementation, you would connect to the RTSP stream
        // For now, we'll just use the webcam as a placeholder
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }

      toast({
        title: "Camera Connected",
        description: `Live feed from ${selectedCamera === "custom" ? "RTSP stream" : selectedCamera} camera`,
      })
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsStreaming(false)
      toast({
        title: "Camera Error",
        description: "Could not access camera",
        variant: "destructive",
      })
    }
  }

  const handleStopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setIsStreaming(false)
    if (isRecording) {
      setIsRecording(false)
      toast({
        title: "Recording Stopped",
        description: "The recording has been stopped",
      })
    }

    toast({
      title: "Stream Stopped",
      description: "The camera stream has been stopped",
    })
  }

  const handleToggleRecording = () => {
    if (!isStreaming) {
      toast({
        title: "Start Stream First",
        description: "Please start the stream before recording",
        variant: "destructive",
      })
      return
    }

    setIsRecording(!isRecording)

    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Recording footage from the camera",
      })
    } else {
      toast({
        title: "Recording Stopped",
        description: "The recording has been saved",
      })
    }
  }

  const handleCaptureImage = () => {
    if (!isStreaming || !videoRef.current) {
      toast({
        title: "Start Stream First",
        description: "Please start the stream before capturing an image",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a canvas element to capture the current video frame
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      // Draw the current video frame to the canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Convert the canvas to a data URL and trigger a download
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `capture-${new Date().toISOString().replace(/:/g, "-")}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Image Captured",
          description: "The image has been saved",
        })
      }
    } catch (error) {
      console.error("Error capturing image:", error)
      toast({
        title: "Capture Error",
        description: "Failed to capture image",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Stream Footage</DialogTitle>
          <DialogDescription>View live camera feeds and record footage</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">Live View</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
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
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Camera feed will appear here</p>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 text-white px-2 py-1 rounded-md">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs">REC</span>
                </div>
              )}
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

              <div className="flex gap-2">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={handleToggleRecording}
                  disabled={!isStreaming}
                >
                  {isRecording ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Record
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={handleCaptureImage} disabled={!isStreaming}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recordings" className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-center">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No recordings available</p>
              <p className="text-xs text-muted-foreground mt-1">Recordings will appear here after you record footage</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab("live")}>
                Go to Live View
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
