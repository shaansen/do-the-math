import { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import VisualBillSplitter from './components/VisualBillSplitter'
import BillSummary from './components/BillSummary'
import './App.css'

function App() {
  const [billImage, setBillImage] = useState(null)
  const [billItems, setBillItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  const [person1Name, setPerson1Name] = useState('Shantanu')
  const [person2Name, setPerson2Name] = useState('Charlie')
  const [showSummary, setShowSummary] = useState(false)

  const handleImageSelect = (image) => {
    setBillImage(image)
    setBillItems([])
    setShowSummary(false)
    setSubtotal(0)
    setTax(0)
    setTotal(0)
  }

  const handleItemsReady = (items, subtotalAmount, taxAmount, totalAmount) => {
    setBillItems(items)
    setSubtotal(subtotalAmount)
    setTax(taxAmount)
    setTotal(totalAmount)
    setShowSummary(true)
  }

  const resetBill = () => {
    setBillImage(null)
    setBillItems([])
    setSubtotal(0)
    setTax(0)
    setTotal(0)
    setShowSummary(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💳 Bill Splitter</h1>
        <p>Split your bills easily with your partner</p>
      </header>

      <main className="app-main">
        {!billImage ? (
          <ImageUpload
            onImageSelect={handleImageSelect}
            skipAutoProcess={true}
          />
        ) : (
          <div className="bill-container">
            <div className="names-input">
              <input
                type="text"
                placeholder="Your name"
                value={person1Name}
                onChange={(e) => setPerson1Name(e.target.value)}
                className="name-input"
              />
              <input
                type="text"
                placeholder="Partner's name"
                value={person2Name}
                onChange={(e) => setPerson2Name(e.target.value)}
                className="name-input"
              />
            </div>
            <VisualBillSplitter
              billImage={billImage}
              onItemsReady={handleItemsReady}
              person1Name={person1Name}
              person2Name={person2Name}
              onReset={resetBill}
            />
            {showSummary && billItems.length > 0 && (
              <>
                <BillSummary
                  items={billItems}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  person1Name={person1Name}
                  person2Name={person2Name}
                />
                <button onClick={resetBill} className="reset-button">
                  Start New Bill
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

