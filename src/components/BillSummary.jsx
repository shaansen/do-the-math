import { useMemo } from 'react'
import './BillSummary.css'

function BillSummary({ items, subtotal, tax, total, person1Name, person2Name }) {
  const { person1Total, person2Total, person1Items, person2Items, sharedItems, sharedTotal } = useMemo(() => {
    let p1Total = 0
    let p2Total = 0
    const p1Items = []
    const p2Items = []
    const shared = []
    let sharedSum = 0

    items.forEach(item => {
      if (item.assignment === 'person1') {
        p1Total += item.price
        p1Items.push(item)
      } else if (item.assignment === 'person2') {
        p2Total += item.price
        p2Items.push(item)
      } else {
        sharedSum += item.price
        shared.push(item)
      }
    })

    return {
      person1Total: p1Total,
      person2Total: p2Total,
      person1Items: p1Items,
      person2Items: p2Items,
      sharedItems: shared,
      sharedTotal: sharedSum
    }
  }, [items])

  // Calculate tax proportion based on item distribution
  const person1Subtotal = person1Total + (sharedTotal / 2)
  const person2Subtotal = person2Total + (sharedTotal / 2)
  const totalSubtotal = person1Subtotal + person2Subtotal

  const person1Tax = totalSubtotal > 0 ? (tax * person1Subtotal / totalSubtotal) : 0
  const person2Tax = totalSubtotal > 0 ? (tax * person2Subtotal / totalSubtotal) : tax - person1Tax

  const person1Final = person1Subtotal + person1Tax
  const person2Final = person2Subtotal + person2Tax

  return (
    <div className="bill-summary-container">
      <h2>Bill Summary</h2>
      
      <div className="summary-grid">
        <div className="summary-card person1-card">
          <h3>{person1Name}</h3>
          <div className="summary-details">
            <div className="summary-line">
              <span>Items:</span>
              <span>${person1Total.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Shared (50%):</span>
              <span>${(sharedTotal / 2).toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>${person1Subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Tax ({totalSubtotal > 0 ? ((person1Tax / tax) * 100).toFixed(1) : 0}%):</span>
              <span>${person1Tax.toFixed(2)}</span>
            </div>
            <div className="summary-line total-line">
              <span>Total:</span>
              <span>${person1Final.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="summary-card person2-card">
          <h3>{person2Name}</h3>
          <div className="summary-details">
            <div className="summary-line">
              <span>Items:</span>
              <span>${person2Total.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Shared (50%):</span>
              <span>${(sharedTotal / 2).toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>${person2Subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Tax ({totalSubtotal > 0 ? ((person2Tax / tax) * 100).toFixed(1) : 0}%):</span>
              <span>${person2Tax.toFixed(2)}</span>
            </div>
            <div className="summary-line total-line">
              <span>Total:</span>
              <span>${person2Final.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grand-total">
        <div className="grand-total-line">
          <span>Grand Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="grand-total-line">
          <span>Split Total:</span>
          <span>${(person1Final + person2Final).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default BillSummary



