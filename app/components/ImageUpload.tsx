import { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'

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
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const webcamRef = useRef<Webcam>(null)

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkDevice();
  }, []);

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

  const startCamera = () => {
    setError(null)
    setIsCapturing(true)
  }

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        setPreview(imageSrc)
        onImageSelect(imageSrc)
        setIsCapturing(false)
      }
    }
  }, [onImageSelect])

  // Different video constraints for mobile and desktop
  const videoConstraints = isMobile ? {
    width: 1280,
    height: 720,
    facingMode: { exact: "environment" }
  } : {
    width: 1280,
    height: 720,
    facingMode: "user"
  }

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Webcam Error:', error)
    setError('Unable to access camera. Please ensure camera permissions are granted.')
    setIsCapturing(false)
  }, [])

  return (
    <div className="space-y-6">
      {!isCapturing && !preview && (
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-64 bg-[#22c55e] text-white text-xl font-semibold px-8 py-4 rounded-lg hover:bg-[#1ea550] transition-colors shadow-md"
          >
            Upload Image
          </button>

          <button
            onClick={startCamera}
            className="w-64 bg-[#22c55e] text-white text-xl font-semibold px-8 py-4 rounded-lg hover:bg-[#1ea550] transition-colors shadow-md"
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

      {isLoading && <LoadingSpinner />}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative w-full h-[60vh] bg-black rounded-lg overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={handleUserMediaError}
              className="absolute top-0 left-0 w-full h-full object-contain"
              mirrored={!isMobile} // Mirror only on desktop for better UX
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
              onClick={() => setIsCapturing(false)}
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
              className="bg-[#22c55e] text-white px-6 py-2 rounded-lg hover:bg-[#1ea550] transition-colors flex items-center gap-2 relative"
              disabled={isLoading}
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