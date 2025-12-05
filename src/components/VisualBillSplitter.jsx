import { useState, useRef, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import './VisualBillSplitter.css'

function VisualBillSplitter({ billImage, onItemsReady, person1Name, person2Name, onReset }) {
  const [selectedRegions, setSelectedRegions] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [currentSelection, setCurrentSelection] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedItems, setProcessedItems] = useState([])
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)
  const startPosRef = useRef(null)

  useEffect(() => {
    if (billImage && imageRef.current) {
      drawRegions()
    }
  }, [billImage, selectedRegions, processedItems])

  const drawRegions = () => {
    if (!canvasRef.current || !imageRef.current) return
    
    const canvas = canvasRef.current
    const img = imageRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size to match displayed image size
    canvas.width = img.offsetWidth
    canvas.height = img.offsetHeight
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw existing regions (using display coordinates)
    selectedRegions.forEach((region, index) => {
      const item = processedItems[index]
      let color = '#667eea' // Default blue
      
      if (item) {
        if (item.assignment === 'person1') color = '#4caf50' // Green
        else if (item.assignment === 'person2') color = '#f44336' // Red
        else if (item.assignment === 'both') color = '#ff9800' // Orange
      }
      
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.setLineDash([])
      ctx.strokeRect(region.x, region.y, region.width, region.height)
      
      // Draw semi-transparent fill
      ctx.fillStyle = color + '20'
      ctx.fillRect(region.x, region.y, region.width, region.height)
      
      // Draw label if processed
      if (item) {
        ctx.fillStyle = color
        ctx.font = 'bold 14px Arial'
        ctx.fillText(`$${item.price.toFixed(2)}`, region.x + 5, region.y - 5)
      } else {
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 14px Arial'
        ctx.fillText(`Region ${index + 1}`, region.x + 5, region.y - 5)
      }
    })
    
    // Draw current selection (convert from original to display coordinates)
    if (currentSelection) {
      const rect = imageRef.current.getBoundingClientRect()
      const scaleX = rect.width / imageRef.current.naturalWidth
      const scaleY = rect.height / imageRef.current.naturalHeight
      
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(
        currentSelection.x * scaleX,
        currentSelection.y * scaleY,
        currentSelection.width * scaleX,
        currentSelection.height * scaleY
      )
    }
  }

  const getRelativeCoordinates = (e) => {
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

  const handleMouseDown = (e) => {
    if (e.button !== 0) return // Only left mouse button
    e.preventDefault()
    const pos = getRelativeCoordinates(e)
    startPosRef.current = pos
    setIsSelecting(true)
    setCurrentSelection({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  const handleMouseMove = (e) => {
    if (!isSelecting || !startPosRef.current) return
    
    const pos = getRelativeCoordinates(e)
    const start = startPosRef.current
    
    setCurrentSelection({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      width: Math.abs(pos.x - start.x),
      height: Math.abs(pos.y - start.y)
    })
  }

  const handleMouseUp = () => {
    if (!isSelecting || !currentSelection) return
    
    // Only add if selection is large enough (in original image pixels)
    if (currentSelection.width > 20 && currentSelection.height > 20) {
      const rect = imageRef.current.getBoundingClientRect()
      const scaleX = imageRef.current.naturalWidth / rect.width
      const scaleY = imageRef.current.naturalHeight / rect.height
      
      // Store display coordinates for drawing
      const displayRect = {
        x: (currentSelection.x / scaleX),
        y: (currentSelection.y / scaleY),
        width: (currentSelection.width / scaleX),
        height: (currentSelection.height / scaleY)
      }
      
      setSelectedRegions([...selectedRegions, {
        // Display coordinates (for drawing on canvas)
        x: displayRect.x,
        y: displayRect.y,
        width: displayRect.width,
        height: displayRect.height,
        // Original image coordinates (for OCR extraction)
        originalX: currentSelection.x,
        originalY: currentSelection.y,
        originalWidth: currentSelection.width,
        originalHeight: currentSelection.height
      }])
      
      setProcessedItems([...processedItems, null])
    }
    
    setIsSelecting(false)
    setCurrentSelection(null)
    startPosRef.current = null
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    e.preventDefault()
    handleMouseDown(e)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    handleMouseMove(e)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    handleMouseUp()
  }

  const processSelectedRegions = async () => {
    if (selectedRegions.length === 0) return
    
    setIsProcessing(true)
    const items = []
    
    for (let i = 0; i < selectedRegions.length; i++) {
      const region = selectedRegions[i]
      
      try {
        // Extract the region from the image
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = billImage
        
        await new Promise((resolve) => {
          img.onload = () => {
            const tempCanvas = document.createElement('canvas')
            const tempCtx = tempCanvas.getContext('2d')
            
            tempCanvas.width = region.originalWidth
            tempCanvas.height = region.originalHeight
            
            tempCtx.drawImage(
              img,
              region.originalX,
              region.originalY,
              region.originalWidth,
              region.originalHeight,
              0,
              0,
              region.originalWidth,
              region.originalHeight
            )
            
            // OCR just this region - focus on numbers only
            tempCanvas.toBlob(async (blob) => {
              const worker = await createWorker('eng')
              
              // Configure for numbers only - faster and more accurate
              await worker.setParameters({
                tessedit_char_whitelist: '0123456789.$',
              })
              
              const { data: { text } } = await worker.recognize(blob)
              await worker.terminate()
              
              // Extract price (look for pattern like $10.99 or 10.99)
              const priceMatch = text.match(/[\$]?(\d+\.\d{2})/)
              const price = priceMatch ? parseFloat(priceMatch[1]) : 0
              
              items.push({
                price: price,
                assignment: 'both',
                regionIndex: i
              })
              
              resolve()
            }, 'image/png')
          }
        })
      } catch (err) {
        console.error(`Error processing region ${i}:`, err)
        items.push({
          price: 0,
          assignment: 'both',
          regionIndex: i,
          error: true
        })
      }
    }
    
    setProcessedItems(items)
    setIsProcessing(false)
  }

  const handleItemAssignment = (index, assignment) => {
    const updated = [...processedItems]
    updated[index].assignment = assignment
    setProcessedItems(updated)
    
    // Calculate totals and notify parent
    const person1Total = updated
      .filter(item => item && item.assignment === 'person1')
      .reduce((sum, item) => sum + item.price, 0)
    
    const person2Total = updated
      .filter(item => item && item.assignment === 'person2')
      .reduce((sum, item) => sum + item.price, 0)
    
    const sharedTotal = updated
      .filter(item => item && item.assignment === 'both')
      .reduce((sum, item) => sum + item.price, 0)
    
    const total = person1Total + person2Total + sharedTotal
    
    // Calculate tax proportionally (estimate 8-10% tax rate)
    const taxRate = 0.09 // 9% average
    const subtotal = total / (1 + taxRate)
    const tax = total - subtotal
    
    onItemsReady(updated.filter(item => item && item.price > 0), subtotal, tax, total)
  }

  const removeRegion = (index) => {
    setSelectedRegions(selectedRegions.filter((_, i) => i !== index))
    setProcessedItems(processedItems.filter((_, i) => i !== index))
  }

  return (
    <div className="visual-splitter-container">
      <div className="instructions">
        <h3>📋 Select Price Regions</h3>
        <p>Click and drag on the bill to select each price. Then click "Extract Prices" to read them.</p>
      </div>

      <div className="bill-image-container">
        <img
          ref={imageRef}
          src={billImage}
          alt="Bill"
          className="bill-image"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className="bill-overlay"
        />
      </div>

      <div className="controls">
        {selectedRegions.length > 0 && (
          <>
            <button
              onClick={processSelectedRegions}
              disabled={isProcessing}
              className="action-button extract-button"
            >
              {isProcessing ? '⏳ Processing...' : '🔍 Extract Prices'}
            </button>
            <button
              onClick={() => {
                setSelectedRegions([])
                setProcessedItems([])
                setCurrentSelection(null)
              }}
              className="action-button clear-button"
            >
              🗑️ Clear All
            </button>
          </>
        )}
      </div>

      {processedItems.length > 0 && processedItems.some(item => item && item.price > 0) && (
        <div className="price-list">
          <h3>💰 Prices Found - Assign to People</h3>
          {processedItems.map((item, index) => {
            if (!item || item.price === 0) return null
            
            return (
              <div
                key={index}
                className={`price-item ${selectedItemIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedItemIndex(index)}
              >
                <div className="price-value">
                  ${item.price.toFixed(2)}
                  {item.error && <span className="error-badge">⚠️</span>}
                </div>
                <div className="assignment-buttons">
                  <button
                    className={`assign-btn ${item.assignment === 'person1' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemAssignment(index, 'person1')
                    }}
                  >
                    {person1Name}
                  </button>
                  <button
                    className={`assign-btn ${item.assignment === 'both' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemAssignment(index, 'both')
                    }}
                  >
                    Both
                  </button>
                  <button
                    className={`assign-btn ${item.assignment === 'person2' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemAssignment(index, 'person2')
                    }}
                  >
                    {person2Name}
                  </button>
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRegion(index)
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VisualBillSplitter

