import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageSelect: (base64: string) => void
}

const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      // First, check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser');
      }

      // Request camera access with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile devices
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Store the stream in state
      setStream(mediaStream);

      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play(); // Explicitly start playing
      }

      setIsCapturing(true);
      setError(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Flip the image horizontally if using front camera
          // ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0);
          
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(imageData);
          stopCamera();
        }
      } catch (err) {
        console.error('Error capturing image:', err);
        setError('Failed to capture image');
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
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