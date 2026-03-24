import { useState, useMemo, useEffect } from 'react'
import AvatarToggle from './AvatarToggle'
import './VisualBillSplitter.css'

function VisualBillSplitter({ onItemsReady, person1Name, person2Name, onReset }) {
  const [detectedPrices, setDetectedPrices] = useState([])
  const [manualTax, setManualTax] = useState('')
  const [tipPercentage, setTipPercentage] = useState('')
  const [manualTip, setManualTip] = useState('')
  const [tipMode, setTipMode] = useState('percentage')
  const [manualPriceInput, setManualPriceInput] = useState('')
  const [whoPaid, setWhoPaid] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const totals = useMemo(() => {
    const person1Items = detectedPrices.filter(p => p.assignment === 'person1')
    const person2Items = detectedPrices.filter(p => p.assignment === 'person2')
    const sharedItems = detectedPrices.filter(p => p.assignment === 'both')

    const person1Subtotal = person1Items.reduce((sum, p) => sum + p.price, 0)
    const person2Subtotal = person2Items.reduce((sum, p) => sum + p.price, 0)
    const sharedSubtotal = sharedItems.reduce((sum, p) => sum + p.price, 0)

    const totalSubtotal = person1Subtotal + person2Subtotal + sharedSubtotal
    const sharedHalf = sharedSubtotal / 2

    const person1PreTax = person1Subtotal + sharedHalf
    const person2PreTax = person2Subtotal + sharedHalf

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
  }, [detectedPrices, manualTax, tipPercentage, manualTip, tipMode])

  useEffect(() => {
    const items = detectedPrices.map(p => ({
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
  }, [totals, detectedPrices, onItemsReady])

  const addManualPrice = () => {
    const price = parseFloat(manualPriceInput)
    if (price && price > 0) {
      const newPrices = [...detectedPrices, {
        id: `${Date.now()}_${Math.random()}`,
        price,
        assignment: 'both'
      }]
      setDetectedPrices(newPrices)
      setManualPriceInput('')
    }
  }

  const toggleAssignment = (priceId) => {
    setDetectedPrices(prev => prev.map(item => {
      if (item.id !== priceId) return item
      const next = item.assignment === 'both' ? 'person1'
        : item.assignment === 'person1' ? 'person2'
        : 'both'
      return { ...item, assignment: next }
    }))
  }

  const removePrice = (priceId) => {
    setDetectedPrices(prev => prev.filter(p => p.id !== priceId))
  }

  const startEditing = (item) => {
    setEditingId(item.id)
    setEditValue(item.price.toString())
  }

  const commitEdit = () => {
    const newPrice = parseFloat(editValue)
    if (newPrice && newPrice > 0) {
      setDetectedPrices(prev => prev.map(item =>
        item.id === editingId ? { ...item, price: newPrice } : item
      ))
    }
    setEditingId(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const getAssignmentColor = (assignment) => {
    if (assignment === 'person1') return '#4caf50'
    if (assignment === 'person2') return '#f44336'
    return '#ff9800'
  }

  const grandTotal = totals.person1Final + totals.person2Final
  const hasData = detectedPrices.length > 0 || manualTax || tipPercentage || manualTip

  return (
    <div className="visual-splitter-container">
      <div className="manual-entry-section">
        <h3 className="manual-entry-title">Add Items</h3>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') addManualPrice()
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
          Enter each item price and press Enter or click Add Item
        </p>
      </div>

      {detectedPrices.length > 0 && (
        <div className="prices-list">
          <div className="prices-list-header">
            <h3>All Items ({detectedPrices.length})</h3>
            <p className="prices-hint">Tap avatars to assign. Tap price to edit.</p>
          </div>
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
                    {editingId === item.id ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        className="price-edit-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        onBlur={commitEdit}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="price-value-large"
                        onClick={() => startEditing(item)}
                      >
                        ${item.price.toFixed(2)}
                      </div>
                    )}
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

      <div className="manual-input-section">
        <label className="input-label">
          <span>Tax Amount ($)</span>
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
                <button type="button" onClick={() => setTipPercentage('15')} className="quick-tip-btn">15%</button>
                <button type="button" onClick={() => setTipPercentage('18')} className="quick-tip-btn">18%</button>
                <button type="button" onClick={() => setTipPercentage('20')} className="quick-tip-btn">20%</button>
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

      {hasData && (
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

      {grandTotal > 0 && (
        <div className="total-display">
          <div className="total-line">
            <span>Grand Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {whoPaid && grandTotal > 0 && (
        <div className="payment-summary">
          <h3 className="payment-summary-title">Payment Summary</h3>
          {whoPaid === 'person1' ? (
            totals.person2Final > 0 ? (
              <div className="payment-message">
                <span className="payment-amount">${totals.person2Final.toFixed(2)}</span>
                <span className="payment-text">{person2Name} owes {person1Name}</span>
              </div>
            ) : (
              <div className="payment-message balanced">
                <span className="payment-text">All settled! {person1Name} paid and no one owes anything.</span>
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
                <span className="payment-text">All settled! {person2Name} paid and no one owes anything.</span>
              </div>
            )
          )}
        </div>
      )}

      {hasData && (
        <div className="action-buttons-row">
          <button onClick={onReset} className="action-button reset-button">
            Reset - New Bill
          </button>
        </div>
      )}

      {grandTotal > 0 && (
        <div className="sticky-summary">
          <div className="sticky-person">
            <span className="sticky-name">{person1Name}</span>
            <span className="sticky-amount person1-color">${totals.person1Final.toFixed(2)}</span>
          </div>
          <div className="sticky-total">
            <span className="sticky-total-label">Total</span>
            <span className="sticky-total-amount">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="sticky-person">
            <span className="sticky-name">{person2Name}</span>
            <span className="sticky-amount person2-color">${totals.person2Final.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisualBillSplitter
