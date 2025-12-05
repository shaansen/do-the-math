import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import './ImageUpload.css'

function ImageUpload({ onImageSelect, onImageProcessed, skipAutoProcess = false }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      processImage(file)
    }
  }

  const processImage = async (file) => {
    if (skipAutoProcess) {
      // Just load the image, don't process it
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageDataUrl = reader.result
        setPreview(imageDataUrl)
        onImageSelect(imageDataUrl)
      }
      reader.readAsDataURL(file)
      return
    }

    setIsProcessing(true)
    setError(null)
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageDataUrl = reader.result
      setPreview(imageDataUrl)
      onImageSelect(imageDataUrl)
      
      try {
        await performOCR(imageDataUrl)
      } catch (err) {
        setError('Failed to process image. Please try again or manually add items.')
        console.error('OCR Error:', err)
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const performOCR = async (imageDataUrl) => {
    const worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(imageDataUrl)
    await worker.terminate()
    
    const items = parseReceipt(text)
    if (items.length === 0) {
      // If OCR didn't find items, allow manual entry
      setError('Could not automatically detect items. Please add them manually.')
      onImageProcessed([], 0, 0, 0)
      return
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    const total = findTotal(text)
    const tax = Math.max(0, total - subtotal)
    
    onImageProcessed(items, subtotal, tax, total)
  }

  const parseReceipt = (text) => {
    const items = []
    const lines = text.split('\n').filter(line => line.trim())
    
    // Pattern to match item name and price
    // Common formats: "Item Name $10.99" or "Item Name 10.99"
    const pricePattern = /[\$]?(\d+\.\d{2})/
    
    for (const line of lines) {
      // Skip common non-item lines
      if (line.match(/total|subtotal|tax|tip|change|cash|credit|debit|visa|mastercard/i)) {
        continue
      }
      
      const priceMatch = line.match(pricePattern)
      if (priceMatch) {
        const price = parseFloat(priceMatch[1])
        // Only include items with reasonable prices (between $0.50 and $1000)
        if (price >= 0.5 && price <= 1000) {
          const itemName = line.replace(pricePattern, '').trim()
          if (itemName.length > 0 && itemName.length < 100) {
            items.push({
              name: itemName || 'Item',
              price: price,
              assignment: 'both'
            })
          }
        }
      }
    }
    
    return items.slice(0, 20) // Limit to 20 items
  }

  const findTotal = (text) => {
    const totalPatterns = [
      /total[\s:]*\$?(\d+\.\d{2})/i,
      /amount[\s:]*\$?(\d+\.\d{2})/i,
      /\$?(\d+\.\d{2})[\s]*total/i
    ]
    
    for (const pattern of totalPatterns) {
      const match = text.match(pattern)
      if (match) {
        return parseFloat(match[1])
      }
    }
    
    // Find the largest number that could be the total
    const numbers = text.match(/\$?(\d+\.\d{2})/g)
    if (numbers && numbers.length > 0) {
      const parsedNumbers = numbers.map(n => parseFloat(n.replace('$', '')))
      return Math.max(...parsedNumbers)
    }
    
    return 0
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
        setError(null)
      }
    } catch (err) {
      setError('Unable to access camera. Please use file upload instead.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'bill.jpg', { type: 'image/jpeg' })
        stopCamera()
        processImage(file)
      }, 'image/jpeg', 0.9)
    }
  }

  return (
    <div className="image-upload-container">
      {!showCamera ? (
        <div className="upload-options">
          <div className="upload-card">
            <div className="upload-icon">📸</div>
            <h2>Upload Your Bill</h2>
            <p>Take a photo or upload an image of your receipt</p>
            
            <div className="button-group">
              <button 
                className="upload-button camera-button"
                onClick={startCamera}
              >
                📷 Use Camera
              </button>
              <button 
                className="upload-button file-button"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Choose File
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      ) : (
        <div className="camera-container">
          <video ref={videoRef} autoPlay playsInline className="camera-preview" />
          <div className="camera-controls">
            <button className="camera-btn cancel-btn" onClick={stopCamera}>
              Cancel
            </button>
            <button className="camera-btn capture-btn" onClick={capturePhoto}>
              📷 Capture
            </button>
          </div>
        </div>
      )}
      
      {preview && !showCamera && (
        <div className="image-preview">
          <img src={preview} alt="Bill preview" />
        </div>
      )}
      
      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>Processing your bill...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default ImageUpload

