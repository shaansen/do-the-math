import { useState, useRef, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import './VisualBillSplitter.css'

function VisualBillSplitter({ billImage, onItemsReady, person1Name, person2Name, onReset }) {
  const [pricePoints, setPricePoints] = useState([]) // {x, y, price, assignment, id}
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [isExtractingTotal, setIsExtractingTotal] = useState(false)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)
  const workerRef = useRef(null)

  useEffect(() => {
    if (billImage) {
      extractTotal()
      drawPricePoints()
    }
  }, [billImage, pricePoints])

  const extractTotal = async () => {
    if (!billImage) return
    
    setIsExtractingTotal(true)
    try {
      const worker = await createWorker('eng')
      workerRef.current = worker
      
      // Get bottom portion of image where total usually is
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = billImage
      
      await new Promise((resolve) => {
        img.onload = async () => {
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          
          // Extract bottom 30% of image where total is typically located
          const cropHeight = Math.floor(img.height * 0.3)
          tempCanvas.width = img.width
          tempCanvas.height = cropHeight
          
          tempCtx.drawImage(
            img,
            0,
            img.height - cropHeight,
            img.width,
            cropHeight,
            0,
            0,
            img.width,
            cropHeight
          )
          
          const { data: { text } } = await worker.recognize(tempCanvas)
          
          // Find total amount
          const totalPatterns = [
            /total[\s:]*\$?(\d+\.\d{2})/i,
            /amount[\s:]*\$?(\d+\.\d{2})/i,
            /\$?(\d+\.\d{2})[\s]*total/i,
            /grand[\s]*total[\s:]*\$?(\d+\.\d{2})/i
          ]
          
          for (const pattern of totalPatterns) {
            const match = text.match(pattern)
            if (match) {
              const total = parseFloat(match[1])
              if (total > 0) {
                setTotalAmount(total)
                break
              }
            }
          }
          
          // If no total found, find largest number (likely the total)
          if (!totalAmount) {
            const numbers = text.match(/\$?(\d+\.\d{2})/g)
            if (numbers && numbers.length > 0) {
              const parsedNumbers = numbers.map(n => parseFloat(n.replace('$', '')))
              const maxNum = Math.max(...parsedNumbers)
              if (maxNum > 0) {
                setTotalAmount(maxNum)
              }
            }
          }
          
          await worker.terminate()
          workerRef.current = null
          resolve()
        }
      })
    } catch (err) {
      console.error('Error extracting total:', err)
      if (workerRef.current) {
        await workerRef.current.terminate()
        workerRef.current = null
      }
    } finally {
      setIsExtractingTotal(false)
    }
  }

  const drawPricePoints = () => {
    if (!canvasRef.current || !imageRef.current) return
    
    const canvas = canvasRef.current
    const img = imageRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = img.offsetWidth
    canvas.height = img.offsetHeight
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw price points with color coding
    pricePoints.forEach((point) => {
      const rect = imageRef.current.getBoundingClientRect()
      const scaleX = rect.width / imageRef.current.naturalWidth
      const scaleY = rect.height / imageRef.current.naturalHeight
      
      const displayX = point.x * scaleX
      const displayY = point.y * scaleY
      
      let color = '#667eea' // Default blue
      let label = ''
      
      if (point.assignment === 'person1') {
        color = '#4caf50' // Green
        label = person1Name
      } else if (point.assignment === 'person2') {
        color = '#f44336' // Red
        label = person2Name
      } else if (point.assignment === 'both') {
        color = '#ff9800' // Orange
        label = 'Both'
      }
      
      // Draw circle indicator
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      
      // Draw filled circle
      ctx.beginPath()
      ctx.arc(displayX, displayY, 15, 0, 2 * Math.PI)
      ctx.fill()
      
      // Draw white border
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 3
      ctx.stroke()
      
      // Draw price label
      if (point.price > 0) {
        ctx.fillStyle = color
        ctx.font = 'bold 14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`$${point.price.toFixed(2)}`, displayX, displayY - 25)
        
        // Draw assignment label
        ctx.font = 'bold 12px Arial'
        ctx.fillText(label, displayX, displayY + 35)
      }
    })
  }

  const getClickCoordinates = (e) => {
    const rect = imageRef.current.getBoundingClientRect()
    const scaleX = imageRef.current.naturalWidth / rect.width
    const scaleY = imageRef.current.naturalHeight / rect.height
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const extractPriceAtPoint = async (x, y) => {
    if (!workerRef.current) {
      workerRef.current = await createWorker('eng')
      await workerRef.current.setParameters({
        tessedit_char_whitelist: '0123456789.$',
      })
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = billImage
    
    return new Promise((resolve) => {
      img.onload = async () => {
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        
        // Extract a region around the click point (100x50 pixels)
        const regionSize = { width: 150, height: 60 }
        tempCanvas.width = regionSize.width
        tempCanvas.height = regionSize.height
        
        const startX = Math.max(0, x - regionSize.width / 2)
        const startY = Math.max(0, y - regionSize.height / 2)
        
        tempCtx.drawImage(
          img,
          startX,
          startY,
          regionSize.width,
          regionSize.height,
          0,
          0,
          regionSize.width,
          regionSize.height
        )
        
        try {
          const { data: { text } } = await workerRef.current.recognize(tempCanvas)
          
          // Extract price (look for pattern like $10.99 or 10.99)
          const priceMatch = text.match(/\$?(\d+\.\d{2})/)
          const price = priceMatch ? parseFloat(priceMatch[1]) : 0
          
          resolve(price)
        } catch (err) {
          console.error('Error extracting price:', err)
          resolve(0)
        }
      }
    })
  }

  const handleImageClick = async (e) => {
    e.preventDefault()
    
    const coords = getClickCoordinates(e)
    
    // Check if clicking on existing point (within 30px radius)
    const existingPointIndex = pricePoints.findIndex(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - coords.x, 2) + Math.pow(point.y - coords.y, 2)
      )
      return distance < 30
    })
    
    if (existingPointIndex >= 0) {
      // Toggle assignment on existing point
      const updated = [...pricePoints]
      const point = updated[existingPointIndex]
      
      // Cycle: person1 -> person2 -> both -> person1
      if (point.assignment === 'person1') {
        point.assignment = 'person2'
      } else if (point.assignment === 'person2') {
        point.assignment = 'both'
      } else {
        point.assignment = 'person1'
      }
      
      setPricePoints(updated)
      updateTotals(updated)
    } else {
      // New point - extract price
      setIsProcessing(true)
      const price = await extractPriceAtPoint(coords.x, coords.y)
      setIsProcessing(false)
      
      if (price > 0) {
        const newPoint = {
          id: Date.now(),
          x: coords.x,
          y: coords.y,
          price: price,
          assignment: 'person1' // Start with person1
        }
        
        const updated = [...pricePoints, newPoint]
        setPricePoints(updated)
        updateTotals(updated)
      }
    }
  }

  const updateTotals = (points = pricePoints) => {
    const person1Items = points.filter(p => p.assignment === 'person1')
    const person2Items = points.filter(p => p.assignment === 'person2')
    const sharedItems = points.filter(p => p.assignment === 'both')
    
    const person1Total = person1Items.reduce((sum, p) => sum + p.price, 0)
    const person2Total = person2Items.reduce((sum, p) => sum + p.price, 0)
    const sharedTotal = sharedItems.reduce((sum, p) => sum + p.price, 0)
    
    const subtotal = person1Total + person2Total + sharedTotal
    
    // Calculate tax proportionally
    let tax = 0
    if (totalAmount > subtotal) {
      tax = totalAmount - subtotal
    } else if (subtotal > 0) {
      // Estimate tax if total not available
      tax = subtotal * 0.09 // 9% average
    }
    
    setTaxAmount(tax)
    
    // Create items array for summary component
    const items = points.map(point => ({
      name: `Item $${point.price.toFixed(2)}`,
      price: point.price,
      assignment: point.assignment
    }))
    
    onItemsReady(items, subtotal, tax, totalAmount || (subtotal + tax))
  }

  const removePoint = (pointId) => {
    const updated = pricePoints.filter(p => p.id !== pointId)
    setPricePoints(updated)
    updateTotals(updated)
  }

  return (
    <div className="visual-splitter-container">
      <div className="instructions">
        <h3>💰 Click on Prices</h3>
        <p>Click on any price in the bill. Click again to toggle: <strong>{person1Name}</strong> → <strong>{person2Name}</strong> → <strong>Both</strong></p>
        {isExtractingTotal && <p className="extracting">Extracting total from bill...</p>}
      </div>

      <div className="bill-image-container">
        <img
          ref={imageRef}
          src={billImage}
          alt="Bill"
          className="bill-image"
          onClick={handleImageClick}
          onTouchStart={(e) => {
            e.preventDefault()
            handleImageClick(e)
          }}
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className="bill-overlay"
          onClick={handleImageClick}
          onTouchStart={(e) => {
            e.preventDefault()
            handleImageClick(e)
          }}
        />
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner-small"></div>
          <span>Extracting price...</span>
        </div>
      )}

      <div className="price-summary">
        <div className="summary-card person1-summary">
          <h4>{person1Name}</h4>
          <div className="summary-amount">
            ${pricePoints
              .filter(p => p.assignment === 'person1')
              .reduce((sum, p) => sum + p.price, 0)
              .toFixed(2)}
          </div>
        </div>
        
        <div className="summary-card shared-summary">
          <h4>Shared (50% each)</h4>
          <div className="summary-amount">
            ${pricePoints
              .filter(p => p.assignment === 'both')
              .reduce((sum, p) => sum + p.price, 0)
              .toFixed(2)}
          </div>
        </div>
        
        <div className="summary-card person2-summary">
          <h4>{person2Name}</h4>
          <div className="summary-amount">
            ${pricePoints
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

      {pricePoints.length > 0 && (
        <button
          onClick={() => {
            setPricePoints([])
            setTotalAmount(0)
            setTaxAmount(0)
          }}
          className="action-button clear-button"
        >
          🗑️ Clear All Prices
        </button>
      )}
    </div>
  )
}

export default VisualBillSplitter
