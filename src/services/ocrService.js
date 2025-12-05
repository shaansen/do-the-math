import { createWorker } from 'tesseract.js'

/**
 * OCR Service using Tesseract.js
 * Optimized for extracting prices from bill images
 */
class OCRService {
  /**
   * Extract all prices from a bill image using Tesseract.js
   */
  async extractPrices(imageDataUrl) {
    const worker = await createWorker('eng')
    
    try {
      // Optimize Tesseract for numbers and prices
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.$',
        tessedit_pageseg_mode: '6', // Assume uniform block of text
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine only
      })
      
      // Perform OCR with detailed word information
      const { data: { text, words } } = await worker.recognize(imageDataUrl, {
        rectangle: null, // Process entire image
      })
      
      return this.parsePricesFromText(text, words)
    } finally {
      await worker.terminate()
    }
  }

  /**
   * Parse prices from OCR text results
   */
  parsePricesFromText(text, words = []) {
    const pricesSet = new Set()
    const prices = []
    
    // Extract prices from main text (format: $XX.XX or XX.XX)
    const pricePattern = /\$?(\d+\.\d{2})/g
    let match
    
    while ((match = pricePattern.exec(text)) !== null) {
      const price = parseFloat(match[1])
      if (price >= 0.5 && price <= 1000) {
        const priceKey = price.toFixed(2)
        if (!pricesSet.has(priceKey)) {
          pricesSet.add(priceKey)
          prices.push({
            id: `price_${Date.now()}_${Math.random()}`,
            price: price,
            assignment: 'both',
          })
        }
      }
    }
    
    // Also extract from word boxes for better accuracy
    if (Array.isArray(words) && words.length > 0) {
      words.forEach((word) => {
        if (word.text) {
          const priceMatch = word.text.match(/\$?(\d+\.\d{2})/)
          if (priceMatch) {
            const price = parseFloat(priceMatch[1])
            if (price >= 0.5 && price <= 1000) {
              const priceKey = price.toFixed(2)
              if (!pricesSet.has(priceKey)) {
                pricesSet.add(priceKey)
                prices.push({
                  id: `price_${Date.now()}_${Math.random()}`,
                  price: price,
                  assignment: 'both',
                })
              }
            }
          }
        }
      })
    }
    
    // Sort prices descending (largest first - likely the total)
    prices.sort((a, b) => b.price - a.price)
    
    return {
      prices,
      total: prices.length > 0 ? prices[0].price : 0,
    }
  }
}

// Export singleton instance
export default new OCRService()
