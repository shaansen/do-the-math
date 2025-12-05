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
      // First, try with full OCR (better accuracy for bills)
      const { data: { text, words } } = await worker.recognize(imageDataUrl)
      
      console.log('OCR Text extracted:', text.substring(0, 500)) // Debug log
      
      // Parse prices from full text (more flexible)
      const result = this.parsePricesFromText(text, words)
      
      console.log('Prices found:', result.prices.length, result.prices) // Debug log
      
      // If no prices found with full OCR, try numbers-only mode
      if (result.prices.length === 0) {
        console.log('No prices found, trying numbers-only mode...')
        
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789.$ ',
        })
        
        const { data: { text: numbersOnlyText, words: numbersOnlyWords } } = await worker.recognize(imageDataUrl)
        console.log('Numbers-only text:', numbersOnlyText.substring(0, 500))
        
        const numbersResult = this.parsePricesFromText(numbersOnlyText, numbersOnlyWords)
        console.log('Numbers-only prices found:', numbersResult.prices.length)
        
        if (numbersResult.prices.length > 0) {
          return numbersResult
        }
      }
      
      return result
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
    
    if (!text || text.trim().length === 0) {
      console.warn('Empty text from OCR')
      return { prices: [], total: 0 }
    }
    
    // More flexible price patterns
    const pricePatterns = [
      /\$(\d+\.\d{2})/g,           // $10.99
      /(\d+\.\d{2})/g,              // 10.99
      /\$\s*(\d+\.\d{2})/g,         // $ 10.99
      /(\d+)\s*\.\s*(\d{2})/g,      // 10 . 99
    ]
    
    // Try each pattern
    pricePatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        let price
        
        if (match[2]) {
          // Handle split decimal pattern
          price = parseFloat(`${match[1]}.${match[2]}`)
        } else {
          price = parseFloat(match[1] || match[0].replace('$', '').trim())
        }
        
        if (!isNaN(price) && price >= 0.01 && price <= 10000) {
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
    })
    
    // Also extract from word boxes for better accuracy
    if (Array.isArray(words) && words.length > 0) {
      words.forEach((word) => {
        if (word && word.text) {
          // Try different patterns on each word
          const wordText = word.text.trim()
          
          // Check for price patterns
          const patterns = [
            /^\$?(\d+\.\d{2})$/,           // $10.99 or 10.99
            /(\d+\.\d{2})/,                // Contains 10.99
          ]
          
          patterns.forEach(pattern => {
            const match = wordText.match(pattern)
            if (match) {
              const price = parseFloat(match[1] || match[0].replace('$', ''))
              if (!isNaN(price) && price >= 0.01 && price <= 10000) {
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
          })
        }
      })
    }
    
    // Remove duplicates and sort prices descending (largest first - likely the total)
    const uniquePrices = Array.from(pricesSet).map(priceKey => {
      return prices.find(p => p.price.toFixed(2) === priceKey)
    }).filter(Boolean)
    
    uniquePrices.sort((a, b) => b.price - a.price)
    
    return {
      prices: uniquePrices,
      total: uniquePrices.length > 0 ? uniquePrices[0].price : 0,
    }
  }
}

// Export singleton instance
export default new OCRService()
