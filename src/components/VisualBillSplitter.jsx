import { useState, useRef, useEffect } from 'react'
import ocrService from '../services/ocrService'
import './VisualBillSplitter.css'

function VisualBillSplitter({ billImage, onItemsReady, person1Name, person2Name, onReset }) {
  const [detectedPrices, setDetectedPrices] = useState([]) // {price, assignment, id}
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [manualTax, setManualTax] = useState('')
  const [tipPercentage, setTipPercentage] = useState('')
  const [manualPriceInput, setManualPriceInput] = useState('')
  const [showManualEntry, setShowManualEntry] = useState(false)
  const imageRef = useRef(null)

  useEffect(() => {
    if (billImage) {
      extractAllPrices()
    }
  }, [billImage])

  useEffect(() => {
    updateTotals()
  }, [manualTax, tipPercentage])

  const extractAllPrices = async () => {
    if (!billImage) return
    
    setIsProcessing(true)
    
    try {
      const { prices, total } = await ocrService.extractPrices(billImage)
      setDetectedPrices(prices)
      setTotalAmount(total)
    } catch (err) {
      console.error('Error extracting prices:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const addManualPrice = () => {
    const price = parseFloat(manualPriceInput)
    if (price && price > 0) {
      const newPrice = {
        id: `manual_${Date.now()}_${Math.random()}`,
        price: price,
        assignment: 'both'
      }
      setDetectedPrices([...detectedPrices, newPrice])
      setManualPriceInput('')
      setShowManualEntry(false)
      updateTotals([...detectedPrices, newPrice])
    }
  }

  const toggleAssignment = (priceId) => {
    const updated = detectedPrices.map(item => {
      if (item.id === priceId) {
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

  const calculateTotals = (prices = detectedPrices) => {
    const person1Items = prices.filter(p => p.assignment === 'person1')
    const person2Items = prices.filter(p => p.assignment === 'person2')
    const sharedItems = prices.filter(p => p.assignment === 'both')
    
    const person1Subtotal = person1Items.reduce((sum, p) => sum + p.price, 0)
    const person2Subtotal = person2Items.reduce((sum, p) => sum + p.price, 0)
    const sharedSubtotal = sharedItems.reduce((sum, p) => sum + p.price, 0)
    
    const totalSubtotal = person1Subtotal + person2Subtotal + sharedSubtotal
    const sharedHalf = sharedSubtotal / 2
    
    const person1PreTax = person1Subtotal + sharedHalf
    const person2PreTax = person2Subtotal + sharedHalf
    
    // Calculate tax
    const taxAmount = parseFloat(manualTax) || 0
    let person1Tax = 0
    let person2Tax = 0
    
    if (taxAmount > 0 && totalSubtotal > 0) {
      const taxRate = taxAmount / totalSubtotal
      person1Tax = person1PreTax * taxRate
      person2Tax = person2PreTax * taxRate
    }
    
    const person1WithTax = person1PreTax + person1Tax
    const person2WithTax = person2PreTax + person2Tax
    
    // Calculate tip
    const tipPercent = parseFloat(tipPercentage) || 0
    let person1Tip = 0
    let person2Tip = 0
    let totalTip = 0
    
    if (tipPercent > 0) {
      const baseForTip = person1WithTax + person2WithTax
      totalTip = baseForTip * (tipPercent / 100)
      
      if (totalTip > 0 && baseForTip > 0) {
        person1Tip = (person1WithTax / baseForTip) * totalTip
        person2Tip = (person2WithTax / baseForTip) * totalTip
      }
    }
    
    return {
      person1Subtotal,
      person2Subtotal,
      sharedSubtotal,
      totalSubtotal,
      person1PreTax,
      person2PreTax,
      taxAmount,
      person1Tax,
      person2Tax,
      person1WithTax,
      person2WithTax,
      tipPercent,
      totalTip,
      person1Tip,
      person2Tip,
      person1Final: person1WithTax + person1Tip,
      person2Final: person2WithTax + person2Tip
    }
  }

  const updateTotals = (prices = detectedPrices) => {
    const totals = calculateTotals(prices)
    
    const items = prices.map(p => ({
      name: `$${p.price.toFixed(2)}`,
      price: p.price,
      assignment: p.assignment
    }))
    
    onItemsReady(
      items, 
      totals.totalSubtotal, 
      totals.taxAmount, 
      totals.person1Final + totals.person2Final,
      totals.totalTip
    )
  }

  const removePrice = (priceId) => {
    const updated = detectedPrices.filter(p => p.id !== priceId)
    setDetectedPrices(updated)
    updateTotals(updated)
  }

  const getAssignmentColor = (assignment) => {
    if (assignment === 'person1') return '#4caf50'
    if (assignment === 'person2') return '#f44336'
    return '#ff9800'
  }

  const getAssignmentLabel = (assignment) => {
    if (assignment === 'person1') return person1Name
    if (assignment === 'person2') return person2Name
    return 'Both'
  }

  const totals = calculateTotals()

  return (
    <div className="visual-splitter-container">
      <div className="instructions">
        <h3>💰 Bill Items</h3>
        {isProcessing ? (
          <p className="processing">Scanning bill for prices...</p>
        ) : (
          <p>Click prices to toggle: <strong>Both</strong> → <strong>{person1Name}</strong> → <strong>{person2Name}</strong> → <strong>Both</strong></p>
        )}
      </div>

      {isProcessing && (
        <div className="processing-container">
          <div className="spinner"></div>
          <p>Extracting all prices from bill...</p>
        </div>
      )}

      {/* Manual Entry Section */}
      <div className="manual-entry-section">
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="toggle-manual-button"
        >
          {showManualEntry ? '−' : '+'} Add Price Manually
        </button>
        
        {showManualEntry && (
          <div className="manual-entry-form">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price (e.g., 12.99)"
              value={manualPriceInput}
              onChange={(e) => setManualPriceInput(e.target.value)}
              className="manual-price-input"
            />
            <button
              onClick={addManualPrice}
              disabled={!manualPriceInput || parseFloat(manualPriceInput) <= 0}
              className="add-manual-button"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Prices List */}
      {detectedPrices.length > 0 && (
        <>
          {billImage && (
            <div className="bill-preview">
              <img
                ref={imageRef}
                src={billImage}
                alt="Bill preview"
                className="bill-image-small"
              />
            </div>
          )}

          <div className="prices-list">
            <h3>Items ({detectedPrices.length})</h3>
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
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tax Input */}
      <div className="manual-input-section">
        <label className="input-label">
          <span>Tax Amount ($)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={manualTax}
            onChange={(e) => setManualTax(e.target.value)}
            className="tax-input"
          />
        </label>
      </div>

      {/* Tip Calculator */}
      <div className="tip-section">
        <label className="input-label">
          <span>Tip Percentage (%)</span>
          <div className="tip-input-group">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="18"
              value={tipPercentage}
              onChange={(e) => setTipPercentage(e.target.value)}
              className="tip-input"
            />
            <div className="quick-tip-buttons">
              <button
                onClick={() => setTipPercentage('15')}
                className="quick-tip-btn"
              >
                15%
              </button>
              <button
                onClick={() => setTipPercentage('18')}
                className="quick-tip-btn"
              >
                18%
              </button>
              <button
                onClick={() => setTipPercentage('20')}
                className="quick-tip-btn"
              >
                20%
              </button>
            </div>
          </div>
        </label>
        {totals.totalTip > 0 && (
          <div className="tip-preview">
            Total Tip: ${totals.totalTip.toFixed(2)}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {(detectedPrices.length > 0 || manualTax || tipPercentage) && (
        <div className="price-summary">
          <div className="summary-card person1-summary">
            <h4>{person1Name}</h4>
            <div className="summary-breakdown">
              <div className="summary-line">
                <span>Items:</span>
                <span>${totals.person1PreTax.toFixed(2)}</span>
              </div>
              {totals.person1Tax > 0 && (
                <div className="summary-line">
                  <span>Tax:</span>
                  <span>${totals.person1Tax.toFixed(2)}</span>
                </div>
              )}
              {totals.person1Tip > 0 && (
                <div className="summary-line">
                  <span>Tip:</span>
                  <span>${totals.person1Tip.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-amount">
                ${totals.person1Final.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="summary-card shared-summary">
            <h4>Shared (50% each)</h4>
            <div className="summary-amount">
              ${totals.sharedSubtotal.toFixed(2)}
            </div>
          </div>
          
          <div className="summary-card person2-summary">
            <h4>{person2Name}</h4>
            <div className="summary-breakdown">
              <div className="summary-line">
                <span>Items:</span>
                <span>${totals.person2PreTax.toFixed(2)}</span>
              </div>
              {totals.person2Tax > 0 && (
                <div className="summary-line">
                  <span>Tax:</span>
                  <span>${totals.person2Tax.toFixed(2)}</span>
                </div>
              )}
              {totals.person2Tip > 0 && (
                <div className="summary-line">
                  <span>Tip:</span>
                  <span>${totals.person2Tip.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-amount">
                ${totals.person2Final.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grand Total */}
      {totals.person1Final + totals.person2Final > 0 && (
        <div className="total-display">
          <div className="total-line">
            <span>Grand Total:</span>
            <span>${(totals.person1Final + totals.person2Final).toFixed(2)}</span>
          </div>
        </div>
      )}

      {detectedPrices.length > 0 && (
        <button
          onClick={() => {
            setDetectedPrices([])
            setTotalAmount(0)
            setManualTax('')
            setTipPercentage('')
          }}
          className="action-button clear-button"
        >
          🔄 Clear All
        </button>
      )}
    </div>
  )
}

export default VisualBillSplitter
