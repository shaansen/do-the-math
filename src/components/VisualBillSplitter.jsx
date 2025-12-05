import { useState, useRef, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import './VisualBillSplitter.css'

function VisualBillSplitter({ billImage, onItemsReady, person1Name, person2Name, onReset }) {
  const [detectedPrices, setDetectedPrices] = useState([]) // {price, assignment, id}
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const imageRef = useRef(null)

  useEffect(() => {
    if (billImage) {
      extractAllPrices()
    }
  }, [billImage])

  const extractAllPrices = async () => {
    if (!billImage) return
    
    setIsProcessing(true)
    
    try {
      const worker = await createWorker('eng')
      
      // Configure for numbers only - much faster and more accurate
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.$',
      })
      
      const { data: { text, words } } = await worker.recognize(billImage)
      
      // Extract all price-like numbers (format: $XX.XX or XX.XX)
      const pricePattern = /\$?(\d+\.\d{2})/g
      const pricesSet = new Set() // Use Set to avoid duplicates
      const prices = []
      
      // Find all prices in the text
      let match
      while ((match = pricePattern.exec(text)) !== null) {
        const price = parseFloat(match[1])
        // Filter reasonable prices (between $0.50 and $1000)
        if (price >= 0.5 && price <= 1000) {
          const priceKey = price.toFixed(2)
          if (!pricesSet.has(priceKey)) {
            pricesSet.add(priceKey)
            prices.push({
              id: Date.now() + Math.random(),
              price: price,
              assignment: 'both' // Default to both
            })
          }
        }
      }
      
      // Also try extracting from word boxes for better accuracy
      if (words && words.length > 0) {
        words.forEach(word => {
          const wordText = word.text
          const priceMatch = wordText.match(/\$?(\d+\.\d{2})/)
          if (priceMatch) {
            const price = parseFloat(priceMatch[1])
            if (price >= 0.5 && price <= 1000) {
              const priceKey = price.toFixed(2)
              if (!pricesSet.has(priceKey)) {
                pricesSet.add(priceKey)
                prices.push({
                  id: Date.now() + Math.random() + prices.length,
                  price: price,
                  assignment: 'both'
                })
              }
            }
          }
        })
      }
      
      // Sort prices descending (largest first) - total is usually at the top
      prices.sort((a, b) => b.price - a.price)
      
      // The largest price is likely the total
      if (prices.length > 0) {
        setTotalAmount(prices[0].price)
      }
      
      setDetectedPrices(prices)
      await worker.terminate()
    } catch (err) {
      console.error('Error extracting prices:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleAssignment = (priceId) => {
    const updated = detectedPrices.map(item => {
      if (item.id === priceId) {
        // Cycle: both -> person1 -> person2 -> both
        if (item.assignment === 'both') {
          return { ...item, assignment: 'person1' }
        } else if (item.assignment === 'person1') {
          return { ...item, assignment: 'person2' }
        } else {
          return { ...item, assignment: 'both' }
        }
      }
      return item
    })
    
    setDetectedPrices(updated)
    updateTotals(updated)
  }

  const updateTotals = (prices = detectedPrices) => {
    const person1Items = prices.filter(p => p.assignment === 'person1')
    const person2Items = prices.filter(p => p.assignment === 'person2')
    const sharedItems = prices.filter(p => p.assignment === 'both')
    
    const person1Total = person1Items.reduce((sum, p) => sum + p.price, 0)
    const person2Total = person2Items.reduce((sum, p) => sum + p.price, 0)
    const sharedTotal = sharedItems.reduce((sum, p) => sum + p.price, 0)
    
    const subtotal = person1Total + person2Total + sharedTotal
    
    // Calculate tax proportionally
    let tax = 0
    if (totalAmount > subtotal) {
      tax = totalAmount - subtotal
    } else if (subtotal > 0 && totalAmount > 0) {
      // Estimate tax if total is less than subtotal
      const taxRate = (totalAmount - subtotal) / subtotal
      tax = subtotal * taxRate
    }
    
    // Create items array for summary component
    const items = prices.map(p => ({
      name: `$${p.price.toFixed(2)}`,
      price: p.price,
      assignment: p.assignment
    }))
    
    onItemsReady(items, subtotal, tax, totalAmount || (subtotal + tax))
  }

  const removePrice = (priceId) => {
    const updated = detectedPrices.filter(p => p.id !== priceId)
    setDetectedPrices(updated)
    updateTotals(updated)
  }

  const getAssignmentColor = (assignment) => {
    if (assignment === 'person1') return '#4caf50' // Green
    if (assignment === 'person2') return '#f44336' // Red
    return '#ff9800' // Orange (both)
  }

  const getAssignmentLabel = (assignment) => {
    if (assignment === 'person1') return person1Name
    if (assignment === 'person2') return person2Name
    return 'Both'
  }

  return (
    <div className="visual-splitter-container">
      <div className="instructions">
        <h3>💰 Detected Prices</h3>
        {isProcessing ? (
          <p className="processing">Scanning bill for prices...</p>
        ) : detectedPrices.length > 0 ? (
          <p>Click on each price to toggle: <strong>Both</strong> → <strong>{person1Name}</strong> → <strong>{person2Name}</strong> → <strong>Both</strong></p>
        ) : (
          <p>No prices detected. Make sure the bill image is clear and well-lit.</p>
        )}
      </div>

      {isProcessing && (
        <div className="processing-container">
          <div className="spinner"></div>
          <p>Extracting all prices from bill...</p>
        </div>
      )}

      {detectedPrices.length > 0 && (
        <>
          <div className="bill-preview">
            <img
              ref={imageRef}
              src={billImage}
              alt="Bill preview"
              className="bill-image-small"
            />
          </div>

          <div className="prices-list">
            <h3>Prices Found ({detectedPrices.length})</h3>
            <div className="prices-grid">
              {detectedPrices.map((item) => (
                <div
                  key={item.id}
                  className="price-item"
                  style={{ borderLeftColor: getAssignmentColor(item.assignment) }}
                >
                  <div className="price-value-large">
                    ${item.price.toFixed(2)}
                  </div>
                  <button
                    className="toggle-button"
                    onClick={() => toggleAssignment(item.id)}
                    style={{
                      backgroundColor: getAssignmentColor(item.assignment),
                      color: 'white'
                    }}
                  >
                    {getAssignmentLabel(item.assignment)}
                  </button>
                  <button
                    className="remove-price-button"
                    onClick={() => removePrice(item.id)}
                    title="Remove this price"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="price-summary">
            <div className="summary-card person1-summary">
              <h4>{person1Name}</h4>
              <div className="summary-amount">
                ${detectedPrices
                  .filter(p => p.assignment === 'person1')
                  .reduce((sum, p) => sum + p.price, 0)
                  .toFixed(2)}
              </div>
            </div>
            
            <div className="summary-card shared-summary">
              <h4>Shared (50% each)</h4>
              <div className="summary-amount">
                ${detectedPrices
                  .filter(p => p.assignment === 'both')
                  .reduce((sum, p) => sum + p.price, 0)
                  .toFixed(2)}
              </div>
            </div>
            
            <div className="summary-card person2-summary">
              <h4>{person2Name}</h4>
              <div className="summary-amount">
                ${detectedPrices
                  .filter(p => p.assignment === 'person2')
                  .reduce((sum, p) => sum + p.price, 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="total-display">
              <div className="total-line">
                <span>Bill Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {detectedPrices.length > 0 && (
        <button
          onClick={() => {
            setDetectedPrices([])
            setTotalAmount(0)
          }}
          className="action-button clear-button"
        >
          🔄 Rescan Bill
        </button>
      )}
    </div>
  )
}

export default VisualBillSplitter
