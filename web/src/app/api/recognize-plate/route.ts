import { type NextRequest, NextResponse } from "next/server"

// Set a longer timeout for this API route
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const imageFile = formData.get("upload")

    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Get the PlateRecognizer API key from environment variables
    const apiKey = process.env.PLATE_RECOGNIZER_API_KEY

    if (!apiKey) {
      console.error("PLATE_RECOGNIZER_API_KEY is not set")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Create a new FormData object for the API request
    const apiFormData = new FormData()
    apiFormData.append("upload", imageFile)
    apiFormData.append("regions", "us,eu") // Adjust regions as needed

    // Call the PlateRecognizer API
    const response = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
      },
      body: apiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("PlateRecognizer API error:", errorText)
      return NextResponse.json({ error: "Failed to recognize plate" }, { status: response.status })
    }

    // Parse and return the API response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in recognize-plate API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
