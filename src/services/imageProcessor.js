/**
 * Automatic Image Processing Service
 * Enhances images automatically for better OCR accuracy
 */
class ImageProcessor {
  /**
   * Process image automatically to improve OCR readability
   */
  async processImageForOCR(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageDataUrl

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas size
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Get image data for processing
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        
        // Apply automatic enhancements
        imageData = this.enhanceForOCR(imageData)
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0)
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/jpeg', 0.95))
      }
    })
  }

  /**
   * Enhance image data for better OCR - combines contrast, brightness, and sharpening
   */
  enhanceForOCR(imageData) {
    const data = new Uint8ClampedArray(imageData.data)
    const length = data.length
    
    // First pass: Convert to grayscale and calculate statistics
    const grayscale = []
    for (let i = 0; i < length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayscale.push(gray)
    }
    
    // Calculate min, max, and average for contrast stretching
    let min = 255, max = 0, sum = 0
    grayscale.forEach(g => {
      if (g < min) min = g
      if (g > max) max = g
      sum += g
    })
    const avg = sum / grayscale.length
    
    // Enhance contrast and brightness
    let idx = 0
    for (let i = 0; i < length; i += 4) {
      let gray = grayscale[idx++]
      
      // Contrast stretching (expand dynamic range)
      if (max > min) {
        gray = Math.round(((gray - min) / (max - min)) * 255)
      }
      
      // Brightness adjustment (target around 128)
      const brightnessAdjust = 128 - avg
      gray = Math.min(255, Math.max(0, gray + brightnessAdjust * 0.3))
      
      // Apply to all channels (grayscale)
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
      // Alpha channel stays the same
    }
    
    return new ImageData(data, imageData.width, imageData.height)
  }

  /**
   * Increase resolution if image is too small (better for OCR)
   */
  async upscaleIfNeeded(imageDataUrl, minWidth = 1200) {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageDataUrl

      img.onload = () => {
        // Only upscale if significantly smaller
        if (img.width >= minWidth * 0.8) {
          resolve(imageDataUrl)
          return
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Scale up using high-quality interpolation
        const scale = minWidth / img.width
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        resolve(canvas.toDataURL('image/jpeg', 0.95))
      }
    })
  }
}

// Export singleton instance
export default new ImageProcessor()
