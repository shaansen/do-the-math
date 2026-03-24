import { useState, useEffect } from 'react'
import AvatarToggle from './AvatarToggle'
import './VisualBillSplitter.css'

function VisualBillSplitter({ onItemsReady, person1Name, person2Name, onReset }) {
  const [detectedPrices, setDetectedPrices] = useState([]) // {price, assignment, id}
  const [totalAmount, setTotalAmount] = useState(0)
  const [manualTax, setManualTax] = useState('')
  const [tipPercentage, setTipPercentage] = useState('')
  const [manualTip, setManualTip] = useState('')
  const [tipMode, setTipMode] = useState('percentage') // 'percentage' or 'manual'
  const [manualPriceInput, setManualPriceInput] = useState('')
  const [whoPaid, setWhoPaid] = useState(null) // null, 'person1', or 'person2'

  useEffect(() => {
    updateTotals()
  }, [manualTax, tipPercentage, manualTip, tipMode])

  const addManualPrice = () => {
    const price = parseFloat(manualPriceInput)
    if (price && price > 0) {
      const newPrice = {
        id: `${Date.now()}_${Math.random()}`,
        price: price,
        assignment: 'both'
      }
      setDetectedPrices([...detectedPrices, newPrice])
      setManualPriceInput('')
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
    let person1Tip = 0
    let person2Tip = 0
    let totalTip = 0
    const tipPercent = parseFloat(tipPercentage) || 0
    const tipAmount = parseFloat(manualTip) || 0

    if (tipMode === 'percentage' && tipPercent > 0) {
      const baseForTip = person1WithTax + person2WithTax
      totalTip = baseForTip * (tipPercent / 100)

      if (totalTip > 0 && baseForTip > 0) {
        person1Tip = (person1WithTax / baseForTip) * totalTip
        person2Tip = (person2WithTax / baseForTip) * totalTip
      }
    } else if (tipMode === 'manual' && tipAmount > 0) {
      totalTip = tipAmount
      const baseForTip = person1WithTax + person2WithTax

      if (baseForTip > 0) {
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
        {detectedPrices.length > 0 ? (
          <p>Click prices to toggle: <strong>Both</strong> → <strong>{person1Name}</strong> → <strong>{person2Name}</strong> → <strong>Both</strong></p>
        ) : (
          <p>Add items manually using the form below. Click avatars to assign items to {person1Name}, {person2Name}, or both.</p>
        )}
      </div>

      {/* Who Paid Selector */}
      <div className="who-paid-section">
        <label className="who-paid-label">Who paid for this bill?</label>
        <div className="who-paid-buttons">
          <button
            className={`who-paid-button ${whoPaid === 'person1' ? 'active' : ''}`}
            onClick={() => setWhoPaid(whoPaid === 'person1' ? null : 'person1')}
          >
            <AvatarToggle
              assignment="person1"
              person1Name={person1Name}
              person2Name={person2Name}
              onClick={() => {}}
            />
            <span>{person1Name}</span>
          </button>
          <button
            className={`who-paid-button ${whoPaid === 'person2' ? 'active' : ''}`}
            onClick={() => setWhoPaid(whoPaid === 'person2' ? null : 'person2')}
          >
            <AvatarToggle
              assignment="person2"
              person1Name={person1Name}
              person2Name={person2Name}
              onClick={() => {}}
            />
            <span>{person2Name}</span>
          </button>
        </div>
      </div>

      {/* Prices List */}
      {detectedPrices.length > 0 && (
        <div className="prices-list">
          <h3>All Items ({detectedPrices.length})</h3>
          <div className="prices-grid">
            {detectedPrices.map((item) => (
              <div
                key={item.id}
                className="price-item"
                style={{ borderLeftColor: getAssignmentColor(item.assignment) }}
              >
                <div className="price-row">
                  <AvatarToggle
                    assignment={item.assignment}
                    person1Name={person1Name}
                    person2Name={person2Name}
                    onClick={() => toggleAssignment(item.id)}
                  />
                  <div className="price-header">
                    <div className="price-value-large">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
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
      )}

      {/* Manual Entry Section */}
      <div className="manual-entry-section">
        <h3 className="manual-entry-title">Add Items Manually</h3>
        <div className="manual-entry-form">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Enter price (e.g., 12.99)"
            value={manualPriceInput}
            onChange={(e) => setManualPriceInput(e.target.value)}
            className="manual-price-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addManualPrice()
              }
            }}
          />
          <button
            onClick={addManualPrice}
            disabled={!manualPriceInput || parseFloat(manualPriceInput) <= 0}
            className="add-manual-button"
          >
            Add Item
          </button>
        </div>
        <p className="manual-entry-hint">
          Enter each item price and click "Add Item" to add it to your bill
        </p>
      </div>

      {/* Tax Input */}
      <div className="manual-input-section">
        <label className="input-label">
          <span>Tax Amount ($) - Enter manually</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={manualTax}
            onChange={(e) => setManualTax(e.target.value)}
            className="tax-input"
          />
        </label>
        <p className="input-hint">Tax will be split proportionally based on each person's share</p>
      </div>

      {/* Tip Calculator */}
      <div className="tip-section">
        <label className="input-label">
          <div className="tip-mode-selector">
            <span>Tip</span>
            <div className="tip-mode-buttons">
              <button
                type="button"
                className={`tip-mode-btn ${tipMode === 'percentage' ? 'active' : ''}`}
                onClick={() => {
                  setTipMode('percentage')
                  setManualTip('')
                }}
              >
                Percentage
              </button>
              <button
                type="button"
                className={`tip-mode-btn ${tipMode === 'manual' ? 'active' : ''}`}
                onClick={() => {
                  setTipMode('manual')
                  setTipPercentage('')
                }}
              >
                Manual Amount
              </button>
            </div>
          </div>

          {tipMode === 'percentage' ? (
            <div className="tip-input-group">
              <input
                type="number"
                inputMode="decimal"
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
                  type="button"
                  onClick={() => setTipPercentage('15')}
                  className="quick-tip-btn"
                >
                  15%
                </button>
                <button
                  type="button"
                  onClick={() => setTipPercentage('18')}
                  className="quick-tip-btn"
                >
                  18%
                </button>
                <button
                  type="button"
                  onClick={() => setTipPercentage('20')}
                  className="quick-tip-btn"
                >
                  20%
                </button>
              </div>
            </div>
          ) : (
            <div className="tip-input-group">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={manualTip}
                onChange={(e) => setManualTip(e.target.value)}
                className="tip-input"
              />
            </div>
          )}
        </label>
        {totals.totalTip > 0 && (
          <div className="tip-preview">
            Total Tip: ${totals.totalTip.toFixed(2)}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {(detectedPrices.length > 0 || manualTax || tipPercentage || manualTip) && (
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

      {/* Payment Summary - Who owes whom */}
      {whoPaid && totals.person1Final + totals.person2Final > 0 && (
        <div className="payment-summary">
          <h3 className="payment-summary-title">💳 Payment Summary</h3>
          {whoPaid === 'person1' ? (
            totals.person2Final > 0 ? (
              <div className="payment-message">
                <span className="payment-amount">${totals.person2Final.toFixed(2)}</span>
                <span className="payment-text">{person2Name} owes {person1Name}</span>
              </div>
            ) : (
              <div className="payment-message balanced">
                <span className="payment-text">✓ All settled! {person1Name} paid and no one owes anything.</span>
              </div>
            )
          ) : (
            totals.person1Final > 0 ? (
              <div className="payment-message">
                <span className="payment-amount">${totals.person1Final.toFixed(2)}</span>
                <span className="payment-text">{person1Name} owes {person2Name}</span>
              </div>
            ) : (
              <div className="payment-message balanced">
                <span className="payment-text">✓ All settled! {person2Name} paid and no one owes anything.</span>
              </div>
            )
          )}
        </div>
      )}

      {(detectedPrices.length > 0 || manualTax || tipPercentage || manualTip) && (
        <div className="action-buttons-row">
          <button
            onClick={onReset}
            className="action-button reset-button"
          >
            🔄 Reset - Add New Bill
          </button>
        </div>
      )}
    </div>
  )
}

export default VisualBillSplitter
