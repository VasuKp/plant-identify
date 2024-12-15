import { useState, useRef, useEffect } from 'react'

interface ImageUploadProps {
  onImageSelect: (base64: string) => void
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
  </div>
)

const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCameraSupported, setIsCameraSupported] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreview(base64String)
        onImageSelect(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    setIsLoading(true)
    try {
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints).catch(async () => {
        console.log('Falling back to any available camera')
        return await navigator.mediaDevices.getUserMedia({
          video: true
        })
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setStream(mediaStream)
        setIsCapturing(true)
        setError(null)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted.')
    } finally {
      setIsLoading(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert the canvas to a base64 string
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setPreview(imageData)
        onImageSelect(imageData)

        // Stop the camera stream
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="space-y-6">
      {!isCapturing && !preview && (
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-64 bg-[#22c55e] text-white text-xl font-semibold px-8 py-4 rounded-lg hover:bg-[#1ea550] transition-colors"
          >
            Upload Image
          </button>

          <button
            onClick={startCamera}
            className="w-64 bg-[#22c55e] text-white text-xl font-semibold px-8 py-4 rounded-lg hover:bg-[#1ea550] transition-colors"
          >
            Take Photo
          </button>

          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center text-lg">{error}</div>
      )}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative w-full h-[60vh] bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={captureImage}
              className="bg-[#22c55e] text-white px-6 py-2 rounded-lg hover:bg-[#1ea550] transition-colors"
            >
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="relative w-full h-64">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => preview && onImageSelect(preview)}
              className="bg-[#22c55e] text-white px-6 py-2 rounded-lg hover:bg-[#1ea550] transition-colors flex items-center gap-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              Identify Plant
            </button>
            
            <button
              onClick={() => {
                setPreview(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove Image
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload