import { createWorker } from 'tesseract.js'

/**
 * OCR Service using Tesseract.js with OCR.space fallback
 * Optimized for extracting prices from bill images
 */
class OCRService {
  /**
   * Extract all prices from a bill image using Tesseract.js, with OCR.space fallback
   */
  async extractPrices(imageDataUrl) {
    // First, try Tesseract.js (client-side, private)
    try {
      const result = await this.extractPricesWithTesseract(imageDataUrl)
      
      // If Tesseract found prices, return them
      if (result.prices.length > 0) {
        console.log('Tesseract found', result.prices.length, 'prices')
        return result
      }
      
      // If no prices found, try OCR.space as fallback
      console.log('No prices found with Tesseract, trying OCR.space...')
      const ocrSpaceResult = await this.extractPricesWithOCRSpace(imageDataUrl)
      
      if (ocrSpaceResult.prices.length > 0) {
        console.log('OCR.space found', ocrSpaceResult.prices.length, 'prices')
        return ocrSpaceResult
      }
      
      // Return empty result if both fail
      return result
    } catch (error) {
      console.error('Tesseract error:', error)
      // Try OCR.space as fallback if Tesseract fails completely
      try {
        console.log('Tesseract failed, trying OCR.space fallback...')
        return await this.extractPricesWithOCRSpace(imageDataUrl)
      } catch (ocrSpaceError) {
        console.error('OCR.space error:', ocrSpaceError)
        throw new Error('Both OCR methods failed. Please try adding prices manually.')
      }
    }
  }

  /**
   * Extract prices using Tesseract.js (client-side)
   */
  async extractPricesWithTesseract(imageDataUrl) {
    const worker = await createWorker('eng')
    
    try {
      // First, try with full OCR (better accuracy for bills)
      const { data: { text, words } } = await worker.recognize(imageDataUrl)
      
      console.log('Tesseract OCR Text extracted:', text.substring(0, 500)) // Debug log
      
      // Parse prices from full text (more flexible)
      const result = this.parsePricesFromText(text, words)
      
      console.log('Tesseract prices found:', result.prices.length, result.prices) // Debug log
      
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
   * Extract prices using OCR.space API (cloud-based fallback)
   * Free tier: 25,000 requests/month, no API key required (but recommended)
   */
  async extractPricesWithOCRSpace(imageDataUrl) {
    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()
      
      // Create form data for OCR.space API
      const formData = new FormData()
      // No API key needed for free tier (25k requests/month)
      // But you can add one if you have it: formData.append('apikey', 'your-api-key')
      formData.append('language', 'eng')
      formData.append('isOverlayRequired', 'false')
      formData.append('OCREngine', '2') // Engine 2 is better for receipts/bills
      formData.append('file', blob, 'bill.jpg')
      
      console.log('Sending request to OCR.space...')
      
      const apiResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      })
      
      if (!apiResponse.ok) {
        throw new Error(`OCR.space API error: ${apiResponse.status}`)
      }
      
      const data = await apiResponse.json()
      
      if (data.OCRExitCode !== 1) {
        throw new Error(`OCR.space processing failed: ${data.ErrorMessage || 'Unknown error'}`)
      }
      
      // Extract text from all parsed results
      let fullText = ''
      if (data.ParsedResults && data.ParsedResults.length > 0) {
        fullText = data.ParsedResults.map(result => result.ParsedText || '').join('\n')
      }
      
      console.log('OCR.space text extracted:', fullText.substring(0, 500))
      
      // Parse prices from the text
      const result = this.parsePricesFromText(fullText)
      console.log('OCR.space prices found:', result.prices.length)
      
      return result
    } catch (error) {
      console.error('OCR.space error:', error)
      throw error
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
